import { Request, Response } from "express";

import { log } from "node:console";
import { getBatch, saveBatch } from "../store/batchStore";
import sendWebhook from "../services/webhookService";
import createSignature from "../utils/createSignature";

const makePayment = (req: Request, res: Response) => {
    log("makePayment headers::",req.headers);
    log("makePayment body::",req.body);
    const { batchId, callbackUrl, invoices } = req.body;

    if (!batchId || !callbackUrl || !Array.isArray(invoices)) {
        throw new Error('Invalid payload');
    }

    // 🔒 Idempotency check
    const existing = getBatch(batchId);
    if (existing) {
        return res.status(400).json({
            batchId,
            status: existing.status
        });
    }

    // Save as PROCESSING
    saveBatch({
        batchId,
        callbackUrl,
        invoices,
        status: "Processing"
    });

    const paymentReference = "chiizu_pr_" + crypto.randomUUID();

    // Simulate async success
    const t = setTimeout(async () => {
        clearTimeout(t);
        const signature = createSignature(req.body, process.env.CHIIZU_BC_WEBHOOK_SECRET!);
        await sendWebhook(
            callbackUrl,
            {
                batchId,
                status: "Paid",
                paymentReference,
            },
            signature
        );
    }, 10000);

    return res.status(201).json({
        batchId,
        status: "Processing"
    });
};

export default makePayment;