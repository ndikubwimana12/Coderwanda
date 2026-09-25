require('dotenv').config({ path: require('node:path').join(__dirname, '.env') });
const pool = require('./db');
const migrate = require('./migrate');
async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) throw new Error('Usage: npm run admin -- existing-account@example.com');
  await migrate();
  const [result] = await pool.query("UPDATE users SET role='admin' WHERE email=?", [email]);
  if (!result.affectedRows) throw new Error('Account not found. Register the account first.');
  console.log('Administrator access granted to the selected account. Sign in again.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => pool.end());
