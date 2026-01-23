export default async function sendWebhook(BC_WEBHOOK_URL: string, payload: any, signature: string) {
    try {
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
    } catch (err) {
        // In real life: retry + queue
        console.error('Webhook failed:', err);
    }
}
