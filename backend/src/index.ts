import express from "express";
import cors from "cors";
import healthRouter from "./routes/health";
import documentsRouter from "./routes/documents";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/health", healthRouter);
app.use("/api/documents", documentsRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
