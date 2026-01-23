import { Router } from "express";

import createTransaction from "../controllers/transaction.controller";
import pay from "../controllers/alphapay.controller";
import paymentIntent from "../controllers/paymentIntent.controller";
import makePayment from "../controllers/makePayment.controller";

const router = Router();

// BC
router.post("/transaction", createTransaction);
router.post("/create-intent", paymentIntent);
router.post("/create-payment", makePayment);

// Afterpay
router.post("/pay", pay);

export default router;