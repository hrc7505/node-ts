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
        },
        {
            paymentMethod: "ACH",
            available: true,
            currency: "USD",
            minAmount: 0.01,
            maxAmount: 1000000.0,
            reason: ""
        },
        {
            paymentMethod: "SEPA",
            available: true,
            currency: "EUR",
            minAmount: 0.01,
            maxAmount: 500000.0,
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
    const { vendorNo, currency, amount, vendorEnabled, account } = req.body || {};
    const targetAccount = account;
    const reqCurrency = (currency || 'CAD').toUpperCase();
    const reqAmount = typeof amount === 'number' ? amount : (amount ? parseFloat(amount) : 0);
    log(`🔎 [POST /payments/capabilities] Evaluating capabilities for vendor: ${vendorNo}, currency: ${reqCurrency}, amount: ${reqAmount}`);

    const isEnabled = vendorEnabled !== false;

    // Helper: evaluate account active status
    const isAccountActive = targetAccount ? (targetAccount.active !== false) : true;
    const isAccountVerified = targetAccount ? (
        !targetAccount.verificationStatus ||
        targetAccount.verificationStatus.toUpperCase() === "VERIFIED"
    ) : true;

    // 1. CANADIAN EFT RAIL
    let eftEligible = isEnabled;
    let eftReasonCode = isEnabled ? "NONE" : "VENDOR_DISABLED";
    let eftReasonText = isEnabled ? "Eligible for Canadian EFT disbursement" : "Vendor is not enabled for Chiizu payments.";
    let eftMissingReqs = "";

    if (!isEnabled) {
        // already VENDOR_DISABLED
    } else if (currency && reqCurrency !== "CAD") {
        eftEligible = false;
        eftReasonCode = "CURRENCY_NOT_SUPPORTED";
        eftReasonText = `EFT requires CAD currency (requested: ${reqCurrency}).`;
        eftMissingReqs = "Change line currency to CAD, or use WIRE transfer for foreign currencies.";
    } else if (reqAmount > 0 && reqAmount > 500000.0) {
        eftEligible = false;
        eftReasonCode = "AMOUNT_LIMIT_EXCEEDED";
        eftReasonText = `Amount (${reqAmount}) exceeds Canadian EFT single limit ($500,000 CAD).`;
        eftMissingReqs = "Split transaction or use WIRE for high-value disbursements.";
    } else if (!isAccountActive) {
        eftEligible = false;
        eftReasonCode = "ACCOUNT_DISABLED";
        eftReasonText = "Payment account is marked inactive.";
        eftMissingReqs = "Activate payment account on Vendor Card > Chiizu tab.";
    } else if (targetAccount && targetAccount.type === "RECIPIENT") {
        eftEligible = false;
        eftReasonCode = "METHOD_NOT_SUPPORTED";
        eftReasonText = "EFT disbursement requires a vendor bank account, not a recipient handle.";
        eftMissingReqs = "Configure vendor bank account or select Interac e-Transfer rail.";
    } else if (!isAccountVerified) {
        eftEligible = false;
        eftReasonCode = "NOT_VERIFIED";
        eftReasonText = "Bank account is not verified with Chiizu.";
        eftMissingReqs = "Verify bank account through Chiizu verification wizard.";
    }

    // 2. INTERAC E-TRANSFER RAIL
    let interacEligible = isEnabled;
    let interacReasonCode = isEnabled ? "NONE" : "VENDOR_DISABLED";
    let interacReasonText = isEnabled ? "Eligible for instant Interac payout" : "Vendor is not enabled for Chiizu payments.";
    let interacMissingReqs = "";

    if (!isEnabled) {
        // already VENDOR_DISABLED
    } else if (currency && reqCurrency !== "CAD") {
        interacEligible = false;
        interacReasonCode = "CURRENCY_NOT_SUPPORTED";
        interacReasonText = `Interac requires CAD currency (requested: ${reqCurrency}).`;
        interacMissingReqs = "Change line currency to CAD.";
    } else if (reqAmount > 0 && reqAmount > 10000.0) {
        interacEligible = false;
        interacReasonCode = "AMOUNT_LIMIT_EXCEEDED";
        interacReasonText = `Amount (${reqAmount}) exceeds Interac maximum single limit ($10,000 CAD).`;
        interacMissingReqs = "Split payment or use Canadian EFT rail for amounts up to $500,000 CAD.";
    } else if (!isAccountActive) {
        interacEligible = false;
        interacReasonCode = "ACCOUNT_DISABLED";
        interacReasonText = "Payment account is marked inactive.";
        interacMissingReqs = "Activate payment account on Vendor Card > Chiizu tab.";
    } else if (targetAccount && targetAccount.type === "BANK_ACCOUNT" && !targetAccount.recipientIdentifier) {
        interacEligible = false;
        interacReasonCode = "MISSING_REQUIREMENT";
        interacReasonText = "No Interac recipient email or mobile handle specified for this account.";
        interacMissingReqs = "Add recipient email or mobile in Payment Accounts.";
    }

    // 3. WIRE / INTERNATIONAL RAIL
    let wireEligible = isEnabled;
    let wireReasonCode = isEnabled ? "NONE" : "VENDOR_DISABLED";
    let wireReasonText = isEnabled ? "Eligible for domestic and international Wire" : "Vendor is not enabled for Chiizu payments.";
    let wireMissingReqs = "";

    if (!isEnabled) {
        // already VENDOR_DISABLED
    } else if (reqAmount > 0 && reqAmount < 100.0) {
        wireEligible = false;
        wireReasonCode = "AMOUNT_LIMIT_EXCEEDED";
        wireReasonText = `Amount (${reqAmount}) is below Wire minimum ($100.00).`;
        wireMissingReqs = "Use EFT or Interac for transactions under $100.00.";
    } else if (reqAmount > 0 && reqAmount > 1000000.0) {
        wireEligible = false;
        wireReasonCode = "AMOUNT_LIMIT_EXCEEDED";
        wireReasonText = `Amount (${reqAmount}) exceeds Wire maximum single limit ($1,000,000).`;
        wireMissingReqs = "Contact Chiizu support to increase custom wire limit.";
    } else if (!isAccountActive) {
        wireEligible = false;
        wireReasonCode = "ACCOUNT_DISABLED";
        wireReasonText = "Payment account is marked inactive.";
        wireMissingReqs = "Activate payment account on Vendor Card > Chiizu tab.";
    } else if (targetAccount && targetAccount.type === "RECIPIENT") {
        wireEligible = false;
        wireReasonCode = "METHOD_NOT_SUPPORTED";
        wireReasonText = "Wire transfer requires a vendor bank account.";
        wireMissingReqs = "Configure vendor bank account with SWIFT/BIC coordinates.";
    } else if (!isAccountVerified) {
        wireEligible = false;
        wireReasonCode = "NOT_VERIFIED";
        wireReasonText = "Bank account is not verified with Chiizu.";
        wireMissingReqs = "Verify bank account through Chiizu verification wizard.";
    }

    // 4. US ACH RAIL
    let achEligible = isEnabled;
    let achReasonCode = isEnabled ? "NONE" : "VENDOR_DISABLED";
    let achReasonText = isEnabled ? "Eligible for US ACH disbursement" : "Vendor is not enabled for Chiizu payments.";
    let achMissingReqs = "";

    if (!isEnabled) {
        // already VENDOR_DISABLED
    } else if (currency && reqCurrency !== "USD" && reqCurrency !== "CAD") {
        achEligible = false;
        achReasonCode = "CURRENCY_NOT_SUPPORTED";
        achReasonText = `ACH requires USD currency (requested: ${reqCurrency}).`;
        achMissingReqs = "Change line currency to USD, or use WIRE transfer for foreign currencies.";
    } else if (reqAmount > 0 && reqAmount > 1000000.0) {
        achEligible = false;
        achReasonCode = "AMOUNT_LIMIT_EXCEEDED";
        achReasonText = `Amount (${reqAmount}) exceeds US ACH single limit ($1,000,000 USD).`;
        achMissingReqs = "Split transaction or use WIRE for high-value disbursements.";
    } else if (!isAccountActive) {
        achEligible = false;
        achReasonCode = "ACCOUNT_DISABLED";
        achReasonText = "Payment account is marked inactive.";
        achMissingReqs = "Activate payment account on Vendor Card > Chiizu tab.";
    } else if (targetAccount && targetAccount.type === "RECIPIENT") {
        achEligible = false;
        achReasonCode = "METHOD_NOT_SUPPORTED";
        achReasonText = "ACH disbursement requires a vendor bank account, not a recipient handle.";
        achMissingReqs = "Configure vendor bank account or select Interac e-Transfer rail.";
    } else if (!isAccountVerified) {
        achEligible = false;
        achReasonCode = "NOT_VERIFIED";
        achReasonText = "Bank account is not verified with Chiizu.";
        achMissingReqs = "Verify bank account through Chiizu verification wizard.";
    }

    // 5. EUROPEAN SEPA RAIL
    let sepaEligible = isEnabled;
    let sepaReasonCode = isEnabled ? "NONE" : "VENDOR_DISABLED";
    let sepaReasonText = isEnabled ? "Eligible for SEPA Credit Transfer" : "Vendor is not enabled for Chiizu payments.";
    let sepaMissingReqs = "";

    if (!isEnabled) {
        // already VENDOR_DISABLED
    } else if (currency && reqCurrency !== "EUR") {
        sepaEligible = false;
        sepaReasonCode = "CURRENCY_NOT_SUPPORTED";
        sepaReasonText = `SEPA requires EUR currency (requested: ${reqCurrency}).`;
        sepaMissingReqs = "Change line currency to EUR, or use WIRE transfer.";
    } else if (reqAmount > 0 && reqAmount > 500000.0) {
        sepaEligible = false;
        sepaReasonCode = "AMOUNT_LIMIT_EXCEEDED";
        sepaReasonText = `Amount (${reqAmount}) exceeds SEPA single limit (500,000 EUR).`;
        sepaMissingReqs = "Split transaction or use WIRE for high-value disbursements.";
    } else if (!isAccountActive) {
        sepaEligible = false;
        sepaReasonCode = "ACCOUNT_DISABLED";
        sepaReasonText = "Payment account is marked inactive.";
        sepaMissingReqs = "Activate payment account on Vendor Card > Chiizu tab.";
    } else if (targetAccount && targetAccount.type === "RECIPIENT") {
        sepaEligible = false;
        sepaReasonCode = "METHOD_NOT_SUPPORTED";
        sepaReasonText = "SEPA requires a vendor bank account.";
        sepaMissingReqs = "Configure vendor bank account with IBAN.";
    }

    const capabilities = [
        {
            railCode: "EFT",
            railName: "Canadian EFT",
            eligible: eftEligible,
            reasonCode: eftReasonCode,
            reasonText: eftReasonText,
            minAmount: 0.01,
            maxAmount: 500000.0,
            feeAmount: 0.50,
            currencyCode: "CAD",
            estimatedSettlement: "1-2 Business Days",
            missingRequirements: eftMissingReqs
        },
        {
            railCode: "INTERAC",
            railName: "Interac e-Transfer",
            eligible: interacEligible,
            reasonCode: interacReasonCode,
            reasonText: interacReasonText,
            minAmount: 0.01,
            maxAmount: 10000.0,
            feeAmount: 1.50,
            currencyCode: "CAD",
            estimatedSettlement: "Real-time (minutes)",
            missingRequirements: interacMissingReqs
        },
        {
            railCode: "WIRE",
            railName: "Wire Transfer",
            eligible: wireEligible,
            reasonCode: wireReasonCode,
            reasonText: wireReasonText,
            minAmount: 100.0,
            maxAmount: 1000000.0,
            feeAmount: 15.00,
            currencyCode: reqCurrency,
            estimatedSettlement: "Same day / Next business day",
            missingRequirements: wireMissingReqs
        },
        {
            railCode: "ACH",
            railName: "US ACH",
            eligible: achEligible,
            reasonCode: achReasonCode,
            reasonText: achReasonText,
            minAmount: 0.01,
            maxAmount: 1000000.0,
            feeAmount: 1.00,
            currencyCode: "USD",
            estimatedSettlement: "1-3 Business Days",
            missingRequirements: achMissingReqs
        },
        {
            railCode: "SEPA",
            railName: "SEPA Credit Transfer",
            eligible: sepaEligible,
            reasonCode: sepaReasonCode,
            reasonText: sepaReasonText,
            minAmount: 0.01,
            maxAmount: 500000.0,
            feeAmount: 1.50,
            currencyCode: "EUR",
            estimatedSettlement: "1-2 Business Days",
            missingRequirements: sepaMissingReqs
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
