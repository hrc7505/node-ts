import { Request, Response } from "express";
import { log } from "node:console";

const accountTransactions = async (req: Request, res: Response) => {
    const { accountId } = req.params;

    log("account-transactions headers::", req.headers);

    res.status(200).json({
        accountId: accountId,
        transactions: [
            {
                id: "TXN-101",
                date: "2026-02-10",
                description: "Vendor Payment - ABC Corp",
                amount: -1250.00,
                status: "Settled"
            },
            {
                id: "TXN-102",
                date: "2026-02-11",
                description: "Customer Deposit - XYZ Ltd",
                amount: 500.00,
                status: "Settled"
            },
            {
                id: "TXN-103",
                date: "2026-02-12",
                description: "Monthly Service Fee",
                amount: -15.00,
                status: "Settled"
            }
        ]
    });
};

export default accountTransactions;