import { Request, Response } from "express";

import sendWebhook from "../services/webhookService";

type WebhookPayload = {
    batches: Array<{
        batchId: string;
        status: 'Paid' | 'Failed';
        paymentReference: string;
    }>;
};

type RequestBody = {
    callbackUrl: string;
    batches: Array<{
        batchId: string;
        invoices: any[];
        vendorNo: string;
    }>;
};

const makePayment = async (req: Request<any, any, RequestBody>, res: Response) => {
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
        acceptedBatches: batches.map(batch => batch.batchId)
    });
};

export default makePayment;
