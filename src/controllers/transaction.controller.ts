import { Request, Response } from "express";

import ITransaction from "../types/transaction";
import { log } from "node:console";

const createTransaction = (req: Request, res: Response) => {
    //const { amount, currency, description } = req.body;
    log(req.body);
    const transaction: ITransaction = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        ...req.body
    };


    return res.status(201).json({
        message: "Transaction created",
        data: transaction,
    });
};

export default createTransaction;