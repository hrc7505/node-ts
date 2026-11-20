import { Request, Response } from "express";
import { log } from "node:console";

const fundingAccounts = async (req: Request, res: Response) => {
    log("funding-accounts headers::", req.headers);

    const nowIso = new Date().toISOString();

    // Data structure matching the AL 'FetchFundingAccounts' & 'MapFundingAccountFromJson' logic
    const dummyResponse = {
        tenantId: "chiizu-tenant-001",
        accounts: [
            {
                id: "RBC-OPER",
                name: "RBC Operating Account",
                accountNumber: "01234-003-1012345",
                accountType: "Checking",
                currencyCode: "CAD",
                balance: 186420.55,
                current_balance: 186420.55,
                availableBalanceBeforeOverdraft: 186420.55,
                overdraftAllowance: 25000,
                overdraftLimit: 25000,
                availableIncludingOverdraft: 211420.55,
                availableBalanceWithOverdraft: 211420.55,
                readTime: nowIso,
                updatedAt: nowIso,
                timestamp: nowIso
            },
            {
                id: "RBC-PAYROLL",
                name: "RBC Payroll Account",
                accountNumber: "01234-003-1012353",
                accountType: "Checking",
                currencyCode: "CAD",
                balance: 48250.00,
                current_balance: 48250.00,
                availableBalanceBeforeOverdraft: 48250.00,
                overdraftAllowance: 0,
                overdraftLimit: 0,
                availableIncludingOverdraft: 48250.00,
                availableBalanceWithOverdraft: 48250.00,
                readTime: nowIso,
                updatedAt: nowIso,
                timestamp: nowIso
            },
            {
                id: "RBC-USD",
                name: "RBC U.S. Dollar Account",
                accountNumber: "01234-003-4012361",
                accountType: "Checking",
                currencyCode: "USD",
                balance: 62310.00,
                current_balance: 62310.00,
                availableBalanceBeforeOverdraft: 62310.00,
                overdraftAllowance: 0,
                overdraftLimit: 0,
                availableIncludingOverdraft: 62310.00,
                availableBalanceWithOverdraft: 62310.00,
                readTime: nowIso,
                updatedAt: nowIso,
                timestamp: nowIso
            }
        ]
    };

    // Sending 200 OK as this is a GET request for data retrieval
    res.status(200).json(dummyResponse);
};

export default fundingAccounts;