import { Request, Response } from "express";
import { log } from "node:console";

const cancelScheduledPayment = async (req: Request, res: Response) => {
    log("cancelScheduledPayment body::", req.body);

    res.status(201).json({
        isCancelled: true,
        batchId: req.body.batchId,
        invoiceNo: req.body.invoiceNo,
    });
};

export default cancelScheduledPayment;
