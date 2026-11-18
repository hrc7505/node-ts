import { Request, Response } from "express";
import { log } from "node:console";

const accountTransactions = async (req: Request, res: Response) => {
    const { accountId } = req.params;

    // Grab the start date and page number sent by Business Central
    // The AL code sends 'startDate' and 'page'
    const { startDate, page } = req.query;
    const pageNumber = parseInt((page as string) || "1", 10);

    log(`Fetching transactions for ${accountId} from ${startDate}, page ${pageNumber}`);

    // Get today's ISO date string (YYYY-MM-DD) so mock statements always align with today's demo date
    const today = new Date();
    const formatDate = (offsetDays: number = 0) => {
        const d = new Date(today);
        d.setDate(d.getDate() + offsetDays);
        return d.toISOString().split("T")[0];
    };

    const todayStr = formatDate(0);

    // Transactions with 'status: "POSTED"' so Business Central FLOStatementImport classifies and imports them
    const allTransactions = [
        { id: "UTR01", date: todayStr, description: "First Up Consultants - Inv #108235", amount: -451.60, status: "POSTED" },
        { id: "UTR02", date: todayStr, description: "Wide World Importers - Payment", amount: -1200.00, status: "POSTED" },
        { id: "UTR03", date: formatDate(-2), description: "Stripe Payout", amount: 5432.10, status: "POSTED" },
        { id: "UTR04", date: formatDate(-3), description: "Office Lease", amount: -2500.00, status: "POSTED" },
        { id: "UTR05", date: formatDate(-4), description: "Consulting Services", amount: 3000.00, status: "POSTED" },
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
