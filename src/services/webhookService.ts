import { log } from "node:console";

export default async function sendWebhook(BC_WEBHOOK_URL: string, payload: any, signature: string) {
    try {
        log("Sending webhook to:", BC_WEBHOOK_URL);
        const response = await fetch(BC_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "X-Chiizu-Signature": signature
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        log("Webhook sent successfully:", await response.text());
    } catch (err) {
        // In real life: retry + queue
        console.error('Webhook failed:', err);
    }
}
