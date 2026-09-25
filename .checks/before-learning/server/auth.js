const crypto = require('node:crypto');
const pool = require('./db');
const hash = token => crypto.createHash('sha256').update(token).digest('hex');
async function issueSession(userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  await pool.query('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))', [hash(token), userId]);
  return token;
}
async function authenticate(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  if (!/^[\w-]{43}$/.test(token)) return res.status(401).json({ error: 'Please sign in to continue.' });
  const [rows] = await pool.query(`SELECT u.id, u.name, u.email, u.phone, u.role, r.admin_access FROM sessions s JOIN users u ON u.id=s.user_id JOIN roles r ON r.name=u.role WHERE s.token_hash=? AND s.expires_at > NOW()`, [hash(token)]);
  if (!rows.length) return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  req.user = rows[0];
  req.tokenHash = hash(token);
  next();
}
function requireAdmin(req, res, next) {
  if (!req.user?.admin_access) return res.status(403).json({ error: 'Administrator access is required.' });
  next();
}
module.exports = { issueSession, authenticate, requireAdmin };
