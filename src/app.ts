import express from "express";
import cors from "cors";
import router from "./routes/routes";

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Support both /api and root /v1 paths
app.use("/api", router);

export default app;
