import express from "express";
import transactionRoutes from "./routes/transaction.routes";

const app = express();

app.use(express.json());
app.use("/api", transactionRoutes);

export default app;