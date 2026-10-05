const nodemailer = require('nodemailer');

const recipient = () => process.env.ADMIN_NOTIFICATION_EMAIL || 'ndikubwimanaeric2019@gmail.com';
const sources = {
  contacts: { table: 'contact_messages', fields: ['name', 'email', 'phone', 'subject', 'message'], label: 'Contact message', href: '/admin/contacts' },
  enrollments: { table: 'enrollments', fields: ['full_name', 'email', 'phone', 'course_id', 'message'], label: 'Course enrollment', href: '/admin/students' },
  applications: { table: 'job_applications', fields: ['name', 'email', 'phone', 'job_title', 'message'], label: 'Job application', href: '/admin/applications' },
  orders: { table: 'orders', fields: ['full_name', 'phone', 'city', 'address', 'total_amount'], label: 'Order', href: '/admin/orders' },
  subscribers: { table: 'subscribers', fields: ['email'], label: 'Newsletter subscription', href: '/admin/subscribers' },
  users: { table: 'users', fields: ['name', 'email', 'phone'], label: 'New account', href: '/admin/users' }
};

async function enqueueIncoming(conn, resource, id) {
  const source = sources[resource];
  if (!source) return null;
  const [rows] = await conn.query(`SELECT ${source.fields.map(field => `\`${field}\``).join(',')} FROM \`${source.table}\` WHERE id=? LIMIT 1`, [id]);
  const record = rows[0] || {};
  const detail = source.fields.filter(field => record[field] != null && record[field] !== '').map(field => `${field.replaceAll('_', ' ')}: ${String(record[field]).slice(0, 1200)}`).join('\n');
  const subject = `${source.label} received${id ? ` (#${id})` : ''}`;
  const body = `${source.label} received on CodeRwanda.\n\n${detail}\n\nReview: https://coderwanda.net.rw${source.href}`;
  await conn.query('INSERT INTO admin_notification_emails(recipient,subject,body) VALUES(?,?,?)', [recipient(), subject, body]);
  return { source, subject };
}

let sending = false;
async function deliverPending() {
  if (sending) return { configured: Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM), sent: 0 };
  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) return { configured: false, sent: 0 };
  sending = true;
  const pool = require('./db');
  let sent = 0;
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000
    });
    const [rows] = await pool.query('SELECT * FROM admin_notification_emails WHERE sent_at IS NULL ORDER BY id LIMIT 20');
    for (const row of rows) {
      try {
        await transport.sendMail({ from: process.env.SMTP_FROM, to: row.recipient, subject: row.subject, text: row.body });
        await pool.query('UPDATE admin_notification_emails SET sent_at=NOW(),last_error=NULL WHERE id=?', [row.id]);
        sent++;
      } catch (error) {
        await pool.query('UPDATE admin_notification_emails SET last_error=? WHERE id=?', [String(error.message || 'Email delivery failed').slice(0, 500), row.id]);
      }
    }
    transport.close();
    return { configured: true, sent, pending: rows.length - sent };
  } finally {
    sending = false;
  }
}

module.exports = { enqueueIncoming, deliverPending };
