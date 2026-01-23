import { Request, Response } from "express";

import { log } from "node:console";

const statuses = ["Processing", "Paid", "Failed"];

const paymentIntent = (req: Request, res: Response) => {
    log("paymentIntent");
    const { invoiceNo, amount, callbackUrl } = req.body;

    if (!invoiceNo || !amount) {
        return res.status(400).json({ error: "Invalid request" });
    }

    const intentId = "pi_" + crypto.randomUUID();

    // Simulate async success
    const t = setTimeout(async () => {
        clearTimeout(t);
        await fetch(callbackUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                paymentIntentId: intentId,
                invoiceNo,
                status: "Paid",
                paidAmount: amount
            })
        });
    }, 3000);

    return res.status(201).json({
        paymentIntentId: intentId,
        status: "Processing"
    });
};

export default paymentIntent;