import { Request, Response } from "express";
import { log } from "node:console";
import { saveWebhookConfig, getWebhookConfig } from "../store/batchStore";

const connectChiizu = async (req: Request, res: Response) => {
    log("\n🔗 [POST /connect-chiizu] Registration & Handshake received from Business Central");
    log("Headers:", JSON.stringify(req.headers));
    log("Body:", JSON.stringify(req.body, null, 2));

    const { webhookCallbackUrl, callbackUrl, companyId, companyName, events } = req.body || {};
    const targetCallbackUrl = webhookCallbackUrl || callbackUrl;

    if (targetCallbackUrl) {
        saveWebhookConfig({
            tenantId: "chiizu-tenant-001",
            companyId: companyId || "CRONUS",
            companyName: companyName || "CRONUS USA, Inc.",
            webhookCallbackUrl: targetCallbackUrl,
            events: events || ["payment.succeeded", "payment.failed", "batch.settled"],
            registeredAt: new Date().toISOString()
        });
        log(`✅ Registered webhook callback URL: ${targetCallbackUrl}`);
    }

    const currentConfig = getWebhookConfig();

    return res.status(200).json({
        success: true,
        status: "connected",
        tenantId: "chiizu-tenant-001",
        webhookCallbackUrl: targetCallbackUrl || currentConfig?.webhookCallbackUrl || "",
        message: targetCallbackUrl
            ? "Chiizu connected and webhook callback URL registered successfully."
            : "Chiizu connected successfully."
    });
};

export default connectChiizu;

