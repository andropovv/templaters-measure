const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const { ENGINES, benchmark } = require('./engines');

const app = express();

// Use in-memory DB for tests, file DB otherwise
const dbPath = process.env.TEST_DB || path.join(__dirname, 'measurements.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    engine TEXT NOT NULL,
    template TEXT NOT NULL,
    data TEXT NOT NULL,
    result TEXT,
    duration_ms REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

app.use(cors());
app.use(express.json());

app.get('/api/engines', (req, res) => {
  const list = Object.entries(ENGINES).map(([id, e]) => ({
    id,
    name: e.name,
    example: e.example,
  }));
  res.json(list);
});

app.post('/api/render', (req, res) => {
  const { engine, template, data, iterations = 100 } = req.body;

  if (!engine || !template || !data) {
    return res.status(400).json({ error: 'engine, template и data обязательны' });
  }

  if (!ENGINES[engine]) {
    return res.status(400).json({ error: `Неизвестный шаблонизатор: ${engine}` });
  }

  let parsedData;
  try {
    parsedData = typeof data === 'string' ? JSON.parse(data) : data;
  } catch {
    return res.status(400).json({ error: 'data должен быть валидным JSON' });
  }

  try {
    const { result, duration_ms } = benchmark(engine, template, parsedData, iterations);

    const info = db
      .prepare('INSERT INTO measurements (engine, template, data, result, duration_ms) VALUES (?, ?, ?, ?, ?)')
      .run(engine, template, JSON.stringify(parsedData), result, duration_ms);

    res.json({
      id: info.lastInsertRowid,
      engine,
      engineName: ENGINES[engine].name,
      result,
      duration_ms,
      iterations,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/measurements', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const engine = req.query.engine;

  const rows = engine
    ? db.prepare('SELECT * FROM measurements WHERE engine = ? ORDER BY id DESC LIMIT ?').all(engine, limit)
    : db.prepare('SELECT * FROM measurements ORDER BY id DESC LIMIT ?').all(limit);

  rows.forEach(r => { r.data = JSON.parse(r.data); });
  res.json(rows);
});

app.get('/api/stats', (req, res) => {
  const rows = db.prepare(`
    SELECT engine, COUNT(*) as count,
      AVG(duration_ms) as avg_ms, MIN(duration_ms) as min_ms, MAX(duration_ms) as max_ms
    FROM measurements GROUP BY engine ORDER BY avg_ms ASC
  `).all();

  res.json(rows.map(r => ({
    ...r,
    engineName: ENGINES[r.engine]?.name || r.engine,
    avg_ms: parseFloat(r.avg_ms.toFixed(3)),
    min_ms: parseFloat(r.min_ms.toFixed(3)),
    max_ms: parseFloat(r.max_ms.toFixed(3)),
  })));
});

app.delete('/api/measurements', (req, res) => {
  db.prepare('DELETE FROM measurements').run();
  res.json({ ok: true });
});

module.exports = app;
