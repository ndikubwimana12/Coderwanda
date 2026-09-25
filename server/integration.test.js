const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
process.env.SMTP_HOST = ''; // Never send real emails from isolated tests.
const mysql = require('mysql2/promise');

test('API permissions, dashboard management, public content and checkout', async t => {
  const database = `coderwanda_test_${crypto.randomBytes(6).toString('hex')}`;
  const connection = await mysql.createConnection({ host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT) || 3306, user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '' });
  let created = false;
  let server;
  let pool;
  try {
    await connection.query(`CREATE DATABASE \`${database}\``); created = true;
    process.env.DB_NAME = database;
    pool = require('./db');
    await require('./migrate')();
    await require('./migrate')(); // migration must be repeatable without seeding deleted records
    const app = require('./app');
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    async function request(url, method = 'GET', body, token) {
      const response = await fetch(origin + '/api' + url, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
      const content = await response.text();
      let data; try { data = JSON.parse(content); } catch { data = content; }
      return { status: response.status, data };
    }
    const account = { name: 'Test Admin', email: 'admin@example.test', phone: '0780000000', password: 'test-password-123', role: 'admin' };
    let admin;
    let user;
    await t.test('registration cannot grant admin; forged tokens and anonymous admin calls fail', async () => {
      const registration = await request('/auth/register', 'POST', account);
      assert.equal(registration.status, 201); assert.equal(registration.data.user.role, 'user');
      user = registration.data;
      assert.equal((await request('/admin/users')).status, 401);
      assert.equal((await request('/admin/users', 'GET', null, Buffer.from(JSON.stringify({ id: user.user.id, role: 'admin' })).toString('base64'))).status, 401);
      assert.equal((await request('/admin/users', 'GET', null, user.token)).status, 403);
      await pool.query("UPDATE users SET role='admin' WHERE id=?", [user.user.id]);
      admin = (await request('/auth/login', 'POST', account)).data;
      assert.equal(admin.user.admin_access, 1);
      const ordinary = await request('/auth/register', 'POST', { ...account, email: 'user@example.test' }); user = ordinary.data;
    });
    const records = {};
    const examples = {
      products: { name: 'Database Product', brand: 'Brand', category: 'New Category', price: 2500, old_price: 3000, image: 'https://example.test/image.png', rating: 4 },
      services: { title: 'Database Service', category: 'Custom', short_description: 'Summary', description: 'Description', features: ['One', 'Two'], active: '1' },
      courses: { title: 'Database Course', slug: 'database-course', category: 'Custom', level: 'Beginner', duration: '1 Month', price: 10000, description: 'Course description', skills: ['JS'], projects: ['Build an app'] },
      careers: { title: 'Database Job', type: 'Full-time', location: 'Rwanda', level: 'Junior', description: 'Job description', skills: ['JS'], responsibilities: ['Develop'], active: '1' },
      projects: { title: 'Database Project', category: 'Website', description: 'Project description' },
      blog: { title: 'Database Blog', slug: 'database-blog', content: 'Content' },
      testimonials: { name: 'Test Student', content: 'Great course', rating: 5 },
      partners: { name: 'Database Partner', website: 'https://example.test' },
      subscribers: { email: 'subscriber@example.test' },
      contacts: { name: 'Visitor', email: 'visitor@example.test', subject: 'Help', message: 'Message' },
      roles: { name: 'editor', description: 'Content team', admin_access: '0' },
      users: { ...account, email: 'managed@example.test', role: 'user' },
    };
    await t.test('every content module supports create, read, edit, export and public visibility', async () => {
      const meta = await request('/admin/meta', 'GET', null, admin.token); assert.equal(meta.status, 200);
      for (const [resource, payload] of Object.entries(examples)) {
        const created = await request(`/admin/${resource}`, 'POST', payload, admin.token);
        assert.equal(created.status, 201, resource + ': ' + JSON.stringify(created.data)); records[resource] = created.data.id;
        const rows = await request(`/admin/${resource}`, 'GET', null, admin.token);
        assert.equal(rows.status, 200); assert.ok(rows.data.some(row => row.id === created.data.id));
        assert.ok(rows.data.every(row => !('password' in row)));
        const updated = await request(`/admin/${resource}/${created.data.id}`, 'PUT', payload, admin.token);
        assert.equal(updated.status, 200, resource + ': ' + JSON.stringify(updated.data));
        assert.equal((await request(`/admin/reports/export/${resource}`, 'GET', null, admin.token)).status, 200);
        if (meta.data[resource].public) {
          const publicRows = await request(`/${resource}`); assert.equal(publicRows.status, 200); assert.ok(publicRows.data.some(row => row.id === created.data.id));
        }
      }
      const hidden = await request(`/admin/services/${records.services}`, 'PUT', { ...examples.services, active: '0' }, admin.token); assert.equal(hidden.status, 200);
      assert.equal((await request('/services')).data.length, 0);
      await request(`/admin/services/${records.services}`, 'PUT', examples.services, admin.token);
      assert.equal((await request('/courses/database-course')).data.skills[0], 'JS');
    });
    await t.test('forms accept database courses and jobs; orders ignore browser prices', async () => {
      examples.enrollments = { full_name: 'Student', email: 'student@example.test', phone: '0780000000', course_id: records.courses };
      examples.applications = { name: 'Candidate', email: 'candidate@example.test', phone: '0780000000', job_id: records.careers };
      examples.orders = { full_name: 'Buyer', phone: '0780000000', city: 'Kigali', address: 'Test address', items: [{ id: records.products, quantity: 2, price: 1 }] };
      for (const resource of ['enrollments', 'applications', 'orders']) {
        const result = await request(`/admin/${resource}`, 'POST', examples[resource], admin.token); assert.equal(result.status, 201, JSON.stringify(result.data)); records[resource] = result.data.id;
        assert.equal((await request(`/admin/${resource}/${result.data.id}`, 'PUT', examples[resource], admin.token)).status, 200);
      }
      assert.equal((await request('/enrollments', 'POST', examples.enrollments)).status, 201);
      assert.equal((await request('/careers/applications', 'POST', examples.applications)).status, 201);
      const order = await request('/orders', 'POST', examples.orders, user.token);
      assert.equal(order.status, 201); assert.equal(order.data.total_amount, 5000);
      assert.equal((await request('/orders', 'POST', { ...examples.orders, items: [{ id: records.products, quantity: -1 }] }, user.token)).status, 400);
      assert.equal((await request('/orders', 'POST', { ...examples.orders, items: [{ id: 999999, quantity: 1 }] }, user.token)).status, 400);
      assert.equal((await request('/orders/my', 'GET', null, user.token)).data.length, 1);
      assert.equal((await request('/admin/orders', 'GET', null, user.token)).status, 403);
    });
    await t.test('last admin, validation, settings, logs and reports', async () => {
      assert.equal((await request(`/admin/users/${admin.user.id}/role`, 'PATCH', { role: 'user' }, admin.token)).status, 400);
      assert.equal((await request(`/admin/users/${admin.user.id}`, 'DELETE', null, admin.token)).status, 400);
      assert.equal((await request('/admin/products', 'POST', { ...examples.products, price: -1 }, admin.token)).status, 400);
      assert.equal((await request('/admin/partners', 'POST', { name: 'Unsafe', website: 'javascript:alert(1)' }, admin.token)).status, 400);
      assert.equal((await request('/admin/uploads', 'POST', { data: Buffer.from('<svg/>').toString('base64') }, admin.token)).status, 400);
      const settings = await request('/settings'); assert.equal(settings.status, 200);
      assert.equal((await request('/admin/settings', 'PUT', { ...settings.data, hero_title: 'Database heading' }, admin.token)).status, 200);
      assert.equal((await request('/settings')).data.hero_title, 'Database heading');
      assert.ok((await request('/admin/activity-logs', 'GET', null, admin.token)).data.length > 0);
      assert.equal((await request('/admin/stats', 'GET', null, admin.token)).status, 200);
      assert.equal((await request('/admin/reports/summary', 'GET', null, admin.token)).status, 200);
    });
    await t.test('all modules delete and removed public content stays removed after migration', async () => {
      for (const resource of ['orders', 'enrollments', 'applications', ...Object.keys(examples).filter(r => !['orders', 'enrollments', 'applications'].includes(r))]) {
        const result = await request(`/admin/${resource}/${records[resource]}`, 'DELETE', null, admin.token);
        assert.equal(result.status, 200, resource + ': ' + JSON.stringify(result.data));
      }
      await require('./migrate')();
      assert.deepEqual((await request('/products')).data, []);
      assert.deepEqual((await request('/courses')).data, []);
      assert.equal((await request('/auth/logout', 'POST', {}, user.token)).status, 200);
      assert.equal((await request('/auth/me', 'GET', null, user.token)).status, 401);
    });
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    if (pool) await pool.end();
    // Only the random, isolated database created by this test is removed.
    if (created && /^coderwanda_test_[a-f0-9]{12}$/.test(database)) await connection.query(`DROP DATABASE \`${database}\``);
    await connection.end();
  }
});
