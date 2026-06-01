const express = require('express');
const cors = require('cors');
const { query } = require('./db');
const { ENGINES, benchmark } = require('./engines');

const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions)); // preflight для всех маршрутов
app.use(express.json());

app.get('/api/engines', (req, res) => {
  const list = Object.entries(ENGINES).map(([id, e]) => ({
    id,
    name: e.name,
    example: e.example,
  }));
  res.json(list);
});

app.post('/api/render', async (req, res) => {
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

    const { rows } = await query(
      'INSERT INTO measurements (engine, template, data, result, duration_ms) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [engine, template, JSON.stringify(parsedData), result, duration_ms]
    );

    res.json({ id: rows[0].id, engine, engineName: ENGINES[engine].name, result, duration_ms, iterations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/measurements', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const engine = req.query.engine;

  try {
    const { rows } = engine
      ? await query('SELECT * FROM measurements WHERE engine=$1 ORDER BY id DESC LIMIT $2', [engine, limit])
      : await query('SELECT * FROM measurements ORDER BY id DESC LIMIT $1', [limit]);

    rows.forEach(r => { r.data = JSON.parse(r.data); });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT engine, COUNT(*)::int as count,
        ROUND(AVG(duration_ms)::numeric, 3) as avg_ms,
        ROUND(MIN(duration_ms)::numeric, 3) as min_ms,
        ROUND(MAX(duration_ms)::numeric, 3) as max_ms
      FROM measurements GROUP BY engine ORDER BY avg_ms ASC
    `);

    res.json(rows.map(r => ({
      ...r,
      engineName: ENGINES[r.engine]?.name || r.engine,
      avg_ms: parseFloat(r.avg_ms),
      min_ms: parseFloat(r.min_ms),
      max_ms: parseFloat(r.max_ms),
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/measurements', async (req, res) => {
  try {
    await query('DELETE FROM measurements');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
