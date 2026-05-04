import { Request, Response } from "express";
import { log } from "node:console";

const accountTransactions = async (req: Request, res: Response) => {
    const { accountId } = req.params;

    // Grab the start and end dates sent by Business Central
    const { start, end } = req.query;

    log(`Fetching transactions for ${accountId} from ${start} to ${end}`);

    // UPDATED MOCK DATA: 
    const allTransactions = [
        {
            id: "UTR01",
            date: "2026-05-01",
            description: "Microsoft Corporation - Payment for Invoice #108235",
            amount: -451.60
        },
        // You can add more mock transactions here later
    ];

    // Optional: Filter the mock data based on the dates BC requested
    // (If you just want it to return the mock data no matter what, you can skip this filter)
    const filteredTransactions = allTransactions.filter(txn => {
        if (!start || !end) return true;
        return txn.date >= (start as string) && txn.date <= (end as string);
    });

    res.status(200).json({
        accountId: accountId,
        transactions: filteredTransactions,
    });
};

export default accountTransactions;