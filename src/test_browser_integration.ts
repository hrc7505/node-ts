import { chromium } from "playwright";

async function runBrowserVerification() {
    console.log("🌐 Launching Chromium Browser for Visual Integration Testing...");

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Navigate to server health endpoint
    console.log("Navigating to Chiizu Integration API...");
    const response = await page.goto("http://localhost:8080/v1/payment-requirements?country=CA&destinationType=RECIPIENT");
    console.log("HTTP Response Status:", response?.status());

    const content = await page.content();
    console.log("Page Content received (length):", content.length);

    // Verify content includes JSON schema
    if (!content.includes("RECIPIENT_IDENTIFIER")) {
        throw new Error("Browser verification failed: Schema missing from browser view");
    }

    console.log("✅ Browser successfully loaded and validated dynamic Chiizu requirement payload!");
    await browser.close();
    console.log("🎉 Browser verification completed successfully.");
}

runBrowserVerification().catch((err) => {
    console.error("❌ Browser test error:", err);
    process.exit(1);
});
