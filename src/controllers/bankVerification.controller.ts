import { Request, Response } from "express";
import { log } from "node:console";
import crypto from "node:crypto";

function validateAbaRouting(routing: string): boolean {
    const clean = routing.replace(/\D/g, "");
    if (clean.length !== 9) return false;
    const d = clean.split("").map(Number);
    const checksum = (3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + 1 * (d[2] + d[5] + d[8])) % 10;
    return checksum === 0;
}

function validateIban(iban: string): boolean {
    const clean = iban.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (clean.length < 15 || clean.length > 34) return false;
    const rearranged = clean.slice(4) + clean.slice(0, 4);
    let numericStr = "";
    for (const char of rearranged) {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
            numericStr += (code - 55).toString();
        } else {
            numericStr += char;
        }
    }
    // Mod 97 on big numbers
    let remainder = 0;
    for (let i = 0; i < numericStr.length; i += 7) {
        const block = remainder.toString() + numericStr.substring(i, Math.min(i + 7, numericStr.length));
        remainder = parseInt(block, 10) % 97;
    }
    return remainder === 1;
}

function validateIfsc(ifsc: string): boolean {
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase());
}

export const verifyBankAccount = async (req: Request, res: Response) => {
    log("\n🔍 [POST /accounts/verify] Received account verification request from Business Central");
    log("Body:", JSON.stringify(req.body, null, 2));

    const {
        vendorNo,
        bankAccountCode,
        countryCode = "CA",
        currencyCode = "CAD",
        bankBranchNo,
        bankAccountNo,
        transitNo,
        iban,
        fields = {}
    } = req.body;

    const country = (countryCode || "CA").toUpperCase();
    const errors: string[] = [];

    // Extract dynamic or standard fields
    const routingNumber = fields.ROUTING_NUMBER || bankBranchNo || transitNo || "";
    const accountNumber = fields.ACCOUNT_NUMBER || bankAccountNo || "";
    const ifsc = fields.IFSC || bankBranchNo || "";
    const ibanVal = fields.IBAN || iban || "";
    const transit = fields.TRANSIT_NUMBER || transitNo || bankBranchNo || "";
    const institution = fields.INSTITUTION_NUMBER || "";

    if (country === "US") {
        if (!routingNumber) {
            errors.push("Routing Number (ROUTING_NUMBER) is required for US bank accounts.");
        } else if (!validateAbaRouting(routingNumber)) {
            errors.push(`Invalid US ABA Routing Number: ${routingNumber}. Checksum validation failed.`);
        }
        if (!accountNumber) {
            errors.push("Account Number (ACCOUNT_NUMBER) is required for US bank accounts.");
        }
    } else if (country === "CA") {
        if (!transit) {
            errors.push("Branch Transit Number (TRANSIT_NUMBER) is required for Canadian accounts.");
        } else if (!/^[0-9]{5}$/.test(transit.replace(/\D/g, ""))) {
            errors.push(`Invalid Canadian Transit Number: ${transit}. Must be 5 numeric digits.`);
        }
        if (!accountNumber) {
            errors.push("Account Number (ACCOUNT_NUMBER) is required for Canadian accounts.");
        }
    } else if (country === "IN") {
        if (!ifsc) {
            errors.push("IFSC Code (IFSC) is required for Indian bank accounts.");
        } else if (!validateIfsc(ifsc)) {
            errors.push(`Invalid Indian IFSC Code: ${ifsc}. Format must be 4 uppercase letters, 0, and 6 alphanumeric characters.`);
        }
        if (!accountNumber) {
            errors.push("Account Number (ACCOUNT_NUMBER) is required for Indian bank accounts.");
        }
    } else if (country === "GB") {
        const sortCode = fields.SORT_CODE || bankBranchNo || "";
        if (!sortCode || !/^[0-9]{6}$/.test(sortCode.replace(/\D/g, ""))) {
            errors.push("Valid 6-digit Sort Code is required for UK bank accounts.");
        }
        if (!accountNumber) {
            errors.push("Account Number is required for UK bank accounts.");
        }
    } else if (ibanVal || country === "EU" || ["DE", "FR", "ES", "IT", "NL"].includes(country)) {
        if (!ibanVal) {
            errors.push("IBAN is required for European bank accounts.");
        } else if (!validateIban(ibanVal)) {
            errors.push(`Invalid IBAN: ${ibanVal}. ISO 7064 Mod 97-10 validation failed.`);
        }
    }

    if (errors.length > 0) {
        log("❌ Verification failed with errors:", errors);
        return res.status(422).json({
            success: false,
            status: "failed",
            errors,
            message: "Bank account verification failed."
        });
    }

    const accountRefId = `act_chz_${crypto.randomBytes(6).toString("hex")}`;
    const verificationId = `ver_${Date.now()}`;
    const verifiedAt = new Date().toISOString();

    const capabilities = [
        {
            paymentMethod: "EFT",
            available: true,
            currency: currencyCode || (country === "US" ? "USD" : country === "CA" ? "CAD" : "EUR"),
            minAmount: 1.0,
            maxAmount: 100000.0,
            reason: ""
        },
        {
            paymentMethod: "INTERAC",
            available: country === "CA",
            currency: "CAD",
            minAmount: 1.0,
            maxAmount: 3000.0,
            reason: country === "CA" ? "" : "Interac is only available for Canadian destinations"
        },
        {
            paymentMethod: "WIRE",
            available: true,
            currency: currencyCode || "USD",
            minAmount: 100.0,
            maxAmount: 1000000.0,
            reason: ""
        }
    ];

    log(`✅ Account verified successfully! Ref: ${accountRefId}`);
    return res.status(200).json({
        success: true,
        status: "verified",
        accountRefId,
        verificationId,
        verifiedAt,
        capabilityVersion: "2026-v1",
        capabilities,
        message: "Vendor bank account successfully verified with Chiizu."
    });
};

export default {
    verifyBankAccount
};
