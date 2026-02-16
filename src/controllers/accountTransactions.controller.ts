import { Request, Response } from "express";
import { log } from "node:console";

const accountTransactions = async (req: Request, res: Response) => {
    const { accountId } = req.params;

    log("account-transactions headers::", req.params);

    // Logic to fetch transactions from your database for this specific account
    // Example Mock Data:
    const transactions = [
        {
            id: "TXN-001",
            date: "2026-02-10",
            description: "Vendor Payment - Acme Corp",
            amount: -150.00
        },
        {
            id: "TXN-002",
            date: "2026-02-11",
            description: "Customer Deposit - Chiizu Service",
            amount: 1200.50
        }
    ];

    // Wrap the array in a "transactions" object as expected by the BC code
    res.status(200).json({
        accountId: accountId,
        transactions: transactions
    });
};

export default accountTransactions;