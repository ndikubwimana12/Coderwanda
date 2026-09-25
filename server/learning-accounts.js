const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const pool = require('./db');
const origin = () => (process.env.PUBLIC_ORIGIN || 'http://localhost:5173').replace(/\/$/, '');
const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');

async function invite(conn, user) {
  const token = crypto.randomBytes(32).toString('base64url');
  await conn.query('INSERT INTO account_activations (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 48 HOUR)) ON DUPLICATE KEY UPDATE token_hash=VALUES(token_hash), expires_at=VALUES(expires_at)', [user.id, hashToken(token)]);
  const link = `${origin()}/activate-account#${token}`;
  // Obsolete unsent activation messages must not deliver invalid links later.
  await conn.query("DELETE FROM learning_notifications WHERE user_id=? AND sent_at IS NULL AND subject='Activate your CodeRwanda student account'", [user.id]);
  await conn.query('INSERT INTO learning_notifications (user_id, recipient, subject, body) VALUES (?, ?, ?, ?)', [user.id, user.email, 'Activate your CodeRwanda student account', `Welcome ${user.name}! Your enrollment has been approved. Set your password using this single-use link (valid for 48 hours):\n\n${link}\n\nThen sign in to your learning dashboard. If you did not apply, contact the training team.`]);
  return link;
}

async function ensureStudentAccount(conn, enrollment, previous) {
  if (!['approved', 'completed'].includes(enrollment.status)) return;
  const [rows] = await conn.query('SELECT id, name, email, account_active FROM users WHERE email=? FOR UPDATE', [enrollment.email]);
  let user = rows[0];
  if (!user) {
    const password = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
    const [result] = await conn.query("INSERT INTO users (name,email,phone,password,role,account_active) VALUES (?,?,?,?,'user',0)", [enrollment.full_name, enrollment.email, enrollment.phone, password]);
    user = { id: result.insertId, name: enrollment.full_name, email: enrollment.email, account_active: 0 };
  }
  enrollment.user_id = user.id;
  if (previous?.status === enrollment.status && previous?.user_id === user.id) return;
  if (!user.account_active) await invite(conn, user);
  else await conn.query('INSERT INTO learning_notifications (user_id,recipient,subject,body) VALUES (?,?,?,?)', [user.id, user.email, 'Your course enrollment is approved', `Hello ${user.name}, your enrollment is approved. Sign in with your existing account at ${origin()}/login?redirect=/learn to start learning.`]);
}

let delivering = false;
async function deliverNotifications() {
  if (delivering || !process.env.SMTP_HOST || !process.env.SMTP_FROM) return { configured: false, sent: 0 };
  delivering = true;
  let sent = 0;
  try {
    const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT) || 587, secure: process.env.SMTP_SECURE === 'true', auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined, connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000 });
    const [rows] = await pool.query('SELECT * FROM learning_notifications WHERE sent_at IS NULL ORDER BY id LIMIT 20');
    for (const row of rows) {
      try {
        await transport.sendMail({ from: process.env.SMTP_FROM, to: row.recipient, subject: row.subject, text: row.body });
        await pool.query("UPDATE learning_notifications SET sent_at=NOW(), body='Delivered', last_error=NULL WHERE id=?", [row.id]); sent++;
      } catch { await pool.query("UPDATE learning_notifications SET last_error='Email delivery failed. Check SMTP configuration and retry.' WHERE id=?", [row.id]); }
    }
    transport.close();
    return { configured: true, sent };
  } finally { delivering = false; }
}
module.exports = { ensureStudentAccount, invite, deliverNotifications, hashToken };
