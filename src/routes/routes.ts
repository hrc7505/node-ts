import { Router } from "express";

import pay from "../controllers/alphapay.controller";
import makePayment from "../controllers/makePayment.controller";
import connectChiizu from "../controllers/connectChiizu.controller";
import disconnectChiizu from "../controllers/disconnectChiizu.controller";
import schedulePayment from "../controllers/schedulePayment.controller";
import cancelScheduledPayments from "../controllers/cancelScheduledPayment.controller";
import fundingAccounts from "../controllers/fundingAccounts.controller";
import accountTransactions from "../controllers/accountTransactions.controller";
import { createPayments, getPaymentStatus, getBatchStatus, manualSettlePayment } from "../controllers/payments.controller";
import { getBankAccountRequirements, getCountryPaymentMethods } from "../controllers/bankRequirements.controller";
import { verifyBankAccount } from "../controllers/bankVerification.controller";
import { getAccountCapabilities, queryPaymentCapabilities } from "../controllers/capabilities.controller";

const router = Router();

// Country Payment Methods & Capabilities (Dynamic UI Rails)
router.get("/countries/:countryCode/payment-methods", getCountryPaymentMethods);
router.get("/v1/countries/:countryCode/payment-methods", getCountryPaymentMethods);
router.get("/payment-methods", getCountryPaymentMethods);
router.get("/v1/payment-methods", getCountryPaymentMethods);

// Bank Account & Payment Requirements (Dynamic UI & Validation Metadata)
router.get("/bank-account-requirements", getBankAccountRequirements);
router.get("/v1/bank-account-requirements", getBankAccountRequirements);
router.get("/payment-requirements", getBankAccountRequirements);
router.get("/v1/payment-requirements", getBankAccountRequirements);

// Bank Account Verification & Capability Assessment
router.post("/accounts/verify", verifyBankAccount);
router.post("/v1/accounts/verify", verifyBankAccount);
router.get("/accounts/:id/capabilities", getAccountCapabilities);
router.get("/v1/accounts/:id/capabilities", getAccountCapabilities);
router.post("/payments/capabilities", queryPaymentCapabilities);
router.post("/v1/payments/capabilities", queryPaymentCapabilities);

// Chiizu Enterprise Payments API
router.post("/payments", createPayments);
router.post("/v1/payments", createPayments);
router.get("/payments/:id", getPaymentStatus);
router.get("/v1/payments/:id", getPaymentStatus);
router.get("/batches/:id", getBatchStatus);
router.get("/v1/batches/:id", getBatchStatus);
router.get("/payments/batches/:id", getBatchStatus);
router.get("/v1/payments/batches/:id", getBatchStatus);
router.post("/payments/:id/settle", manualSettlePayment);
router.post("/v1/payments/:id/settle", manualSettlePayment);

// Bank Feeds & Account Endpoints
router.get("/funding-accounts", fundingAccounts);
router.get("/accounts", fundingAccounts);
router.get("/funding-accounts/:accountId/transactions", accountTransactions);
router.get("/accounts/:accountId/transactions", accountTransactions);

// BC Legacy Integration Endpoints
router.post("/create-payment", makePayment);
router.post("/schedule-payment", schedulePayment);
router.post("/cancel-scheduled-payment", cancelScheduledPayments);
router.post("/connect-chiizu", connectChiizu);
router.post("/disconnect-chiizu", disconnectChiizu);

// AlphaPay
router.post("/pay", pay);

export default router;
