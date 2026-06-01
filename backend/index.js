const app = require('./app');
const { initDb } = require('./db');

const PORT = process.env.PORT || 3001;

initDb()
  .then(() => app.listen(PORT, () => console.log(`Бэкенд запущен: http://localhost:${PORT}`)))
  .catch(err => { console.error('Ошибка инициализации БД:', err); process.exit(1); });
