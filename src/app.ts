import express from "express";
//import cors from "cors";
import routes from "./routes/routes";

const app = express();

/* app.use(cors({
    origin: "*", // change in production
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
})); */

app.use(express.json());

app.use("/api", routes);

export default app;
