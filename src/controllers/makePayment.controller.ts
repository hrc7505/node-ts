import { Request, Response } from "express";

import sendWebhook from "../services/webhookService";
import { log } from "node:console";
import { Resend } from "resend";

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
    bankAccountNo: string;
};

const makePayment = async (req: Request<any, any, RequestBody>, res: Response) => {
    const { callbackUrl, batches, bankAccountNo } = req.body;

    log("makePayment bankAccountNo::", bankAccountNo);
    log("makePayment batches::", batches);
    log("makePayment callbackUrl::", callbackUrl);

    const resend = new Resend(process.env.RESEND_KEY!);

    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'harsimrat@mintyfusion.com',
        subject: 'Payment Initiated',
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                    <h2 style="color: #333;">Payment Initiated</h2>
                    <p style="color: #666;">Here is the structured data you requested:</p>
                    <pre style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 14px;">
                        <code>${JSON.stringify(req.body, null, 2)}</code>
                    </pre>
                </div>`,
    });

    batches.forEach(batch => {
        log(`Batch ID: ${batch.batchId}, Vendor No: ${batch.vendorNo}, Invoices: ${JSON.stringify(batch.invoices)}`);
    });

    if (!callbackUrl || !Array.isArray(batches)) {
        return res.status(400).json({ error: "Invalid payload" });
    }

    /*     for (const batch of batches) {
            //saveBatch(batch);
    
            setTimeout(async () => {
                await sendWebhook(callbackUrl, {
                    batchId: batch.batchId,
                    status: "Paid",
                    paymentReference: "chiizu_pr_" + crypto.randomUUID()
                });
            }, 5000);
        } */

    res.status(201).json({
        status: "Processing",
        acceptedBatches: batches.map(batch => batch.batchId)
    });
};

export default makePayment;
