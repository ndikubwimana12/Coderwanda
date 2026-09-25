require('dotenv').config({ path: require('node:path').join(__dirname, '.env') });
const pool = require('./db');
const migrate = require('./migrate');
const app = require('./app');
const port = process.env.PORT || 5000;
migrate().then(() => {
  const server = app.listen(port, () => console.log(`CodeRwanda API listening on http://localhost:${port}`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => pool.end().then(() => process.exit(0))));
}).catch(error => { console.error('Database initialization failed:', error.message); pool.end().finally(() => process.exit(1)); });
