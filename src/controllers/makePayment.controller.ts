import { Request, Response } from "express";
import { log } from "node:console";

import { getBatch, saveBatch } from "../store/batchStore";
import sendWebhook from "../services/webhookService";

type WebhookPayload = {
    batches: Array<{
        batchId: string;
        status: 'Paid';
        paymentReference: string;
    }>;
};

const makePayment = (req: Request, res: Response) => {
    try {
        log("makePayment headers::", req.headers);
        log("makePayment body::", req.body);

        const { callbackUrl, batches } = req.body;

        if (!callbackUrl || !Array.isArray(batches) || batches.length === 0) {
            throw new Error("Invalid payload: callbackUrl and batches required");
        }

        const webhookPayload: WebhookPayload = {
            batches: []
        };

        // 🔒 Idempotency + validation
        for (const batch of batches) {
            if (!batch.batchId || !batch.vendorNo || !Array.isArray(batch.invoices)) {
                throw new Error("Invalid batch structure");
            }

            const existing = getBatch(batch.batchId);
            if (existing) {
                return res.status(400).json({
                    batchId: batch.batchId,
                    status: existing.status
                });
            }

            saveBatch({
                batchId: batch.batchId,
                vendorNo: batch.vendorNo,
                invoices: batch.invoices,
                callbackUrl,
                status: "Processing"
            });

            const paymentReference = "chiizu_pr_" + crypto.randomUUID();

            webhookPayload.batches.push({
                batchId: batch.batchId,
                status: "Paid",
                paymentReference
            });
        }

        log("callbackUrl:", callbackUrl);

        // 🔁 Simulate async settlement
        const t = setTimeout(async () => {
            log("Sending webhook for batches:", batches.map(b => b.batchId));

            await sendWebhook(callbackUrl, webhookPayload);

            clearTimeout(t);
        }, 10000);

        return res.status(201).json({
            status: "Processing",
            batches: batches.map((b: any) => ({
                batchId: b.batchId,
                status: "Processing"
            }))
        });
    } catch (error) {
        log("makePayment error::", error);
        return res.status(400).json({ error: (error as Error).message });
    }
};

export default makePayment;
