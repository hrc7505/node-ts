import { Request, Response } from "express";
import { log } from "node:console";

const accountTransactions = async (req: Request, res: Response) => {
    const { accountId } = req.params;

    log("account-transactions headers::", req.params);

    // UPDATED MOCK DATA: 
    // These amounts and dates now match the Ledger Entries in image_2565d1.png
    const transactions = [
        {
            id: "UTR01", // Using the Ext. Doc No seen in BC for better matching
            date: "2026-05-01", // Matches Posting Date for Fabrikam, Inc.
            description: "Microsoft Corporation - Payment for Invoice #108235", // Matches the description in BC
            amount: -451.60 // Exact match for Ledger Entry amount
        },
    ];

    // Important: For the reconciliation math to balance (Total Difference = 0), 
    // your Chiizu API 'balance' should also be the sum of these movements 
    // plus the opening balance. In this case: -2,228.50.

    res.status(200).json({
        accountId: accountId,
        transactions: transactions
    });
};

export default accountTransactions;