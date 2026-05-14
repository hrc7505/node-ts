import { Request, Response } from "express";
import { log } from "node:console";

const accountTransactions = async (req: Request, res: Response) => {
    const { accountId } = req.params;

    // Grab the start date and page number sent by Business Central
    // The AL code sends 'startDate' and 'page'
    const { startDate, page } = req.query;
    const pageNumber = parseInt(page as string || '1', 10);

    log(`Fetching transactions for ${accountId} from ${startDate}, page ${pageNumber}`);

    // MOCK DATA: A larger set to demonstrate paging.
    // In a real app, this data would come from a database.
    const allTransactions = [
        { id: "UTR01", date: "2026-05-01", description: "Microsoft - Inv #108235", amount: -451.60 },
        { id: "UTR02", date: "2026-05-02", description: "Amazon Web Services", amount: -1200.00 },
        { id: "UTR03", date: "2026-05-03", description: "Stripe Payout", amount: 5432.10 },
        { id: "UTR04", date: "2026-05-04", description: "Office Lease", amount: -2500.00 },
        { id: "UTR05", date: "2026-05-05", description: "Consulting Services", amount: 3000.00 },
    ];

    // --- PAGING LOGIC ---
    // In a real application, your database query would handle this (e.g., with LIMIT and OFFSET).
    const pageSize = 2; // Let's say we return 2 transactions per page for this example.
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const pageTransactions = allTransactions.slice(startIndex, endIndex);

    res.status(200).json({
        accountId: accountId,
        // This will be an empty array [] for pages that have no more data,
        // which will correctly terminate the loop in Business Central.
        transactions: pageTransactions,
    });
};

export default accountTransactions;
