const bcrypt = require('bcryptjs');
const pool = require('./db');
const resources = require('./resources');
const { fail, positiveId, validate, format } = require('./validation');

async function audit(conn, user, action, resource, id) {
  await conn.query('INSERT INTO activity_logs (user_id, actor, action, resource, record_id) VALUES (?, ?, ?, ?, ?)', [user?.id || null, user?.email || 'Public visitor', action, resource, id || null]);
}
async function list(resource, id) {
  const config = resources[resource];
  let query = `SELECT * FROM \`${config.table || resource}\``;
  if (resource === 'users') query = 'SELECT id, name, email, phone, role, created_at FROM users';
  if (resource === 'roles') query = 'SELECT r.*, (SELECT COUNT(*) FROM users u WHERE u.role=r.name) AS users FROM roles r';
  const [rows] = await pool.query(query + (id ? ' WHERE id=?' : ' ORDER BY id DESC'), id ? [id] : []);
  if (resource === 'orders' && rows.length) {
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id IN (?)', [rows.map(r => r.id)]);
    rows.forEach(r => { r.items = items.filter(i => i.order_id === r.id).map(i => ({ ...i, id: i.product_id })); });
  }
  return rows.map(r => format(resource, r));
}

async function priceOrder(conn, items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 100) fail('Add between 1 and 100 order items.');
  const lines = items.map(item => ({ id: positiveId(item.product_id ?? item.id), quantity: Number(item.quantity) }));
  if (lines.some(i => !Number.isSafeInteger(i.quantity) || i.quantity < 1 || i.quantity > 1000)) fail('Quantities must be whole numbers between 1 and 1000.');
  const [products] = await conn.query('SELECT id, name, price, image FROM products WHERE id IN (?) FOR UPDATE', [lines.map(i => i.id)]);
  const priced = lines.map(line => { const product = products.find(p => p.id === line.id); if (!product) fail('An ordered product is no longer available. Refresh your cart.'); return { ...product, quantity: line.quantity }; });
  const total = priced.reduce((sum, line) => sum + line.price * line.quantity, 0);
  if (!Number.isSafeInteger(total) || total > 2147483647) fail('The order total exceeds the supported amount.');
  return { items: priced, total };
}

async function protectAdmin(conn, resource, current, data, deleting, actor) {
  if (!['users', 'roles'].includes(resource)) return;
  // Serialize role/account changes so two concurrent requests cannot remove every admin.
  const [roles] = await conn.query('SELECT * FROM roles FOR UPDATE');
  const [admins] = await conn.query('SELECT u.id, u.role FROM users u JOIN roles r ON r.name=u.role WHERE r.admin_access=1 FOR UPDATE');
  if (resource === 'users') {
    const role = roles.find(r => r.name === data.role);
    if (!deleting && !role) fail('Select an existing role.');
    if (current && admins.some(a => a.id === current.id) && (deleting || !role?.admin_access) && admins.length <= 1) fail('Keep at least one administrator account.');
    if (current?.id === actor?.id && deleting) fail('Use another administrator account to delete your own account.');
  } else if (current) {
    if (['admin', 'user'].includes(current.name) && (deleting || data.name !== current.name || Number(data.admin_access) !== current.admin_access)) fail('Built-in roles must retain their name and access level.');
    const [[{ assigned }]] = await conn.query('SELECT COUNT(*) AS assigned FROM users WHERE role=?', [current.name]);
    if (deleting && assigned) fail('Reassign this role’s users before deleting it.');
    if (current.admin_access && !Number(data.admin_access) && admins.length && admins.every(a => a.role === current.name)) fail('Keep at least one administrator account.');
    if (!deleting && data.name !== current.name) await conn.query('UPDATE users SET role=? WHERE role=?', [data.name, current.name]);
  }
}

async function save(resource, body, id, actor) {
  const config = resources[resource];
  const table = config.table || resource;
  const data = validate(resource, body, Boolean(id));
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [existing] = id ? await conn.query(`SELECT * FROM \`${table}\` WHERE id=? FOR UPDATE`, [positiveId(id)]) : [[]];
    if (id && !existing.length) fail('Record not found.', 404);
    await protectAdmin(conn, resource, existing[0], data, false, actor);
    if (resource === 'users') {
      if (!id && !data.password) fail('Password is required.');
      if (data.password) data.password = await bcrypt.hash(data.password, 12);
    }
    if (resource === 'enrollments') {
      const [course] = await conn.query('SELECT id FROM courses WHERE id=?', [data.course_id]);
      if (!course.length) fail('Select an existing course.');
    }
    if (resource === 'applications') {
      const [job] = await conn.query('SELECT title FROM job_openings WHERE id=?', [data.job_id]);
      if (!job.length) fail('Select an existing job.');
      data.job_title = job[0].title;
    }
    let order;
    if (resource === 'orders') { order = await priceOrder(conn, body.items); data.total_amount = order.total; }
    const keys = Object.keys(data);
    if (id) await conn.query(`UPDATE \`${table}\` SET ${keys.map(k => `\`${k}\`=?`).join(',')} WHERE id=?`, [...Object.values(data), id]);
    else { const [result] = await conn.query(`INSERT INTO \`${table}\` (${keys.map(k => `\`${k}\``).join(',')}) VALUES (${keys.map(() => '?').join(',')})`, Object.values(data)); id = result.insertId; }
    if (order) {
      await conn.query('DELETE FROM order_items WHERE order_id=?', [id]);
      for (const item of order.items) await conn.query('INSERT INTO order_items (order_id, product_id, name, price, quantity, image) VALUES (?, ?, ?, ?, ?, ?)', [id, item.id, item.name, item.price, item.quantity, item.image]);
    }
    if (resource === 'users' && data.password) await conn.query('DELETE FROM sessions WHERE user_id=?', [id]);
    await audit(conn, actor, existing.length ? 'update' : 'create', resource, id);
    await conn.commit();
    return id;
  } catch (error) { await conn.rollback(); throw error; } finally { conn.release(); }
}

function registerManagement(app) {
  app.get('/api/admin/meta', (_req, res) => res.json(resources));
  for (const [resource, config] of Object.entries(resources)) {
    const route = `/api/admin/${resource}`;
    app.get(route, async (_req, res) => res.json(await list(resource)));
    app.get(`${route}/:id`, async (req, res) => { const rows = await list(resource, positiveId(req.params.id)); if (!rows.length) fail('Record not found.', 404); res.json(rows[0]); });
    app.post(route, async (req, res) => res.status(201).json({ id: await save(resource, req.body, null, req.user), message: 'Created successfully.' }));
    app.put(`${route}/:id`, async (req, res) => res.json({ id: await save(resource, req.body, positiveId(req.params.id), req.user), message: 'Saved successfully.' }));
    for (const field of ['status', 'role']) if (config.fields[field]) app.patch(`${route}/:id/${field}`, async (req, res) => {
      const rows = await list(resource, positiveId(req.params.id));
      if (!rows.length) fail('Record not found.', 404);
      await save(resource, { ...rows[0], [field]: req.body[field] }, rows[0].id, req.user);
      res.json({ message: 'Updated successfully.' });
    });
    app.delete(`${route}/:id`, async (req, res) => {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const id = positiveId(req.params.id);
        const [rows] = await conn.query(`SELECT * FROM \`${config.table || resource}\` WHERE id=? FOR UPDATE`, [id]);
        if (!rows.length) fail('Record not found.', 404);
        await protectAdmin(conn, resource, rows[0], {}, true, req.user);
        await conn.query(`DELETE FROM \`${config.table || resource}\` WHERE id=?`, [id]);
        await audit(conn, req.user, 'delete', resource, id);
        await conn.commit();
        res.json({ message: 'Deleted successfully.' });
      } catch (error) { await conn.rollback(); throw error; } finally { conn.release(); }
    });
  }
}
module.exports = { registerManagement, list, save, audit, priceOrder };
