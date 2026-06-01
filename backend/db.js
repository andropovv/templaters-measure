const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS measurements (
      id        SERIAL PRIMARY KEY,
      engine    TEXT NOT NULL,
      template  TEXT NOT NULL,
      data      TEXT NOT NULL,
      result    TEXT,
      duration_ms DOUBLE PRECISION NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

module.exports = { query, initDb };
