import { Router } from "express";

import pay from "../controllers/alphapay.controller";
import makePayment from "../controllers/makePayment.controller";
import connectChiizu from "../controllers/connectChiizu.controller";
import disconnectChiizu from "../controllers/disconnectChiizu.controller";
import schedulePayment from "../controllers/schedulePayment.controller";
import cancelScheduledPayments from "../controllers/cancelScheduledPayment.controller";

const router = Router();

// BC
router.post("/create-payment", makePayment);
router.post("/schedule-payment", schedulePayment);
router.post("/cancel-scheduled-payments", cancelScheduledPayments);
router.post("/connect-chiizu", connectChiizu);
router.post("/disconnect-chiizu", disconnectChiizu);

// Afterpay
router.post("/pay", pay);

export default router;