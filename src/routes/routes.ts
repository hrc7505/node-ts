import { Router } from "express";

import pay from "../controllers/alphapay.controller";
import makePayment from "../controllers/makePayment.controller";
import connectChiizu from "../controllers/connectChiizu.controller";

const router = Router();

// BC
router.post("/create-payment", makePayment);
router.post("/connect-chiizu", connectChiizu);

// Afterpay
router.post("/pay", pay);

export default router;