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

import path from "path";

app.use(express.static(path.join(__dirname, "public")));

// Serve Studio UI on root
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve Business Central Web Client Simulator
app.get(["/bc", "/bc-client"], (req, res) => {
    res.sendFile(path.join(__dirname, "public", "bc.html"));
});


// Support root paths and /api prefix
app.use("/", router);
app.use("/api", router);

export default app;

