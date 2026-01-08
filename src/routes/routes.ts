import { Router } from "express";

import createTransaction from "../controllers/transaction.controller";
import pay from "../controllers/alphapay.controller";

const router = Router();

router.post("/transaction", createTransaction);
router.post("/pay", pay);

export default router;