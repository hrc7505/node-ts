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

export const queryPaymentCapabilities = async (req: Request, res: Response) => {
    const { vendorNo, currency, amount, vendorEnabled, destination } = req.body || {};
    log(`🔎 [POST /payments/capabilities] Evaluating capabilities for vendor: ${vendorNo}, currency: ${currency || 'CAD'}, amount: ${amount}`);

    const isEnabled = vendorEnabled !== false;

    const capabilities = [
        {
            railCode: "EFT",
            railName: "Canadian EFT",
            eligible: isEnabled,
            reasonCode: isEnabled ? "NONE" : "VENDOR_DISABLED",
            reasonText: isEnabled ? "Eligible for Canadian EFT disbursement" : "Vendor is not enabled for Chiizu payments.",
            minAmount: 0.01,
            maxAmount: 500000.0,
            feeAmount: 0.50,
            currencyCode: "CAD",
            estimatedSettlement: "1-2 Business Days",
            missingRequirements: ""
        },
        {
            railCode: "INTERAC",
            railName: "Interac e-Transfer",
            eligible: isEnabled,
            reasonCode: isEnabled ? "NONE" : "VENDOR_DISABLED",
            reasonText: isEnabled ? "Eligible for instant Interac payout" : "Vendor is not enabled for Chiizu payments.",
            minAmount: 0.01,
            maxAmount: 10000.0,
            feeAmount: 1.50,
            currencyCode: "CAD",
            estimatedSettlement: "Real-time (minutes)",
            missingRequirements: ""
        },
        {
            railCode: "WIRE",
            railName: "Wire Transfer",
            eligible: isEnabled,
            reasonCode: isEnabled ? "NONE" : "VENDOR_DISABLED",
            reasonText: isEnabled ? "Eligible for domestic and international Wire" : "Vendor is not enabled for Chiizu payments.",
            minAmount: 100.0,
            maxAmount: 1000000.0,
            feeAmount: 15.00,
            currencyCode: "CAD",
            estimatedSettlement: "Same day / Next business day",
            missingRequirements: ""
        }
    ];

    return res.status(200).json({
        success: true,
        vendorNo,
        capabilities
    });
};

export default {
    getAccountCapabilities,
    queryPaymentCapabilities
};
