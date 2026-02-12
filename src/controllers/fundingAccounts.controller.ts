import { Request, Response } from "express";
import { log } from "node:console";

const createRandomBalance = () => Math.floor(Math.random() * 500000) + 10000;

const fundingAccounts = async (req: Request, res: Response) => {
    log("funding-accounts headers::", req.headers);

    // Dummy data structure matching the AL 'FetchFundingAccounts' logic
    const dummyResponse = {
        tenantId: "chiizu-tenant-001",
        accounts: [
            {
                id: "ACC-001",
                name: "Main Operations Account",
                accountNumber: "1234567890",
                accountType: "Checking",
                currencyCode: "USD",
                balance: createRandomBalance(),
            },
            {
                id: "ACC-002",
                name: "Secondary Savings",
                accountNumber: "0987654321",
                accountType: "Savings",
                currencyCode: "USD",
                balance: createRandomBalance(),
            },
            {
                id: "ACC-003",
                name: "International Fund",
                accountNumber: "5566778899",
                accountType: "Checking",
                currencyCode: "CAD",
                balance: createRandomBalance(),
            }
        ]
    };

    // Sending 200 OK as this is a GET request for data retrieval
    res.status(200).json(dummyResponse);
};

export default fundingAccounts;