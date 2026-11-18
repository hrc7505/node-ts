import { Request, Response } from "express";
import { log } from "node:console";

const accountTransactions = async (req: Request, res: Response) => {
    const { accountId } = req.params;

    // Grab the start date and page number sent by Business Central
    // The AL code sends 'startDate' and 'page'
    const { startDate, page } = req.query;
    const pageNumber = parseInt((page as string) || "1", 10);

    log(`Fetching transactions for ${accountId} from ${startDate}, page ${pageNumber}`);

    // Transactions with 'status: "POSTED"' so Business Central FLOStatementImport classifies and imports them
    const allTransactions = [
        { id: "UTR01", date: "2026-05-01", description: "First Up Consultants - Inv #108235", amount: -451.60, status: "POSTED" },
        { id: "UTR02", date: "2026-05-02", description: "Wide World Importers - Payment", amount: -1200.00, status: "POSTED" },
        { id: "UTR03", date: "2026-05-03", description: "Stripe Payout", amount: 5432.10, status: "POSTED" },
        { id: "UTR04", date: "2026-05-04", description: "Office Lease", amount: -2500.00, status: "POSTED" },
        { id: "UTR05", date: "2026-05-05", description: "Consulting Services", amount: 3000.00, status: "POSTED" },
    ];

    // --- PAGING LOGIC ---
    const pageSize = 10;
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const pageTransactions = allTransactions.slice(startIndex, endIndex);

    res.status(200).json({
        accountId: accountId,
        // Empty array [] when no more data terminates the pagination loop in Business Central
        transactions: pageTransactions,
    });
};

export default accountTransactions;
