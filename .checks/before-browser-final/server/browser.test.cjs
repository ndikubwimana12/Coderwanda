// Real Chromium smoke test using CDP, without an additional browser dependency.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, label, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { if (await fn()) return; await pause(100); }
  throw new Error('Timed out: ' + label);
}
async function main() {
  const database = `coderwanda_test_${crypto.randomBytes(6).toString('hex')}`;
  const connection = await mysql.createConnection({ host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT) || 3306, user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '' });
  let created = false, pool, server, chrome, socket;
  try {
    await connection.query(`CREATE DATABASE \`${database}\``); created = true; process.env.DB_NAME = database;
    pool = require('./db'); await require('./migrate')();
    server = require('./app').listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const json = async (route, body, token, method = 'POST') => {
      const response = await fetch(origin + '/api' + route, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
      const result = await response.json(); assert.ok(response.ok, JSON.stringify(result)); return result;
    };
    const account = { name: 'Browser Admin', email: 'browser@example.test', phone: '0780000000', password: 'browser-test-password' };
    const registration = await json('/auth/register', account); await pool.query("UPDATE users SET role='admin' WHERE id=?", [registration.user.id]);
    const session = await json('/auth/login', account);
    const admin = session.token;
    const course = await json('/admin/courses', { title: 'Browser Course', slug: 'browser-course', category: 'Browser Category', level: 'Beginner', duration: '2 Weeks', price: 10000, description: 'Database course description', overview: 'Database overview', skills: ['JavaScript'], projects: ['Browser project'] }, admin);
    await json('/admin/services', { title: 'Browser Service', category: 'Browser Category', short_description: 'Database summary', description: 'Database service details', features: ['Feature one'], active: '1' }, admin);
    await json('/admin/careers', { title: 'Browser Job', type: 'Full-time', location: 'Kigali', level: 'Junior', description: 'Build apps', active: '1', skills: ['JavaScript'], responsibilities: ['Build'] }, admin);
    const checks = path.resolve(__dirname, '..', '.checks');
    const profile = path.join(checks, 'browser-' + Date.now()); await fs.mkdir(profile, { recursive: true });
    const executable = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    chrome = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-extensions', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
    let debugPort;
    await until(async () => { try { debugPort = (await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; return !!debugPort; } catch { return false; } }, 'Chrome debugging port');
    const tabs = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
    socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
    await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
    let id = 0;
    const pending = new Map();
    const errors = [];
    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) { const request = pending.get(message.id); pending.delete(message.id); message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result); }
      if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    });
    const cdp = (method, params = {}) => new Promise((resolve, reject) => { const key = ++id; pending.set(key, { resolve, reject }); socket.send(JSON.stringify({ id: key, method, params })); });
    const evaluate = async expression => { const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text); return result.result.value; };
    await cdp('Runtime.enable'); await cdp('Page.enable');
    await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    const navigate = async (route, text) => { await cdp('Page.navigate', { url: origin + route }); await until(async () => evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`), route + ': ' + text); };
    const click = async text => { assert.ok(await evaluate(`(() => { const button = Array.from(document.querySelectorAll('button')).find(item => item.textContent.trim() === ${JSON.stringify(text)}); if (!button) return false; button.click(); return true; })()`), 'Button: ' + text); };
    const fill = async (selector, value) => { await evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); if (!input) throw new Error('Missing input'); const proto = input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : input.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); })()`); };
    await navigate('/login', 'Welcome back');
    await fill('input[type=email]', account.email); await fill('input[type=password]', account.password);
    await evaluate("document.querySelector('form').requestSubmit()");
    await until(() => evaluate("location.pathname === '/admin' && document.body.innerText.includes('Welcome back')"), 'admin login');
    const modules = ['users', 'roles', 'services', 'projects', 'products', 'orders', 'courses', 'enrollments', 'careers', 'applications', 'blog', 'testimonials', 'partners', 'subscribers', 'contacts'];
    for (const module of modules) {
      await navigate('/admin/' + module, 'Add new');
      await click('Add new'); await until(() => evaluate("!!document.querySelector('form button') && document.body.innerText.includes('Save changes')"), 'Editor: ' + module);
      await click('Cancel');
      console.log('Dashboard editor OK:', module);
    }
    await navigate('/admin/products', 'Add new'); await click('Add new');
    for (const [key, value] of Object.entries({ name: 'Browser Product', brand: 'Browser Brand', category: 'Browser Category', price: '12345' })) await fill('#field-' + key, value);
    await click('Save changes');
    await until(() => evaluate("document.body.innerText.includes('Browser Product') && !document.querySelector('#field-name')"), 'create product through UI');
    await click('View / edit'); await fill('#field-price', '15000'); await click('Save changes');
    await until(() => evaluate("document.body.innerText.includes('15000') && !document.querySelector('#field-name')"), 'edit product through UI');
    await cdp('Page.captureScreenshot', { format: 'png' }).then(result => fs.writeFile(path.join(checks, 'admin-products.png'), Buffer.from(result.data, 'base64')));
    for (const [route, expected] of [['/', 'Browser Product'], ['/services', 'Browser Service'], ['/ecommerce', 'Browser Product'], ['/training-room', 'Browser Course'], ['/training-room/course/browser-course', 'Database overview'], ['/training-room/enroll/browser-course', 'Browser Course'], ['/careers', 'Browser Job']]) {
      await navigate(route, expected); console.log('Database content OK:', route);
    }
    await navigate('/training-room/enroll/browser-course', 'Browser Course');
    console.log('Enrollment form inputs:', await evaluate("Array.from(document.querySelectorAll('form input, form select, form textarea')).map(i => ({name:i.name,required:i.required,options:i.tagName==='SELECT'?Array.from(i.options).map(o=>o.value):undefined}))"));
    for (const [route, expected] of [['/admin/analytics', 'Analytics & Business Reporting'], ['/admin/settings', 'Save settings'], ['/admin/activity-logs', 'Activity logs']]) await navigate(route, expected);
    await navigate('/ecommerce', 'Browser Product');
    await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await cdp('Page.captureScreenshot', { format: 'png' }).then(result => fs.writeFile(path.join(checks, 'store-mobile.png'), Buffer.from(result.data, 'base64')));
    const overflow = await evaluate('document.documentElement.scrollWidth > innerWidth'); assert.equal(overflow, false, 'Mobile storefront should not overflow horizontally');
    await navigate('/admin/products', 'Add new'); await click('Delete'); await click('Delete record');
    await until(() => evaluate("!document.body.innerText.includes('Browser Product')"), 'delete product through UI');
    await navigate('/ecommerce', 'No products published yet');
    assert.equal((await json('/courses/' + course.id, null, null, 'GET')).title, 'Browser Course');
    assert.deepEqual(errors, [], 'No uncaught browser errors');
    console.log('Browser verification passed: admin login, all sidebar pages/editors, product CRUD, public data, empty catalog and mobile layout.');
  } finally {
    if (socket) socket.close();
    if (chrome) chrome.kill();
    if (server) await new Promise(resolve => server.close(resolve));
    if (pool) await pool.end();
    if (created && /^coderwanda_test_[a-f0-9]{12}$/.test(database)) await connection.query(`DROP DATABASE \`${database}\``);
    await connection.end();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
