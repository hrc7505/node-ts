import { Router } from "express";

import createTransaction from "../controllers/transaction.controller";

const router = Router();

router.post("/transaction", createTransaction);

export default router;