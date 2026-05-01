import nodemailer from 'nodemailer';

interface BankTransactionPayload {
    accountId: string;
    transactionId: string;
    transactionDate: string; // Expected format: YYYY-MM-DD
    description: string;
    amount: number;          // Positive for deposits, Negative for withdrawals
}

interface WebhookResponse {
    success: boolean;
    message?: string;
    error?: string;
}


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Sends a nicely formatted JSON object via email.
 */
export default async function sendJsonEmail<T>(toEmail: string, subject: string, jsonData: T): Promise<boolean> {
    try {
        const mailOptions = {
            from: `"Vercel Logger" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: subject,
            text: `JSON Data:\n\n${JSON.stringify(jsonData, null, 2)}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                    <h2 style="color: #333;">${subject}</h2>
                    <p style="color: #666;">Here is the structured data you requested:</p>
                    <pre style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 14px;">
                    <code>${JSON.stringify(jsonData, null, 2)}</code>
                    </pre>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${toEmail} (ID: ${info.messageId})`);
        return true;

    } catch (error) {
        console.error('Failed to send JSON email:', error);
        throw error;
    }
}