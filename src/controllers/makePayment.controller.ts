import { Request, Response } from "express";
import { log } from "node:console";

import sendWebhook from "../services/webhookService";

type WebhookPayload = {
    batches: Array<{
        batchId: string;
        status: 'Paid';
        paymentReference: string;
    }>;
};

const makePayment = async (req: Request, res: Response) => {
    const { callbackUrl, batches } = req.body;

    if (!callbackUrl || !Array.isArray(batches)) {
        return res.status(400).json({ error: "Invalid payload" });
    }

    for (const batch of batches) {
        //saveBatch(batch);

        setTimeout(async () => {
            await sendWebhook(callbackUrl, {
                batchId: batch.batchId,
                status: "Paid",
                paymentReference: "chiizu_pr_" + crypto.randomUUID()
            });
        }, 5000);
    }

    res.status(201).json({
        status: "Processing",
        batchCount: batches.length
    });
};

export default makePayment;
