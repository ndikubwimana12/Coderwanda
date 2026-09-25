// Real Chromium smoke test using CDP, without an additional browser dependency.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
require('dotenv').config({ path: path.join(__dirname, '.env') });
process.env.SMTP_HOST = ''; // Never send real emails from isolated tests.
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
  let uploadedImage;
  const learningUploads = [];
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
    const fixture = path.join(checks, 'test-image.png');
    await fs.writeFile(fixture, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP1cAAAAASUVORK5CYII=', 'base64'));
    const root = await cdp('DOM.getDocument');
    const inputNode = await cdp('DOM.querySelector', { nodeId: root.root.nodeId, selector: 'input[type=file]' });
    await cdp('DOM.setFileInputFiles', { nodeId: inputNode.nodeId, files: [fixture] });
    await until(() => evaluate("document.querySelector('#field-image').value.startsWith('/uploads/')"), 'image upload');
    uploadedImage = await evaluate("document.querySelector('#field-image').value");
    assert.equal((await fetch(origin + uploadedImage)).status, 200);
    await click('Save changes');
    await until(() => evaluate("document.body.innerText.includes('Browser Product') && !document.querySelector('#field-name')"), 'create product through UI');
    await click('View / edit'); await fill('#field-price', '15000'); await click('Save changes');
    await until(() => evaluate("document.body.innerText.includes('15000') && !document.querySelector('#field-name')"), 'edit product through UI');
    await cdp('Page.captureScreenshot', { format: 'png' }).then(result => fs.writeFile(path.join(checks, 'admin-products.png'), Buffer.from(result.data, 'base64')));
    for (const [route, expected] of [['/', 'Browser Product'], ['/services', 'Browser Service'], ['/ecommerce', 'Browser Product'], ['/training-room', 'Browser Course'], ['/training-room/course/browser-course', 'Database overview'], ['/training-room/enroll/browser-course', 'Browser Course'], ['/careers', 'Browser Job']]) {
      await navigate(route, expected); console.log('Database content OK:', route);
    }
    await navigate('/training-room/enroll/browser-course', 'Browser Course');
    for (const [name, value] of Object.entries({ fullName: 'Browser Student', email: 'student@example.test', phone: '0780000000', startPeriod: 'This month' })) await fill('[name=' + name + ']', value);
    await evaluate("document.querySelectorAll('input[type=checkbox]').forEach(input => { if (!input.checked) input.click(); }); document.querySelector('form').requestSubmit()");
    try { await until(() => evaluate("document.body.innerText.toLowerCase().includes('application received')"), 'enrollment submission'); } catch(error) { console.log(await evaluate("JSON.stringify({text:document.body.innerText,forms:Array.from(document.forms).map(f=>({valid:f.checkValidity(),fields:Array.from(f.elements).map(i=>({name:i.name,value:i.value,valid:i.validity?.valid}))}))})")); throw error; }
    await navigate('/careers', 'Browser Job'); await click('View Position'); await click('Apply for this Position');
    for (const [name, value] of Object.entries({ name: 'Browser Candidate', email: 'candidate@example.test', phone: '0780000000', message: 'Application from browser test' })) await fill('[name=' + name + ']', value);
    await evaluate("Array.from(document.querySelectorAll('form')).find(form => form.querySelector('[name=name]')).requestSubmit()");
    await until(() => evaluate("document.body.innerText.includes('Application Submitted')"), 'career application submission');
    const product = (await json('/products', null, null, 'GET'))[0];
    await navigate('/ecommerce', 'Browser Product');
    await evaluate('localStorage.setItem("coderwanda_cart", ' + JSON.stringify(JSON.stringify([{ ...product, price: 1, quantity: 2 }])) + ')');
    await navigate('/checkout', 'Complete Your Order');
    assert.ok(await evaluate("document.body.innerText.includes('30,000')"), 'Checkout uses database prices rather than the stale cart price');
    for (const [name, value] of Object.entries({ phone: '0780000000', address: 'Browser delivery address' })) await fill('[name=' + name + ']', value);
    await click('Confirm Order');
    await until(() => evaluate("location.pathname === '/ecommerce' && !localStorage.getItem('coderwanda_cart')"), 'checkout submission');
    const orders = await json('/admin/orders', null, admin, 'GET'); assert.equal(orders[0].total_amount, 30000);
    const enrollments = await json('/admin/enrollments', null, admin, 'GET'); assert.equal(enrollments[0].full_name, 'Browser Student');
    const applications = await json('/admin/applications', null, admin, 'GET'); assert.equal(applications[0].name, 'Browser Candidate');
    console.log('Image upload, enrollment, career application and checkout browser submissions passed.');

    for (const [route, expected] of [['/admin/analytics', 'Analytics & Business Reporting'], ['/admin/settings', 'Save settings'], ['/admin/activity-logs', 'Activity logs']]) await navigate(route, expected);
    await navigate('/admin/learning', 'Add module');
    await click('Add module'); await fill('input[maxlength="200"]','Browser Module'); await fill('form textarea','A focused learning module.');
    await evaluate("document.querySelector('form input[type=checkbox]').click()"); await click('Save content');
    await until(()=>evaluate("!document.querySelector('input[maxlength=\"200\"]') && document.body.innerText.includes('Browser Module')"),'save module');
    await click('+ Add learning unit'); await fill('input[maxlength="200"]','Your first skill'); await fill('form textarea','Practice deliberately. Read this lesson and test your knowledge.');
    const lessonRoot=await cdp('DOM.getDocument');
    const lessonInput=await cdp('DOM.querySelector',{nodeId:lessonRoot.root.nodeId,selector:'input[accept="image/png,image/jpeg,image/webp"]'});
    await cdp('DOM.setFileInputFiles',{nodeId:lessonInput.nodeId,files:[fixture]});
    await until(()=>evaluate("Array.from(document.querySelectorAll('input')).some(input=>input.value.startsWith('/learning-media/'))"),'private lesson image upload');
    learningUploads.push(await evaluate("Array.from(document.querySelectorAll('input')).find(input=>input.value.startsWith('/learning-media/')).value"));
    await evaluate("document.querySelector('form input[type=checkbox]').click()"); await click('Save content');
    await until(()=>evaluate("!document.querySelector('input[maxlength=\"200\"]') && document.body.innerText.includes('Your first skill')"),'save learning unit');
    for(const [kind,title] of [['unit','Skill check'],['exam','Course final exam']]) {
      await click('Add assessment / exam'); await fill('input[maxlength="200"]',title); await fill('form select',kind);
      await fill('form textarea','Which action helps you learn?'); await fill('input[aria-label="Question 1, option 1"]','Practice'); await fill('input[aria-label="Question 1, option 2"]','Skip the lesson');
      await evaluate("document.querySelector('form input[type=checkbox]').click()"); await click('Save content');
      await until(()=>evaluate("!document.querySelector('input[maxlength=\"200\"]') && document.body.innerText.includes("+JSON.stringify(title)+")"),'save '+kind);
    }
    await cdp('Page.captureScreenshot',{format:'png'}).then(result=>fs.writeFile(path.join(checks,'learning-studio.png'),Buffer.from(result.data,'base64')));
    await navigate('/admin/students','Browser Student'); await click('Approve & create account');
    await until(()=>evaluate("!!document.querySelector('input[readonly]')"),'student approval and activation link');
    const activationLink=await evaluate("document.querySelector('input[readonly]').value");
    await navigate('/activate-account#'+activationLink.split('#')[1],'Your place is ready.');
    await fill('input[type=password]','student-browser-password'); await fill('input[type=password]:last-of-type','student-browser-password');
    // Inputs live in separate labels, so address the confirmation by its label.
    await evaluate("(() => { const inputs=document.querySelectorAll('input[type=password]'); const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; setter.call(inputs[1],'student-browser-password'); inputs[1].dispatchEvent(new Event('input',{bubbles:true})); })()");
    await click('Activate & start learning');
    await until(()=>evaluate("location.pathname==='/learn' && document.body.innerText.includes('Browser Course')"),'activate student and open dashboard');
    await navigate('/learn/courses/'+course.id,'Browser Module'); await click('Enroll in module');
    await until(()=>evaluate("Array.from(document.querySelectorAll('button')).some(button=>button.textContent.includes('Your first skill'))"),'module enrollment');
    await evaluate("Array.from(document.querySelectorAll('button')).find(button=>button.textContent.includes('Your first skill')).click()");
    await until(()=>evaluate("document.body.innerText.includes('I have studied this unit')"),'open lesson'); await click('I have studied this unit');
    await until(()=>evaluate("Array.from(document.querySelectorAll('a')).some(link=>link.textContent==='Take assessment')"),'unlock assessment');
    await evaluate("Array.from(document.querySelectorAll('a')).find(link=>link.textContent==='Take assessment').click()");
    await until(()=>evaluate("document.body.innerText.includes('Begin assessment')"),'assessment introduction'); await click('Begin assessment');
    await until(()=>evaluate("!!document.querySelector('input[type=radio]')"),'assessment questions');
    await evaluate("document.querySelector('input[type=radio]').click()"); await click('Submit assessment');
    await until(()=>evaluate("document.body.innerText.includes('You did it!')"),'assessment grading');
    await navigate('/learn/courses/'+course.id,'Start final exam');
    await evaluate("Array.from(document.querySelectorAll('a')).find(link=>link.textContent==='Start final exam').click()");
    await until(()=>evaluate("document.body.innerText.includes('Begin assessment')"),'final exam introduction'); await click('Begin assessment');
    await until(()=>evaluate("!!document.querySelector('input[type=radio]')"),'final exam question'); await evaluate("document.querySelector('input[type=radio]').click()"); await click('Submit assessment');
    await until(()=>evaluate("document.body.innerText.includes('Get my certificate')"),'certificate awarded');
    await evaluate("Array.from(document.querySelectorAll('a')).find(link=>link.textContent==='Get my certificate').click()");
    await until(()=>evaluate("document.body.innerText.includes('Certificate of Completion') && document.body.innerText.includes('Browser Student')"),'certificate page');
    await cdp('Page.captureScreenshot',{format:'png'}).then(result=>fs.writeFile(path.join(checks,'student-certificate.png'),Buffer.from(result.data,'base64')));
    await cdp('Page.printToPDF',{printBackground:true,landscape:true,paperWidth:11.7,paperHeight:8.3}).then(result=>fs.writeFile(path.join(checks,'student-certificate.pdf'),Buffer.from(result.data,'base64')));
    await navigate('/learn','100%');
    await cdp('Page.captureScreenshot',{format:'png'}).then(result=>fs.writeFile(path.join(checks,'student-dashboard.png'),Buffer.from(result.data,'base64')));
    await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth'),false,'Student portal mobile width');
    await cdp('Page.captureScreenshot',{format:'png'}).then(result=>fs.writeFile(path.join(checks,'student-mobile.png'),Buffer.from(result.data,'base64')));
    console.log('Learning browser journey passed: content authoring, private upload, approval, activation, module enrollment, unit assessment, final exam, certificate and mobile dashboard.');
    await click('Sign out'); await until(()=>evaluate("!!document.querySelector('input[type=email]') && !!document.querySelector('input[type=password]')"),'student sign out'); await cdp('Page.navigate',{url:origin+'/login'}); await until(()=>evaluate("!!document.querySelector('input[type=password]')"),'admin login form'); await fill('input[type=email]',account.email); await fill('input[type=password]',account.password); await evaluate("document.querySelector('form').requestSubmit()");
    await until(()=>evaluate("location.pathname==='/admin'"),'restore admin session');
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
    for (const file of learningUploads) if (/^\/learning-media\/[a-f0-9-]+\.png$/.test(file)) await fs.unlink(path.join(__dirname,file.slice(1))).catch(()=>{});
    if (uploadedImage && /^\/uploads\/[a-f0-9-]+\.png$/.test(uploadedImage)) await fs.unlink(path.join(__dirname, uploadedImage.slice(1)));
    if (created && /^coderwanda_test_[a-f0-9]{12}$/.test(database)) await connection.query(`DROP DATABASE \`${database}\``);
    await connection.end();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
