import { Request, Response } from "express";
import { pki, md } from "node-forge";
import crypto from "node:crypto";


const API_HOST = "https://openapi.alphapay.ca";
const MERCHANT_CODE = "ZZZ6";

// 🔐 NEVER expose this in frontend
const privateKeyPem = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC36Q9cPuIvLJTm
D3g+ez7LR4aSwvZ5WFg9N/YmKfe06Mmx5YHuhsHRUswe/eQyvNiKAyRGO8BHS5Py
YiMcLijvyd15HBs6RegNmpQHfrwWNaXgMnJbDywqfD/hoqD60S6G7sm5AAbaWrZo
wPOU+XhBkZYKdEkpDEjWXLTml1jvAWKUU5kcGb18PdUnu8xlgigAeSbFlcGB51Ez
5ny4xxKEf84ZV9W5Lj0ID1y41zcFvs/TE513U6UUAIttt4ApLhb+I+0NamgYMrQz
giFHn+1Bul0J+coFRH4ftam80FCjCm1FOiUaxR57zY53TGWQZPIJJzQ+pVnPAYN2
tiT4BTCFAgMBAAECggEADVc4qAZfvfBL9MxWeqHSEkjj+C1wV6kS7Y3rqyUMNPFW
ADOX00evM5IAAJeGQC/2vTwxG28mKYXP+5sm1Np8WbiY+joRt45uoN3/svN8jVfi
6np+VSCqoYJV1/ZGGyulZmBX/bWEyb4e0UZ95Oab1JXM/oEk9XdQqUwcS0XbS6r8
kQSNKqkfdrr8hgBPI8L71zifWin80hG65Z6mXDXPvoBCjDvBrmojeScFZwMZ266C
VoUHR4XFayQRCqfzguZXa/kwqpZANcTZ4Mn8a4IEAsyWkYL6HGkOcoEsyAFxitsr
qQgW8xFbswFtBzFZnTvR+ClHs+ckCZQeaSYabIQXmQKBgQDdoRMjXfm4Pbvh6Muu
C4+zBbn33oA62eul4ZOYKvNt5vMepi+i47XcdsxeRUKG/YpJ76wCrnekXqRQmPeU
iTwbNLUk9pBYcuYSocClCZSe09MgCs+pz5p2p0rVtMARnwnxWbbJUe+Ce6/ReEfd
YNH5uz4kYEwmp7M9Zo472I59RwKBgQDUboG3KIQQ4i9+O1bNQBe9/PvJaHdDcvcz
mHXJzGP2O/lnlpLTMCmMOT7Didjr+mZi8EFGUbAeYlosd9wg482r9xBnLCB0BRgX
141LRERpohrcK4+ZMDdkOQDIjUZV1OYtgR7E1hCWRdgpvRXvi5ROJCnnavUmnyqE
rPAJuOgZ0wKBgQCN7oOFGL+9n7tct2sI8Np7+WTZOiLAjaJ9vvJ4drkiXs6/iAnl
tRJYN7Q1gwFR1bjkFJsBtJ1mJD3yZ6PV+fUGL0D6hPR30E1LDU+D4ZjOBjWkxYer
5gmzhvtD1NdT8Ze6eou2bcSGuZMlAHR1b3XJCoKHZSwfbTI6Vh0sckj+LQKBgBfz
YaKh6cnxhoNH83Buwn6EMGsz4QZ0xtRFYzpeVgLkHimEu4ceDgEmTyJCv3dTowmS
pvljqmSymBIdbW8z3/N8hpfrTLln/aBqiB6tUr1KLpcWPjl6SzR8jM8PxpdUyqLk
xPBSZkpbE5UZIYkBhrYMs8DIuV0iYuvUh7fA5kJLAoGAXE+MuBQHeMPGDmecSQaG
Q+RMJHmjRO8IY1NFPqq+F7V7htQUlnewW8HOI7RNHKJxmNoozxLhKCv+qEQfsjvX
XZ0zDwYXOi3RrAgb0KJMrFxOb631FDDJ6z2FoDEQkfGPKzaZF0m4+EbETlwZLfIi
AV3Los57tV/kox8DYqGtVjo=
-----END PRIVATE KEY-----`;

const pay = async (req: Request, res: Response) => {
    try {
        const apiPath = "/api/v2.0/payments/pay";
        const method = "POST";

        const requestTime = new Date().toISOString();
        const nonce = crypto.randomBytes(16).toString("hex"); // 32 chars

        // Body MUST be exactly what is sent
        const bodyJson = JSON.stringify({
            scenarioCode: "ONLINE_QRCODE",
            paymentRequestId: crypto.randomUUID(),
            order: {
                orderAmount: {
                    value: req.body.amount,
                    currency: req.body.currency,
                },
                description: "test description"
            },
            paymentMethod: {
                paymentMethodType: req.body.paymentMethodType,
            },
        });

        // 1️⃣ Build sign content
        const signContent =
            `${method} ${apiPath}\n` +
            `${MERCHANT_CODE}.${requestTime}.${nonce}.${bodyJson}`;

        // 2️⃣ Sign using RSA-SHA256
        const privateKey = pki.privateKeyFromPem(privateKeyPem);
        const sha256 = md.sha256.create();
        sha256.update(signContent, "utf8");

        const rawSignature = privateKey.sign(sha256);
        const base64Signature = Buffer.from(rawSignature, "binary").toString("base64");
        const urlEncodedSignature = encodeURIComponent(base64Signature);

        const signatureHeader = `algorithm=RS256,keyVersion=1,signature=${urlEncodedSignature}`;

        // 3️⃣ Call AlphaPay API
        const response = await fetch(`${API_HOST}${apiPath}`, {
            method,
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                Accept: "application/json",
                "Merchant-Code": MERCHANT_CODE,
                "Request-Time": requestTime,
                Nonce: nonce,
                Signature: signatureHeader,
            },
            body: bodyJson,
        });

        const data = await response.json();

        return res.status(response.status).json({
            statusCode: response.status,
            result: data,
        });
    } catch (error) {
        console.error(`${req.body.paymentMethodType} error:`, error);
        return res.status(400).json({ statusCode: 400, error: "Payment QR generation failed" });
    }
};

export default pay;
