import { Router } from "express";

import pay from "../controllers/alphapay.controller";
import makePayment from "../controllers/makePayment.controller";
import connectChiizu from "../controllers/connectChiizu.controller";
import disconnectChiizu from "../controllers/disconnectChiizu.controller";
import schedulePayment from "../controllers/schedulePayment.controller";
import cancelScheduledPayments from "../controllers/cancelScheduledPayment.controller";
import fundingAccounts from "../controllers/fundingAccounts.controller";
import accountTransactions from "../controllers/accountTransactions.controller";
import { createPayments, getPaymentStatus, manualSettlePayment } from "../controllers/payments.controller";

const router = Router();

// Chiizu Enterprise Payments API
router.post("/payments", createPayments);
router.get("/payments/:id", getPaymentStatus);
router.post("/payments/:id/settle", manualSettlePayment);

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
