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
                id: "CHECKING",
                name: "Operating Checking Account",
                accountNumber: "CHECKING",
                accountType: "Checking",
                currencyCode: "CAD",
                balance: 100000,
                current_balance: 75000,
                availableBalanceBeforeOverdraft: 75000,
                overdraftAllowance: 25000,
                overdraftLimit: 25000,
                availableIncludingOverdraft: 100000,
                availableBalanceWithOverdraft: 100000,
                readTime: nowIso,
                updatedAt: nowIso,
                timestamp: nowIso
            },
            {
                id: "ACC-001",
                name: "Main Operations Account",
                accountNumber: "1234567890",
                accountType: "Checking",
                currencyCode: "USD",
                balance: 50000,
                current_balance: 50000,
                availableBalanceBeforeOverdraft: 50000,
                overdraftAllowance: 10000,
                overdraftLimit: 10000,
                availableIncludingOverdraft: 60000,
                availableBalanceWithOverdraft: 60000,
                readTime: nowIso,
                updatedAt: nowIso,
                timestamp: nowIso
            },
            {
                id: "ACC-002",
                name: "Secondary Savings",
                accountNumber: "0987654321",
                accountType: "Savings",
                currencyCode: "USD",
                balance: 100000,
                current_balance: 100000,
                availableBalanceBeforeOverdraft: 100000,
                overdraftAllowance: 0,
                overdraftLimit: 0,
                availableIncludingOverdraft: 100000,
                availableBalanceWithOverdraft: 100000,
                readTime: nowIso,
                updatedAt: nowIso,
                timestamp: nowIso
            },
            {
                id: "ACC-003",
                name: "International Fund",
                accountNumber: "5566778899",
                accountType: "Checking",
                currencyCode: "CAD",
                balance: 80000,
                current_balance: 80000,
                availableBalanceBeforeOverdraft: 80000,
                overdraftAllowance: 20000,
                overdraftLimit: 20000,
                availableIncludingOverdraft: 100000,
                availableBalanceWithOverdraft: 100000,
                readTime: nowIso,
                updatedAt: nowIso,
                timestamp: nowIso
            },
            {
                id: "WWI-OPERATING",
                name: "WWI Operating Account",
                accountNumber: "WWI-OPERATING",
                accountType: "Checking",
                currencyCode: "CAD",
                balance: 100000,
                current_balance: 75000,
                availableBalanceBeforeOverdraft: 75000,
                overdraftAllowance: 25000,
                overdraftLimit: 25000,
                availableIncludingOverdraft: 100000,
                availableBalanceWithOverdraft: 100000,
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