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

import fs from "fs";
import path from "path";

// Find public directory whether in src/, dist/, or project root
const publicCandidates = [
    path.join(__dirname, "public"),
    path.join(__dirname, "../src/public"),
    path.join(__dirname, "../public"),
    path.join(process.cwd(), "src", "public"),
    path.join(process.cwd(), "public"),
    path.join(process.cwd(), "dist", "public")
];

const publicDir = publicCandidates.find(p => fs.existsSync(path.join(p, "index.html"))) || path.join(__dirname, "public");

app.use(express.static(publicDir));

// Serve Studio UI on root
app.get("/", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
});

// Serve Business Central Web Client Simulator
app.get(["/bc", "/bc-client"], (req, res) => {
    res.sendFile(path.join(publicDir, "bc.html"));
});


// Support root paths and /api prefix
app.use("/", router);
app.use("/api", router);

export default app;

