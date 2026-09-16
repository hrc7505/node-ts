import { Request, Response } from "express";
import { log } from "node:console";

interface BankFieldDefinition {
    key: string;
    label: string;
    type: "string" | "number" | "enum";
    required: boolean;
    maxLength?: number;
    regex?: string;
    allowedValues?: string[];
    description?: string;
}

interface BankRequirementResponse {
    country: string;
    paymentMethod?: string;
    currency?: string;
    version: string;
    fields: BankFieldDefinition[];
}

const COUNTRY_REQUIREMENTS: Record<string, BankFieldDefinition[]> = {
    US: [
        {
            key: "ROUTING_NUMBER",
            label: "Routing (ABA) Number",
            type: "string",
            required: true,
            maxLength: 9,
            regex: "^[0-9]{9}$",
            description: "9-digit US ABA routing transit number with valid Fed checksum"
        },
        {
            key: "ACCOUNT_NUMBER",
            label: "Account Number",
            type: "string",
            required: true,
            maxLength: 17,
            regex: "^[0-9]{4,17}$",
            description: "US Bank Account Number"
        },
        {
            key: "ACCOUNT_TYPE",
            label: "Account Type",
            type: "enum",
            required: true,
            allowedValues: ["Checking", "Savings"],
            description: "Checking or Savings"
        }
    ],
    CA: [
        {
            key: "TRANSIT_NUMBER",
            label: "Branch Transit Number",
            type: "string",
            required: true,
            maxLength: 5,
            regex: "^[0-9]{5}$",
            description: "5-digit Canadian branch transit number"
        },
        {
            key: "INSTITUTION_NUMBER",
            label: "Financial Institution Number",
            type: "string",
            required: true,
            maxLength: 3,
            regex: "^[0-9]{3}$",
            description: "3-digit Canadian financial institution number"
        },
        {
            key: "ACCOUNT_NUMBER",
            label: "Account Number",
            type: "string",
            required: true,
            maxLength: 12,
            regex: "^[0-9]{5,12}$",
            description: "Canadian Bank Account Number"
        }
    ],
    IN: [
        {
            key: "IFSC",
            label: "IFSC Code",
            type: "string",
            required: true,
            maxLength: 11,
            regex: "^[A-Z]{4}0[A-Z0-9]{6}$",
            description: "11-character Indian Financial System Code"
        },
        {
            key: "ACCOUNT_NUMBER",
            label: "Account Number",
            type: "string",
            required: true,
            maxLength: 30,
            regex: "^[0-9]{9,30}$",
            description: "Indian Bank Account Number"
        }
    ],
    GB: [
        {
            key: "SORT_CODE",
            label: "Sort Code",
            type: "string",
            required: true,
            maxLength: 6,
            regex: "^[0-9]{6}$",
            description: "6-digit UK Bank Sort Code"
        },
        {
            key: "ACCOUNT_NUMBER",
            label: "Account Number",
            type: "string",
            required: true,
            maxLength: 8,
            regex: "^[0-9]{8}$",
            description: "8-digit UK Bank Account Number"
        }
    ],
    EU: [
        {
            key: "IBAN",
            label: "IBAN",
            type: "string",
            required: true,
            maxLength: 34,
            regex: "^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$",
            description: "International Bank Account Number"
        },
        {
            key: "BIC",
            label: "BIC / SWIFT Code",
            type: "string",
            required: false,
            maxLength: 11,
            regex: "^[A-Z0-9]{8,11}$",
            description: "SWIFT / BIC Code"
        }
    ]
};

// Aliases for European countries
const SEPA_COUNTRIES = ["DE", "FR", "ES", "IT", "NL", "BE", "AT", "IE", "PT", "FI"];
SEPA_COUNTRIES.forEach(c => {
    COUNTRY_REQUIREMENTS[c] = COUNTRY_REQUIREMENTS["EU"];
});

const DESTINATION_REQUIREMENTS: Record<string, Record<string, BankFieldDefinition[]>> = {
    BANK_ACCOUNT: COUNTRY_REQUIREMENTS,
    RECIPIENT: {
        CA: [
            {
                key: "RECIPIENT_IDENTIFIER",
                label: "Interac Recipient (Email / Mobile)",
                type: "string",
                required: true,
                maxLength: 80,
                description: "Designated Email address or Canadian mobile number (+1...)"
            }
        ],
        DEFAULT: [
            {
                key: "RECIPIENT_IDENTIFIER",
                label: "Recipient Email or Handle",
                type: "string",
                required: true,
                maxLength: 80,
                description: "Recipient email or identifier"
            }
        ]
    },
    WALLET: {
        DEFAULT: [
            {
                key: "WALLET_ID",
                label: "Digital Wallet ID",
                type: "string",
                required: true,
                maxLength: 100,
                description: "Digital wallet unique address or identifier"
            }
        ]
    },
    UPI: {
        IN: [
            {
                key: "UPI_ID",
                label: "UPI Virtual Payment Address (VPA)",
                type: "string",
                required: true,
                maxLength: 50,
                regex: "^[a-zA-Z0-9.\\-_]{2,256}@[a-zA-Z]{2,64}$",
                description: "Virtual Payment Address (e.g. username@upi or bank)"
            }
        ],
        DEFAULT: [
            {
                key: "UPI_ID",
                label: "UPI ID",
                type: "string",
                required: true,
                maxLength: 50,
                description: "UPI Virtual Payment Address"
            }
        ]
    }
};

export const getBankAccountRequirements = async (req: Request, res: Response) => {
    const country = ((req.query.country || req.query.countryCode || "CA") as string).toUpperCase();
    const paymentMethod = req.query.paymentMethod ? (req.query.paymentMethod as string).toUpperCase() : undefined;
    const currency = req.query.currency ? (req.query.currency as string).toUpperCase() : undefined;
    const destinationType = ((req.query.destinationType || "BANK_ACCOUNT") as string).toUpperCase();

    log(`📋 [GET /payment-requirements] country=${country}, method=${paymentMethod}, currency=${currency}, destinationType=${destinationType}`);

    let fields: BankFieldDefinition[] = [];

    const typeReqs = DESTINATION_REQUIREMENTS[destinationType] || DESTINATION_REQUIREMENTS["BANK_ACCOUNT"];
    if (typeReqs) {
        fields = typeReqs[country] || typeReqs["DEFAULT"] || [];
    }

    if (fields.length === 0) {
        fields = [
            {
                key: "ACCOUNT_NUMBER",
                label: "Bank Account Number",
                type: "string",
                required: true,
                maxLength: 34,
                description: "Account Number / Identifier"
            },
            {
                key: "ROUTING_CODE",
                label: "Routing / Sort / Branch Code",
                type: "string",
                required: false,
                maxLength: 20,
                description: "Bank Identifier Code"
            }
        ];
    }

    const response: BankRequirementResponse = {
        country,
        paymentMethod,
        currency,
        version: "2026-v1",
        fields
    };

    return res.status(200).json(response);
};

export default {
    getBankAccountRequirements
};

