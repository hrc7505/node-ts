import { log } from "node:console";

export default async function sendWebhook(BC_WEBHOOK_URL: string, payload: any) {
    try {
        log(`\n🚀 [${new Date().toISOString()}] Sending Webhook to:`, BC_WEBHOOK_URL);
        log("📦 Payload:", JSON.stringify(payload, null, 2));

        const response = await fetch(BC_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const respText = await response.text();
        log(`✅ Webhook Delivered! Status: ${response.status}. Body: ${respText}`);
    } catch (err: any) {
        console.error('⚠️ Webhook Dispatch Note (Sandbox offline or auth required):', err.message);
    }
}
