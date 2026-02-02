import { Router } from "express";

import pay from "../controllers/alphapay.controller";
import makePayment from "../controllers/makePayment.controller";
import connectChiizu from "../controllers/connectChiizu.controller";
import disconnectChiizu from "../controllers/disconnectChiizu.controller";

const router = Router();

// BC
router.post("/create-payment", makePayment);
router.post("/connect-chiizu", connectChiizu);
router.post("/disconnect-chiizu", disconnectChiizu);

// Afterpay
router.post("/pay", pay);

export default router;