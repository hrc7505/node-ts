import { Request, Response } from "express";
import { log } from "node:console";

const cancelScheduledPayments = async (req: Request, res: Response) => {
    log("cancelScheduledPayments headers::", req.headers);
    log("cancelScheduledPayments body::", req.body);

    res.status(201).json({
        isCancelled: true,
    });
};

export default cancelScheduledPayments;
