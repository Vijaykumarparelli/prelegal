import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import db from "../db";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  const rows = db.prepare("SELECT * FROM documents ORDER BY created_at DESC").all();
  res.json(rows.map((r: any) => ({ ...r, data: JSON.parse(r.data) })));
});

router.get("/:id", (req: Request, res: Response) => {
  const row = db.prepare("SELECT * FROM documents WHERE id = ?").get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json({ ...row, data: JSON.parse(row.data) });
});

router.post("/", (req: Request, res: Response) => {
  const { type, title, data } = req.body as { type: string; title: string; data: unknown };
  if (!type || !title || !data) {
    return res.status(400).json({ error: "type, title, and data are required" });
  }
  const id = randomUUID();
  db.prepare("INSERT INTO documents (id, type, title, data) VALUES (?, ?, ?, ?)").run(
    id,
    type,
    title,
    JSON.stringify(data)
  );
  const created = db.prepare("SELECT * FROM documents WHERE id = ?").get(id) as any;
  res.status(201).json({ ...created, data: JSON.parse(created.data) });
});

router.delete("/:id", (req: Request, res: Response) => {
  const result = db.prepare("DELETE FROM documents WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
});

export default router;
