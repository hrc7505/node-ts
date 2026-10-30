import { Request, Response } from "express";
import { log } from "node:console";
import { saveWebhookConfig, getWebhookConfig } from "../store/batchStore";

const connectChiizu = async (req: Request, res: Response) => {
    log("\n🔗 [POST /connect-chiizu] Registration & Handshake received from Business Central");
    log("Headers:", JSON.stringify(req.headers));
    log("Body:", JSON.stringify(req.body, null, 2));

    const { webhookCallbackUrl, callbackUrl, companyName, companyId, events } = req.body || {};
    const bcUrl = webhookCallbackUrl || callbackUrl;
    const targetCallbackUrl = bcUrl;

    // 🚀 Print clearly so it's easy to spot and copy in runtime logs:
    console.log('====================================================');
    console.log('🎯 [BC WEBHOOK REGISTERED]');
    console.log('🎯 [BC WEBHOOK URL]:', bcUrl);
    console.log('🏢 Company:', companyName || companyId);
    console.log('🔗 URL:', bcUrl);
    console.log('====================================================');

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
        registeredUrl: bcUrl,
        webhookCallbackUrl: targetCallbackUrl || currentConfig?.webhookCallbackUrl || "",
        message: 'Chiizu connected successfully! Webhook callback URL registered.'
    });
};

export default connectChiizu;


