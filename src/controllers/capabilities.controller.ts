import { Request, Response } from "express";
import { log } from "node:console";

export const getAccountCapabilities = async (req: Request, res: Response) => {
    const accountId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    log(`🔎 [GET /accounts/${accountId}/capabilities] Checking capabilities for account`);

    const capabilities = [
        {
            paymentMethod: "EFT",
            available: true,
            currency: "CAD",
            minAmount: 1.0,
            maxAmount: 100000.0,
            reason: ""
        },
        {
            paymentMethod: "INTERAC",
            available: true,
            currency: "CAD",
            minAmount: 1.0,
            maxAmount: 3000.0,
            reason: ""
        },
        {
            paymentMethod: "WIRE",
            available: true,
            currency: "USD",
            minAmount: 100.0,
            maxAmount: 1000000.0,
            reason: ""
        }
    ];

    return res.status(200).json({
        success: true,
        accountRefId: accountId,
        capabilityVersion: "2026-v1",
        capabilities
    });
};

export default {
    getAccountCapabilities
};
