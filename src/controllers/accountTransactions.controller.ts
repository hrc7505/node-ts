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

    // Bank-feed transactions per account
    const transactionsByAccount: Record<string, Array<{ id: string; date: string; description: string; amount: number; status: string }>> = {
        "RBC-OPER": [
            // CHIIZU PAYMENT: the demo run, settled on the requested date.
            { id: "UTR-OPR-01", date: todayStr, description: "First Up Consultants - Inv #108235", amount: -451.60, status: "POSTED" },
            { id: "UTR-OPR-02", date: todayStr, description: "Wide World Importers - Inv #108236", amount: -1200.00, status: "POSTED" },
            { id: "UTR-OPR-03", date: todayStr, description: "Graphic Design Institute - Inv #108237", amount: -2875.40, status: "POSTED" },
            // Everything else: unrelated activity, so reconciliation has something left to explain.
            { id: "UTR-OPR-04", date: formatDate(-1), description: "Adatum Corporation - Customer payment Inv #103021", amount: 8450.00, status: "POSTED" },
            { id: "UTR-OPR-05", date: formatDate(-2), description: "Stripe Payout", amount: 5432.10, status: "POSTED" },
            { id: "UTR-OPR-06", date: formatDate(-3), description: "Lakeshore Properties - Office lease, November", amount: -6500.00, status: "POSTED" },
            { id: "UTR-OPR-07", date: formatDate(-4), description: "City Hydro - Electricity, October", amount: -412.37, status: "POSTED" },
            { id: "UTR-OPR-08", date: formatDate(-5), description: "Transfer to RBC Payroll Account", amount: -42000.00, status: "POSTED" },
            { id: "UTR-OPR-09", date: formatDate(-6), description: "Trey Research - Customer payment Inv #103018", amount: 12300.00, status: "POSTED" },
            { id: "UTR-OPR-10", date: formatDate(-7), description: "Monthly account fee", amount: -45.00, status: "POSTED" },
            { id: "UTR-OPR-11", date: formatDate(-9), description: "CRA - GST/HST remittance, October", amount: -7840.22, status: "POSTED" },
            { id: "UTR-OPR-12", date: formatDate(-10), description: "Harbourview Insurance - Business policy, November", amount: -1125.00, status: "POSTED" },
        ],
        "RBC-PAYROLL": [
            { id: "UTR-PAY-01", date: formatDate(-5), description: "Transfer from RBC Operating Account", amount: 42000.00, status: "POSTED" },
            { id: "UTR-PAY-02", date: formatDate(-5), description: "Payroll - Nov 15 pay run", amount: -36412.88, status: "POSTED" },
            { id: "UTR-PAY-03", date: formatDate(-3), description: "CRA - Payroll source deductions, Nov 15 pay run", amount: -9870.45, status: "POSTED" },
            { id: "UTR-PAY-04", date: formatDate(-1), description: "Group benefits premium - November", amount: -2310.00, status: "POSTED" },
        ],
        "RBC-USD": [
            { id: "UTR-USD-01", date: formatDate(-2), description: "Relecloud - Customer payment Inv #103025", amount: 15750.00, status: "POSTED" },
            { id: "UTR-USD-02", date: formatDate(-4), description: "Fabrikam, Inc. - Inv #108229 (wire)", amount: -3960.00, status: "POSTED" },
            { id: "UTR-USD-03", date: formatDate(-4), description: "Outgoing wire fee", amount: -45.00, status: "POSTED" },
            { id: "UTR-USD-04", date: formatDate(-8), description: "Nod Publishers - Inv #108221 (wire)", amount: -1240.00, status: "POSTED" },
        ],
    };

    const allTransactions = transactionsByAccount[accountId as string] || [];

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
