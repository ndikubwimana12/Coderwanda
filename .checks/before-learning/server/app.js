// Staged application factory: importing this file does not start a server or run migrations.
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('node:path');
const pool = require('./db');
const resources = require('./resources');
const { authenticate, requireAdmin, issueSession } = require('./auth');
const { registerManagement, save } = require('./management');
const { fail, format, validate } = require('./validation');
const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174').split(',') }));
app.use(express.json({ limit: '8mb' }));
app.use((_req, res, next) => { res.setHeader('X-Content-Type-Options', 'nosniff'); next(); });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
const attempts = new Map();
app.use('/api/auth', (req, res, next) => {
  if (req.method !== 'POST' || req.path === '/logout') return next();
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.until < now) attempts.delete(key);
  const entry = attempts.get(req.ip) || { count: 0, until: now + 15 * 60 * 1000 };
  attempts.set(req.ip, entry);
  if (++entry.count > 30) return res.status(429).json({ error: 'Too many sign-in attempts. Try again in 15 minutes.' });
  next();
});
app.get('/api/health', async (_req, res) => { await pool.query('SELECT 1'); res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() }); });
app.post('/api/auth/register', async (req, res) => {
  const data = validate('users', { ...req.body, role: 'user' });
  if (!data.password) fail('Password is required.');
  const [result] = await pool.query('INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)', [data.name, data.email, data.phone, await bcrypt.hash(data.password, 12), 'user']);
  const user = { id: result.insertId, name: data.name, email: data.email, phone: data.phone, role: 'user', admin_access: 0 };
  res.status(201).json({ user, token: await issueSession(user.id) });
});
app.post('/api/auth/login', async (req, res) => {
  if (typeof req.body?.email !== 'string' || typeof req.body?.password !== 'string') fail('Email and password are required.');
  const [rows] = await pool.query('SELECT u.*, r.admin_access FROM users u JOIN roles r ON r.name=u.role WHERE email=?', [req.body.email.trim().toLowerCase()]);
  if (!rows.length || !await bcrypt.compare(req.body.password, rows[0].password)) fail('Invalid email or password.', 401);
  const user = format('users', rows[0]);
  res.json({ user, token: await issueSession(user.id) });
});
app.get('/api/auth/me', authenticate, (req, res) => res.json(req.user));
app.post('/api/auth/logout', authenticate, async (req, res) => { await pool.query('DELETE FROM sessions WHERE token_hash=?', [req.tokenHash]); res.json({ message: 'Signed out.' }); });
for (const [resource, config] of Object.entries(resources)) if (config.public) app.get(`/api/${resource}`, async (_req, res) => {
  const [rows] = await pool.query(`SELECT * FROM \`${config.table || resource}\` ${config.fields.active ? 'WHERE active=1' : ''} ORDER BY id DESC`);
  res.json(rows.map(row => format(resource, row)));
});
app.get('/api/courses/:slug', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM courses WHERE slug=? OR id=? LIMIT 1', [req.params.slug, /^\d+$/.test(req.params.slug) ? Number(req.params.slug) : -1]);
  if (!rows.length) fail('Course not found.', 404);
  res.json(format('courses', rows[0]));
});
app.get('/api/products/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM products WHERE id=?', [req.params.id]);
  if (!rows.length) fail('Product not found.', 404);
  res.json(rows[0]);
});
app.post('/api/orders', authenticate, async (req, res) => {
  const id = await save('orders', { ...req.body, user_id: req.user.id, status: 'pending' }, null, req.user);
  const [[order]] = await pool.query('SELECT total_amount FROM orders WHERE id=?', [id]);
  res.status(201).json({ orderId: id, total_amount: order.total_amount, message: 'Order placed successfully.' });
});
app.get('/api/orders/my', authenticate, async (req, res) => {
  const [orders] = await pool.query('SELECT * FROM orders WHERE user_id=? ORDER BY id DESC', [req.user.id]);
  for (const order of orders) { const [items] = await pool.query('SELECT * FROM order_items WHERE order_id=?', [order.id]); order.items = items; }
  res.json(orders);
});
app.post('/api/enrollments', (req, res, next) => req.headers.authorization ? authenticate(req, res, next) : next(), async (req, res) => {
  const [courses] = await pool.query('SELECT id FROM courses WHERE id=? OR slug=? LIMIT 1', [Number(req.body?.course_id) || -1, req.body?.courseSlug || '']);
  if (!courses.length) fail('Select an existing course.');
  const id = await save('enrollments', { ...req.body, user_id: req.user?.id || null, course_id: courses[0].id, status: 'pending' }, null, req.user);
  res.status(201).json({ enrollmentId: id, message: 'Enrollment submitted.' });
});
app.get('/api/enrollments/my', authenticate, async (req, res) => {
  const [rows] = await pool.query('SELECT e.*, c.title AS course_title FROM enrollments e LEFT JOIN courses c ON c.id=e.course_id WHERE e.user_id=? ORDER BY e.id DESC', [req.user.id]);
  res.json(rows);
});
app.post('/api/careers/applications', async (req, res) => {
  const [jobs] = await pool.query('SELECT id FROM job_openings WHERE id=? AND active=1', [Number(req.body?.job_id) || -1]);
  if (!jobs.length) fail('This job is no longer accepting applications.');
  const id = await save('applications', { ...req.body, status: 'pending' }, null, null);
  res.status(201).json({ applicationId: id, message: 'Application submitted.' });
});
app.post('/api/contact', async (req, res) => { await save('contacts', { ...req.body, status: 'unread' }, null, null); res.status(201).json({ message: 'Message sent successfully.' }); });
app.post('/api/subscribers', async (req, res) => { await save('subscribers', req.body, null, null); res.status(201).json({ message: 'You are subscribed.' }); });
app.use('/api/admin', authenticate, requireAdmin);
registerManagement(app);
require('./reports')(app);
require('./system-routes')(app);
const dist = path.join(__dirname, '..', 'frontend', 'dist');
app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));
app.use(express.static(dist));
app.get('/{*path}', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
app.use((error, _req, res, _next) => {
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A record with that email, name or slug already exists.' });
  if (error.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'A referenced user or record does not exist.' });
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ error: status >= 500 ? 'The server could not complete this request. Please try again.' : error.message });
});
module.exports = app;
