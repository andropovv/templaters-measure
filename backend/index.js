const app = require('./app');
const { initDb } = require('./db');

// Vercel serverless: таблица создаётся при холодном старте (идемпотентно)
initDb().catch(console.error);

// Экспорт для Vercel (@vercel/node требует module.exports = handler)
module.exports = app;

// Локальный запуск
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Бэкенд запущен: http://localhost:${PORT}`));
}
