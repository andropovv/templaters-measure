const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'measurements.db'));

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

module.exports = db;
