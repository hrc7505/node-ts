import { Request, Response } from "express";
import { log } from "node:console";
import { waitUntil } from "@vercel/functions";
import sendWebhook from "../services/webhookService";
import { savePayment, getPayment, PaymentRecord } from "../store/batchStore";

const WEBHOOK_DELAY_MS = process.env.WEBHOOK_DELAY_MS ? parseInt(process.env.WEBHOOK_DELAY_MS) : 5000;

// Helper to reliably execute delayed background work on Vercel Serverless & Local Node
function runInBackground(asyncFn: () => Promise<void>) {
    const taskPromise = asyncFn().catch(err => {
        console.error("Background task error:", err);
    });

    try {
        // Vercel Serverless environment: keeps container alive after res.send()
        waitUntil(taskPromise);
    } catch {
        // Local / standard Node.js environment fallback
    }
}

export const createPayments = async (req: Request, res: Response) => {
    log("\n📥 [POST /payments] Received payment request from Business Central");
    log("Headers:", JSON.stringify(req.headers));
    log("Body:", JSON.stringify(req.body, null, 2));

    const { requestId, idempotencyKey, callbackUrl, payments, source } = req.body;

    if (!callbackUrl) {
        return res.status(400).json({ error: "callbackUrl is required." });
    }

    if (!Array.isArray(payments) || payments.length === 0) {
        return res.status(400).json({ error: "payments array cannot be empty." });
    }

    const batchId = `CBATCH-${Date.now()}`;
    const responsePayments: any[] = [];

    payments.forEach((p: any, index: number) => {
        const chiizuPaymentId = `CPAY-${Date.now()}-${index + 1}`;
        const paymentId = p.paymentId || p.idempotencyKey || `PMT-${index + 1}`;

        const paymentRecord: PaymentRecord = {
            paymentId,
            chiizuPaymentId,
            batchId,
            status: "PENDING",
            amount: p.amount,
            sourceDocument: p.sourceDocument,
            callbackUrl,
            createdAt: new Date().toISOString()
        };

        savePayment(paymentRecord);

        responsePayments.push({
            paymentId,
            chiizuPaymentId,
            status: "PENDING",
            estimatedSettlementDate: new Date(Date.now() + 86400000).toISOString()
        });

        // ⏱️ Run delayed webhook using Vercel waitUntil (Prevents serverless freeze)
        runInBackground(async () => {
            log(`⏳ [${new Date().toISOString()}] Scheduling webhook for ${chiizuPaymentId} in ${WEBHOOK_DELAY_MS / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, WEBHOOK_DELAY_MS));

            log(`\n⏰ [${new Date().toISOString()}] Settling Payment ${chiizuPaymentId} & firing webhook...`);
            const settledAt = new Date().toISOString();
            paymentRecord.status = "SUCCEEDED";
            paymentRecord.settledAt = settledAt;
            savePayment(paymentRecord);

            const webhookPayload = {
                eventId: `EVT-${Date.now()}`,
                eventType: "payment.succeeded",
                paymentId: chiizuPaymentId,
                status: "SUCCEEDED",
                batchId: batchId,
                sourceDocument: paymentRecord.sourceDocument,
                amount: paymentRecord.amount,
                timestamp: settledAt
            };

            await sendWebhook(callbackUrl, webhookPayload);
        });
    });

    // Immediate synchronous response (PROCESSING / PENDING)
    return res.status(201).json({
        success: true,
        batchId: batchId,
        status: "PROCESSING",
        payments: responsePayments
    });
};

export const getPaymentStatus = async (req: Request, res: Response) => {
    const paymentId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    log(`🔍 [GET /payments/${paymentId}] Checking payment status`);

    const record = getPayment(paymentId);
    if (!record) {
        return res.status(200).json({
            paymentId: paymentId,
            chiizuPaymentId: paymentId,
            status: "SUCCEEDED",
            message: "Payment settled."
        });
    }

    return res.status(200).json({
        paymentId: record.paymentId,
        chiizuPaymentId: record.chiizuPaymentId,
        status: record.status,
        batchId: record.batchId,
        amount: record.amount,
        createdAt: record.createdAt,
        settledAt: record.settledAt
    });
};

export const manualSettlePayment = async (req: Request, res: Response) => {
    const paymentId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const record = getPayment(paymentId);
    if (!record) {
        return res.status(404).json({ error: "Payment not found" });
    }

    record.status = "SUCCEEDED";
    record.settledAt = new Date().toISOString();
    savePayment(record);

    const webhookPayload = {
        eventId: `EVT-${Date.now()}`,
        eventType: "payment.succeeded",
        paymentId: record.chiizuPaymentId,
        status: "SUCCEEDED",
        batchId: record.batchId,
        sourceDocument: record.sourceDocument,
        amount: record.amount,
        timestamp: record.settledAt
    };

    await sendWebhook(record.callbackUrl, webhookPayload);
    return res.json({ success: true, message: "Webhook fired manually", record });
};

export default {
    createPayments,
    getPaymentStatus,
    manualSettlePayment
};
