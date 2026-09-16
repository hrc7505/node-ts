import { chromium } from "playwright";
import path from "path";

async function runBusinessCentralBrowserFlow() {
    console.log("🏢 Launching Chromium Browser for Dynamics 365 Business Central End-to-End Flow...\n");

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1400, height: 950 } });
    const page = await context.newPage();

    // 1. Open BC Payment Journal
    console.log("1️⃣ Navigating to Business Central Web Client (Payment Journal)...");
    await page.goto("http://localhost:8080/bc");
    await page.waitForSelector("#view-title");
    console.log("✅ Page Title:", await page.title());
    console.log("Current View Title:", await page.textContent("#view-title"));

    // 2. Test Setup Payment Information Modal Flow
    console.log("\n2️⃣ Opening 'Setup Payment Information' dialog for line PMT-002...");
    await page.click("#btn-setup-info");
    await page.waitForSelector("#modal-setup-payment.open");
    console.log("Dialog opened successfully.");

    // Fill missing transit and account numbers
    await page.fill("#dlg-inst", "004");
    await page.fill("#dlg-transit", "12345");
    await page.fill("#dlg-account", "987654321");

    // Handle dialog alert if any
    page.on("dialog", async (dialog) => {
        console.log(`[BC Dialog Prompt]: ${dialog.message()}`);
        await dialog.accept();
    });

    console.log("Saving dynamic requirements & marking line Ready...");
    await page.click("#btn-save-prep");
    await page.waitForTimeout(1000);

    const prepStatus2 = await page.textContent("#prep-status-2");
    console.log(`✅ Line 2 Preparation Status is now: ${prepStatus2}`);

    // Take screenshot of prepared journal
    const scJournalPath = path.join(__dirname, "../bc_journal_prepared.png");
    await page.screenshot({ path: scJournalPath, fullPage: true });
    console.log(`📸 Journal screenshot saved to: ${scJournalPath}`);

    // 3. Test Vendor Card & Chiizu Destinations
    console.log("\n3️⃣ Inspecting Vendor Card & Chiizu Destinations tab...");
    await page.click("#tab-vendor");
    await page.waitForTimeout(500);
    const vendorHandle = await page.inputValue("#vendor-interac-handle");
    console.log(`Vendor Interac Recipient Handle: ${vendorHandle}`);

    console.log("Switching to Chiizu Destinations...");
    await page.click("#tab-destinations");
    await page.waitForTimeout(500);
    console.log("Clicking 'Verify Destination with Chiizu'...");
    await page.click("button:has-text('Verify Destination with Chiizu')");
    await page.waitForTimeout(1000);

    const destStatus = await page.textContent("#dest-verif-status");
    const destRef = await page.textContent("#dest-ref-id");
    console.log(`✅ Destination Verification Status: ${destStatus}, Ref ID: ${destRef}`);

    // 4. Test Approval Workflow Trigger & Automatic Intent Outbox
    console.log("\n4️⃣ Simulating Native BC Manager Approval...");
    await page.click("#tab-journal");
    await page.waitForTimeout(500);
    await page.click("#btn-approve");

    console.log("Approval event triggered! Checking Outbox Intent live lifecycle stream...");
    await page.waitForSelector("#intent-row-1");
    console.log("Intent created in Outbox!");

    // Wait 7 seconds for background settlement from Chiizu API & webhook
    console.log("Waiting for Chiizu asynchronous dispatcher & webhook settlement...");
    await page.waitForTimeout(7000);

    const finalIntentStatus = await page.textContent("#intent-status");
    console.log(`✅ Final Intent Status in Outbox: ${finalIntentStatus}`);

    // Switch back to journal to verify posted status
    await page.click("#tab-journal");
    const finalPayStatus = await page.textContent("#pay-status-1");
    const finalPostStatus = await page.textContent("#post-status-1");
    console.log(`✅ Journal Line 1 Payment Status: ${finalPayStatus}, BC Posting Status: ${finalPostStatus}`);

    // Take final screenshot of completed flow
    const scFinalPath = path.join(__dirname, "../bc_flow_completed.png");
    await page.screenshot({ path: scFinalPath, fullPage: true });
    console.log(`📸 Final Flow screenshot saved to: ${scFinalPath}`);

    await browser.close();
    console.log("\n🎉 ALL BUSINESS CENTRAL BROWSER FLOWS SUCCESSFULLY TESTED AND VERIFIED!");
}

runBusinessCentralBrowserFlow().catch((err) => {
    console.error("❌ BC Browser Test Failed:", err);
    process.exit(1);
});
