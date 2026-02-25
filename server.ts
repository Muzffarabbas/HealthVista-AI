import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("healthvista.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    age INTEGER,
    gender TEXT,
    weight REAL,
    height REAL,
    goal TEXT,
    conditions TEXT,
    target_calories INTEGER,
    target_protein INTEGER,
    target_carbs INTEGER,
    target_fat INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT DEFAULT (date('now')),
    type TEXT, -- 'meal', 'exercise', 'sleep', 'water', 'mood'
    content TEXT, -- JSON string of the log details
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/profile", (req, res) => {
    const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get();
    res.json(profile || null);
  });

  app.post("/api/profile", (req, res) => {
    const { age, gender, weight, height, goal, conditions, target_calories, target_protein, target_carbs, target_fat } = req.body;
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO profile (id, age, gender, weight, height, goal, conditions, target_calories, target_protein, target_carbs, target_fat)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(age, gender, weight, height, goal, conditions, target_calories, target_protein, target_carbs, target_fat);
    res.json({ success: true });
  });

  app.get("/api/logs", (req, res) => {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const logs = db.prepare("SELECT * FROM daily_logs WHERE date = ? ORDER BY created_at ASC").all(date);
    res.json(logs.map(log => ({ ...log, content: JSON.parse(log.content as string) })));
  });

  app.post("/api/logs", (req, res) => {
    const { type, content, date } = req.body;
    const logDate = date || new Date().toISOString().split('T')[0];
    const stmt = db.prepare("INSERT INTO daily_logs (type, content, date) VALUES (?, ?, ?)");
    stmt.run(type, JSON.stringify(content), logDate);
    res.json({ success: true });
  });

  app.delete("/api/logs/:id", (req, res) => {
    db.prepare("DELETE FROM daily_logs WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/reset-day", (req, res) => {
    const date = req.body.date || new Date().toISOString().split('T')[0];
    db.prepare("DELETE FROM daily_logs WHERE date = ?").run(date);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
