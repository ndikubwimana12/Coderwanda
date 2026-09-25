require('../server/node_modules/dotenv').config({path: require('node:path').resolve(__dirname, '../server/.env')});
const pool = require('../server/db');
pool.query('SELECT role, COUNT(*) AS accounts FROM users GROUP BY role').then(([rows]) => console.log(rows)).finally(() => pool.end());
