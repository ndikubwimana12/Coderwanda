const fs = require('node:fs');
const path = require('node:path');
const parse = require('./frontend/node_modules/espree').parse;
function edit(file, fn) {
  const source = fs.readFileSync(file, 'utf8').replaceAll('\r\n', '\n');
  const next = fn(source);
  if (/\.(js|jsx)$/.test(file)) parse(next, { ecmaVersion: 'latest', sourceType: file.startsWith('frontend') ? 'module' : 'script', ecmaFeatures: { jsx: true } });
  const backup = path.join('.checks', 'before-final-details', file); fs.mkdirSync(path.dirname(backup), { recursive: true }); if (!fs.existsSync(backup)) fs.copyFileSync(file, backup);
  fs.writeFileSync(file, next);
}
edit('server/validation.js', source => source.replace("value = String(value).trim();", "value = field.type === 'password' ? String(value) : String(value).trim();").replace("if (field.type === 'password' && value.length < 8)", "if (field.type === 'password' && (value.length < 8 || Buffer.byteLength(value, 'utf8') > 72))").replace('Password must have at least 8 characters.', 'Password must have at least 8 characters and at most 72 UTF-8 bytes.'));
edit('server/app.js', source => source.replace("app.post('/api/enrollments', async (req, res) => {", "app.post('/api/enrollments', (req, res, next) => req.headers.authorization ? authenticate(req, res, next) : next(), async (req, res) => {").replace("user_id: null, course_id: courses[0].id, status: 'pending' }, null, null", "user_id: req.user?.id || null, course_id: courses[0].id, status: 'pending' }, null, req.user"));
edit('server/db.js', source => source.replace('host: process.env.DB_HOST || "127.0.0.1",', 'host: process.env.DB_HOST || "127.0.0.1",\n    port: Number(process.env.DB_PORT) || 3306,'));
for (const file of ['server/integration.test.js', 'server/browser.test.cjs']) edit(file, source => source.replace("host: process.env.DB_HOST || '127.0.0.1', user:", "host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT) || 3306, user:"));
edit('frontend/src/Pages/Home.jsx', source => source.replace('We build digital solutions, empower people with technical\n                            skills, and provide quality technology products and services\n                            that drive growth and create opportunities.', '{settings.data?.hero_description}'));
edit('frontend/src/Pages/Contact.jsx', source => {
  source = "import useRemote from '../Utils/useRemote';\n" + source;
  source = source.replace(/const contactInfo = \[[\s\S]*?\n\]/, '');
  return source.replace('export default function Contact() {', `export default function Contact() {
    const settings = useRemote('/settings', null);
    const contactInfo = settings.data ? [
      { icon: 'fa-solid fa-location-dot', title: 'Our Location', value: settings.data.address },
      { icon: 'fa-solid fa-phone', title: 'Call Us', value: settings.data.phone },
      { icon: 'fa-solid fa-envelope', title: 'Email Us', value: settings.data.contact_email },
      { icon: 'fa-regular fa-clock', title: 'Working Hours', value: settings.data.hours },
    ] : [];`);
});
edit('frontend/src/Components/Footer.jsx', source => source.replace('CodeRwanda. All', "{settings.data?.site_name || 'CodeRwanda'}. All"));
edit('frontend/src/Pages/Checkout.jsx', source => {
  source = "import useRemote from '../Utils/useRemote';\nimport DataState from '../Components/DataState';\n" + source;
  source = source.replace('    getCartTotal,\n', '');
  source = source.replace('const [cart] = useState(getCart);', `const [storedCart] = useState(getCart);
    const catalog = useRemote('/products');
    const cart = storedCart.map(item => { const product = catalog.data.find(product => product.id === item.id); return product ? { ...product, quantity: item.quantity } : null; }).filter(Boolean);`);
  source = source.replace('    if (cart.length === 0) {', `    if (catalog.loading || catalog.error) return <DataState {...catalog} />;
    if (storedCart.length !== cart.length) return <main className="p-10 text-center"><h1>Some cart items are no longer available.</h1><a href="/cart">Return to your cart and remove unavailable items.</a></main>;
    if (cart.length === 0) {`);
  return source.replace('const total = getCartTotal();', 'const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);').replace('Pay using supported mobile money services.', 'We will contact you with Mobile Money payment instructions.');
});
edit('frontend/src/Pages/Ecommerce.jsx', source => {
  source = source.replace('import { Link, useNavigate }', 'import { Link }').replace('    const navigate = useNavigate();', '');
  const start = source.indexOf('        /*\n          Customer must login before shopping.');
  const end = source.indexOf('        const currentCart =', start);
  if (start < 0 || end < 0) throw new Error('Cart login block not found');
  source = source.slice(0, start) + source.slice(end);
  return source;
});
edit('frontend/src/Admin/Pages/AdminDashboard.jsx', source => source.replace('HardDrive, Shield, ', '').replace('height: `${h}%`', 'height: `${(h / Math.max(1, ...chartData)) * 100}%`').replace('<span className="text-xs font-black text-emerald-600">99.9% uptime</span>', '').replace('              { name: "Storage", status: "Healthy", icon: HardDrive, color: "emerald" },\n', '').replace('              { name: "Security", status: "Protected", icon: Shield, color: "emerald" },\n', ''));
edit('frontend/src/Admin/Components/RecentActivity.jsx', source => source.replace('Â· $${', '· RWF ${').replace('· $${', '· RWF ${'));
edit('frontend/src/Admin/Components/AdminSidebar.jsx', source => source.replace('object-contain brightness-0 invert', 'object-contain'));
edit('frontend/src/Utils/useRemote.js', source => source.replace("window.addEventListener('contentChanged', reload);", "window.addEventListener('contentChanged', reload);\n    window.addEventListener('authChanged', reload);").replace("window.removeEventListener('contentChanged', reload);", "window.removeEventListener('contentChanged', reload); window.removeEventListener('authChanged', reload);"));
// Lazy-decode non-hero images without changing the original visual assets.
for (const file of ['frontend/src/Pages/Home.jsx', 'frontend/src/Pages/Services.jsx', 'frontend/src/Pages/TrainingRoom.jsx', 'frontend/src/Pages/Ecommerce.jsx', 'frontend/src/Pages/CourseDetails.jsx']) edit(file, source => source.replace(/<img\s*\n(\s*)src=\{(service|course|product|testimonial)\./g, '<img loading="lazy" decoding="async"\n$1src={$2.'));
edit('server/package.json', source => { const pkg = JSON.parse(source); pkg.scripts['test:browser'] = 'node browser.test.cjs'; return JSON.stringify(pkg, null, 2) + '\n'; });
edit('frontend/README.md', () => '# CodeRwanda frontend\n\nSee [the project README](../README.md) for setup, administrator access, database integration, testing and deployment.\n');
console.log('Final form, settings, pricing, session and documentation details applied.');
