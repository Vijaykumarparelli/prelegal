import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../../.env") });

import express from "express";
import cors from "cors";
import healthRouter from "./routes/health";
import documentsRouter from "./routes/documents";
import chatRouter from "./routes/chat";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/health", healthRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/chat", chatRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
