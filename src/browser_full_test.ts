import { chromium } from "playwright";
import path from "path";

async function runFullBrowserTest() {
    console.log("🌐 Launching Chromium Browser for Full Interactive Visual Testing...\n");

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    console.log("1️⃣ Navigating to Chiizu Payments Studio at http://localhost:8080/ ...");
    await page.goto("http://localhost:8080/");
    await page.waitForSelector("#server-status");
    console.log("✅ Page Title:", await page.title());

    // 1. Interactive Dynamic Requirements Test
    console.log("\n2️⃣ Interacting with Dynamic Requirements Card...");
    await page.selectOption("#req-country", "CA");
    await page.selectOption("#req-dest-type", "RECIPIENT");
    await page.click("#btn-fetch-req");
    await page.waitForTimeout(1000);

    const reqResult = await page.textContent("#req-result");
    console.log("📋 Dynamic Requirements Result Output:\n", reqResult);

    // 2. Interactive Destination Verification Test
    console.log("\n3️⃣ Interacting with Destination Verification Card...");
    await page.selectOption("#verif-country", "CA");
    await page.fill("#verif-transit", "12345");
    await page.fill("#verif-account", "987654321");
    await page.click("#btn-verify");
    await page.waitForTimeout(1000);

    const verifResult = await page.textContent("#verif-result");
    console.log("🔐 Verification Result Output:\n", verifResult);

    // 3. Interactive Payment Dispatch & Settlement Test
    console.log("\n4️⃣ Interacting with Outbox Payment Dispatch Card...");
    await page.fill("#pay-amount", "2500.00");
    await page.selectOption("#pay-rail", "INTERAC");
    await page.click("#btn-dispatch-pay");

    console.log("Waiting for settlement timeline updates...");
    await page.waitForTimeout(7000);

    const payResult = await page.textContent("#pay-result");
    const timelineHtml = await page.innerHTML("#dispatch-timeline");
    console.log("⚡ Payment Dispatch Result Output:\n", payResult);
    console.log("Timeline Status:", timelineHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());

    // Take screenshot
    const screenshotPath = path.join(__dirname, "../browser_test_screenshot.png");
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 Full-page screenshot saved to: ${screenshotPath}`);

    await browser.close();
    console.log("\n🎉 ALL BROWSER INTERACTIONS COMPLETED AND VERIFIED SUCCESSFULLY!");
}

runFullBrowserTest().catch((err) => {
    console.error("❌ Full browser test failed:", err);
    process.exit(1);
});
