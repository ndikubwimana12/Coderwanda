const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(file, 'utf8').replaceAll('\r\n', '\n');
const write = (file, source) => { const backup = path.join('.checks', 'original', file); fs.mkdirSync(path.dirname(backup), { recursive: true }); if (!fs.existsSync(backup)) fs.copyFileSync(file, backup); fs.writeFileSync(file, source); };
function edit(file, fn) { write(file, fn(read(file))); }
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(path.join(dir, item.name)) : [path.join(dir, item.name)]); }
for (const file of walk('frontend/src').filter(f => /\.(jsx|js)$/.test(f))) edit(file, source => source.replaceAll('/utils/', '/Utils/'));
const pages = { Users: 'users', Roles: 'roles', Services: 'services', Projects: 'projects', Products: 'products', Orders: 'orders', Courses: 'courses', Enrollments: 'enrollments', Careers: 'careers', Applications: 'applications', BlogPosts: 'blog', Testimonials: 'testimonials', Partners: 'partners', Subscribers: 'subscribers', Contacts: 'contacts' };
for (const [page, resource] of Object.entries(pages)) write(`frontend/src/Admin/Pages/${page}.jsx`, `import Manage from './Manage';\nexport default function Page() { return <Manage key="${resource}" resource="${resource}" />; }\n`);
write('frontend/src/Admin/Pages/Settings.jsx', "export { default } from './SiteSettings';\n");
write('frontend/src/Admin/Pages/ActivityLogs.jsx', "export { default } from './AuditLog';\n");
write('frontend/src/Utils/api.js', `import axios from 'axios';
import { clearSession } from './session';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use(config => { const token = localStorage.getItem('coderwanda_token'); if (token) config.headers.Authorization = 'Bearer ' + token; return config; });
api.interceptors.response.use(response => response, error => { if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) clearSession(); return Promise.reject(error); });
export default api;
`);
for (const page of ['Login', 'Register']) edit(`frontend/src/Pages/${page}.jsx`, source => {
  source = "import { setSession } from '../Utils/session';\n" + source;
  source = source.replace(/localStorage\.setItem\(\s*"coderwanda_user",\s*JSON.stringify\(data.user\)\s*\);/, 'setSession(data.user, data.token);');
  source = source.replace(/navigate\(redirect\);/, "navigate(data.user.admin_access ? '/admin' : (redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/'));");
  source = source.replace(/password.length < 6/g, 'password.length < 8').replace(/at least 6/g, 'at least 8').replace(/minLength=\{6\}/g, 'minLength={8}');
  return source;
});
edit('frontend/src/Admin/Components/AdminLayout.jsx', source => {
  source = "import useRemote from '../../Utils/useRemote';\nimport DataState from '../../Components/DataState';\n" + source;
  source = source.replace('const user = JSON.parse(localStorage.getItem("coderwanda_user") || "null");', "const auth = useRemote('/auth/me', null);\n  const user = auth.data;");
  source = source.replace('if (!user) return <Navigate to="/login" replace />;', `if (!localStorage.getItem('coderwanda_token')) return <Navigate to="/login?redirect=/admin" replace />;
  if (auth.loading || auth.error) return <DataState {...auth} />;
  if (!user?.admin_access) return <Navigate to="/" replace />;`);
  return source;
});
for (const file of walk('frontend/src').filter(f => /\.jsx$/.test(f))) {
  let source = read(file);
  if (/JSON.parse\(localStorage.getItem\("coderwanda_user"\)/.test(source)) {
    const relative = path.relative(path.dirname(file), 'frontend/src/Utils/session').replaceAll('\\', '/');
    source = `import { getUser } from '${relative.startsWith('.') ? relative : './' + relative}';\n` + source;
    source = source.replace(/JSON.parse\(localStorage.getItem\("coderwanda_user"\)(?: \|\| "(?:\{\}|null)")?\)/g, '(getUser() || {})');
    if (file.endsWith('Checkout.jsx')) source = source.replace('(getUser() || {})', 'getUser()');
    write(file, source);
  }
}
edit('frontend/src/Admin/Components/AdminSidebar.jsx', source => {
  source = "import api from '../../Utils/api';\nimport { clearSession } from '../../Utils/session';\n" + source;
  return source.replace('const handleLogout = () => {\n    localStorage.removeItem("coderwanda_user");', "const handleLogout = async () => {\n    try { await api.post('/auth/logout'); } finally { clearSession(); }");
});
edit('frontend/src/Components/Footer.jsx', source => source.replace("['/shop', 'E-Commerce']", "['/ecommerce', 'E-Commerce']"));
edit('frontend/vite.config.js', source => source.replace("'/api': {", "'/uploads': { target: 'http://localhost:5000', changeOrigin: true },\n      '/api': {"));
edit('frontend/src/App.jsx', source => {
  source = "import { lazy, Suspense } from 'react';\n" + source;
  source = source.replace(/import (\w+) from '(\.\/(?:Pages|Admin)\/[^']+)'/g, "const $1 = lazy(() => import('$2'));");
  return source.replace('<Routes>', '<Suspense fallback={<p className="p-8 text-center">Loading page…</p>}><Routes>').replace('</Routes>', '<Route path="*" element={<main className="p-12 text-center"><h1>Page not found</h1><a href="/">Return home</a></main>} /></Routes></Suspense>');
});
edit('frontend/src/Admin/Pages/Analytics.jsx', source => {
  source = "import { downloadReport } from './Manage';\n" + source;
  source = source.replace('  const fetchSummary = () => {\n    setLoading(true);', '  const fetchSummary = () => {');
  source = source.replace('  const handleExportCSV = (type) => {\n    window.open(`http://127.0.0.1:5000/api/admin/reports/export/${type || selectedModule}`, "_blank");\n  };', "  const handleExportCSV = (type) => { downloadReport(type || selectedModule).catch(() => setError('Export failed. Please try again.')); };\n");
  source = source.replace('const [loading, setLoading]', "const [error, setError] = useState('');\n  const [loading, setLoading]");
  source = source.replace('.catch(() => {})', ".catch(() => setError('Unable to load analytics. Please retry.'))");
  source = source.replace('<div className="space-y-4">', '<div className="space-y-4">{error && <p role="alert" className="text-red-500">{error}</p>}');
  return source;
});
console.log('Frontend dashboard and authentication integration staged.');
