import { Request, Response } from "express";

import ITransaction from "../types/transaction";
import { log } from "node:console";

const statuses = ["Scheduled", "Processing", "Paid", "Failed", "Cancelled"];

const createTransaction = (req: Request, res: Response) => {
    log("HEADERS:", req.headers);
    log("BODY", req.body);

    const randomIndex = Math.floor(Math.random() * statuses.length);
    const status = statuses[randomIndex];

    const transaction: ITransaction = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        ...req.body?.invoices.map((invoice: any) => ({ ...invoice, status })),
    };

    return res.status(201).json({
        message: "Transaction created",
        data: transaction,
    });
};

export default createTransaction;