import { Request, Response } from "express";

import { log } from "node:console";

type RequestBody = {
    callbackUrl: string;
    batches: Array<{
        batchId: string;
        invoices: any[];
        vendorNo: string;
    }>;
    bankAccountNo: string;
    scheduleDate: string; // ISO date string
};

const schedulePayment = async (req: Request<any, any, RequestBody>, res: Response) => {
    const { callbackUrl, batches, bankAccountNo, scheduleDate } = req.body;

    log("schedulePayment bankAccountNo::", bankAccountNo);
    log("schedulePayment batches::", batches);
    log("schedulePayment callbackUrl::", callbackUrl);
    log("schedulePayment scheduleDate::", scheduleDate);

    if (!callbackUrl || !Array.isArray(batches)) {
        return res.status(400).json({ error: "Invalid payload" });
    }

    res.status(201).json({
        status: "Scheduled",
        acceptedBatches: batches.map(batch => batch.batchId),
        scheduleDate,
    });
};

export default schedulePayment;
