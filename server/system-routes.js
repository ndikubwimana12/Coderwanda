const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('./db');
const resources = require('./resources');
const { fail } = require('./validation');
const { audit } = require('./management');
const defaults = { site_name: 'CodeRwanda', contact_email: 'info@coderwanda.rw', phone: '0781 257 942 / 0792 982 669', address: 'Musanze, Rwanda', hours: 'Mon - Fri: 8AM - 6PM', hero_title: 'Empowering Rwanda', hero_subtitle: 'Through Technology', hero_description: 'Technology services, practical training and products for your next step.' };
async function settings() { const [rows] = await pool.query('SELECT data FROM site_settings WHERE id=1'); return { ...defaults, ...(rows.length ? JSON.parse(rows[0].data) : {}) }; }
module.exports = app => {
  app.get('/api/settings', async (_req, res) => res.json(await settings()));
  app.get('/api/admin/settings', async (_req, res) => res.json(await settings()));
  app.put('/api/admin/settings', async (req, res) => {
    const data = {};
    for (const key of Object.keys(defaults)) {
      if (typeof req.body?.[key] !== 'string' || !req.body[key].trim() || req.body[key].length > 1000) fail(`${key.replaceAll('_', ' ')} is required (maximum 1,000 characters).`);
      data[key] = req.body[key].trim();
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email)) fail('Enter a valid contact email.');
    await pool.query('INSERT INTO site_settings (id,data) VALUES (1,?) ON DUPLICATE KEY UPDATE data=VALUES(data)', [JSON.stringify(data)]);
    await audit(pool, req.user, 'update', 'settings', 1);
    res.json(data);
  });
  app.get('/api/admin/activity-logs', async (_req, res) => { const [rows] = await pool.query('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 1000'); res.json(rows); });
  app.delete('/api/admin/activity-logs/:id', async (req, res) => { await pool.query('DELETE FROM activity_logs WHERE id=?', [req.params.id]); res.json({ message: 'Log removed.' }); });
  app.get('/api/admin/reports/export/:type', async (req, res) => {
    const config = resources[req.params.type];
    if (!config) fail('Unknown export type.');
    const [rows] = await pool.query(`SELECT * FROM \`${config.table || req.params.type}\` ORDER BY id DESC`);
    rows.forEach(row => delete row.password);
    const keys = rows.length ? Object.keys(rows[0]) : ['id', ...Object.keys(config.fields).filter(k => k !== 'password')];
    const cell = value => { let text = String(value ?? ''); if (/^[=+\-@\t\r]/.test(text)) text = "'" + text; return '"' + text.replaceAll('"', '""') + '"'; };
    res.type('text/csv').attachment(`coderwanda-${req.params.type}.csv`).send('\uFEFF' + [keys, ...rows.map(row => keys.map(k => row[k]))].map(row => row.map(cell).join(',')).join('\r\n'));
  });
  app.post('/api/admin/uploads', async (req, res) => {
    const { data } = req.body || {};
    if (typeof data !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) fail('Upload a PNG, JPEG or WebP image.');
    const buffer = Buffer.from(data, 'base64');
    if (!buffer.length || buffer.length > 5 * 1024 * 1024) fail('Images must be no larger than 5 MB.');
    let extension;
    if (buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) extension = 'png';
    else if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) extension = 'jpg';
    else if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') extension = 'webp';
    else fail('Only PNG, JPEG and WebP images are supported.');
    const filename = `${crypto.randomUUID()}.${extension}`;
    await fs.mkdir(path.join(__dirname, 'uploads'), { recursive: true });
    await fs.writeFile(path.join(__dirname, 'uploads', filename), buffer, { flag: 'wx' });
    await audit(pool, req.user, 'upload', 'images', null);
    res.status(201).json({ url: `/uploads/${filename}` });
  });
};
