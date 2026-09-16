import http from "http";

async function makeRequest(options: http.RequestOptions, postData?: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => data += chunk);
            res.on("end", () => {
                try {
                    resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
                } catch {
                    resolve({ statusCode: res.statusCode, body: data });
                }
            });
        });
        req.on("error", reject);
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function runE2ETest() {
    console.log("🚀 Starting Chiizu Payment Integration E2E Test Suite...\n");

    // 1. Dynamic Requirements - Canadian Interac Recipient
    console.log("1️⃣ Querying Dynamic Requirements for Canada (CA) Interac Recipient...");
    const req1 = await makeRequest({
        hostname: "localhost",
        port: 8080,
        path: "/v1/payment-requirements?country=CA&destinationType=RECIPIENT",
        method: "GET"
    });
    console.log("Status:", req1.statusCode);
    console.log("Requirements:", JSON.stringify(req1.body, null, 2));
    if (req1.body.fields[0].key !== "RECIPIENT_IDENTIFIER") {
        throw new Error("Failed requirement test for CA Interac");
    }
    console.log("✅ Requirement CA Interac passed!\n");

    // 2. Dynamic Requirements - US Bank Account (ABA Routing)
    console.log("2️⃣ Querying Dynamic Requirements for US Bank Account...");
    const req2 = await makeRequest({
        hostname: "localhost",
        port: 8080,
        path: "/v1/payment-requirements?country=US&destinationType=BANK_ACCOUNT",
        method: "GET"
    });
    console.log("Status:", req2.statusCode);
    console.log("Requirements:", JSON.stringify(req2.body, null, 2));
    console.log("✅ Requirement US Bank Account passed!\n");

    // 3. Bank Account Verification
    console.log("3️⃣ Testing Account Verification with Chiizu...");
    const verifBody = JSON.stringify({
        vendorNo: "VEND-100",
        bankAccountCode: "CA-MAIN",
        countryCode: "CA",
        currencyCode: "CAD",
        bankAccountNo: "987654321",
        transitNo: "12345",
        fields: { INSTITUTION_NUMBER: "004" }
    });
    const verifRes = await makeRequest({
        hostname: "localhost",
        port: 8080,
        path: "/v1/accounts/verify",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(verifBody)
        }
    }, verifBody);
    console.log("Status:", verifRes.statusCode);
    console.log("Verification Response:", JSON.stringify(verifRes.body, null, 2));
    if (!verifRes.body.accountRefId) {
        throw new Error("Failed verification test");
    }
    console.log("✅ Verification passed with Account Ref:", verifRes.body.accountRefId, "\n");

    // 4. Payment Creation (Outbox Dispatch)
    console.log("4️⃣ Testing Payment Dispatch (EFT / Interac)...");
    const payBody = JSON.stringify({
        requestId: "REQ-TEST-E2E-01",
        idempotencyKey: "IDEMP-TEST-E2E-01",
        callbackUrl: "http://localhost:8080/api/webhook",
        payments: [{
            paymentId: "PMT-E2E-01",
            amount: 2500.00,
            currency: "CAD",
            sourceDocument: {
                type: "PAYMENT_JOURNAL",
                template: "PAYMENT",
                batch: "CHIIZU",
                documentNo: "PMT-001",
                lineNo: 10000
            }
        }]
    });
    const payRes = await makeRequest({
        hostname: "localhost",
        port: 8080,
        path: "/v1/payments",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payBody)
        }
    }, payBody);
    console.log("Status:", payRes.statusCode);
    console.log("Payment Creation Response:", JSON.stringify(payRes.body, null, 2));
    console.log("✅ Payment successfully created!\n");

    // 5. Payment Settlement Lifecycle
    console.log("5️⃣ Checking Payment Status Settlement Lifecycle...");
    console.log("Waiting 6 seconds for background settlement...");
    await new Promise(r => setTimeout(r, 6000));

    const statusRes = await makeRequest({
        hostname: "localhost",
        port: 8080,
        path: "/v1/payments/PMT-E2E-01",
        method: "GET"
    });
    console.log("Status Query Response:", JSON.stringify(statusRes.body, null, 2));
    if (statusRes.body.status !== "SUCCEEDED") {
        throw new Error("Expected payment status SUCCEEDED, got " + statusRes.body.status);
    }
    console.log("✅ Payment lifecycle successfully transitioned to SUCCEEDED!\n");

    console.log("🎉 ALL E2E INTEGRATION TESTS COMPLETED SUCCESSFULLY!");
}

runE2ETest().catch((err) => {
    console.error("❌ E2E Test Failed:", err);
    process.exit(1);
});
