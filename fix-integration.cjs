const fs = require('node:fs');
const read = file => fs.readFileSync(file, 'utf8').replaceAll('\r\n', '\n');
const write = (file, source) => { require('./frontend/node_modules/espree').parse(source, { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } }); fs.writeFileSync(file, source); };
const edit = (file, fn) => write(file, fn(read(file)));
edit('frontend/src/Pages/Ecommerce.jsx', source => {
  source = source.replaceAll('products[10]', 'productList[0]').replaceAll('products[5]', '(productList[1] || productList[0])');
  const start = source.indexOf('<div className="hidden lg:flex lg:justify-end">');
  const end = source.indexOf('\n\n                    </div>\n                </div>\n            </section>', start);
  if (start < 0 || end < 0) throw new Error('Featured product markup not found');
  return source.slice(0, start) + '{productList.length > 0 && (' + source.slice(start, end) + ')}' + source.slice(end);
});
edit('frontend/src/Pages/Home.jsx', source => source.replace('[firstText, secondText, isDeleting]', '[firstText, secondText, isDeleting, firstLine, secondLine]').replace('0781 257 942 / 0792 982 669', '{settings.data?.phone}').replace('Musanze - Yawunde near JIBU', '{settings.data?.address}').replace('{/* Hero', '{/* Hero'));
edit('frontend/src/Components/Navbar.jsx', source => {
  source = "import { getCartCount } from '../Utils/Cart';\n" + source;
  source = source.replace("import { Link, NavLink, useLocation }", "import { Link, NavLink }");
  source = source.replace('useState(0)', 'useState(getCartCount)');
  const start = source.indexOf('  const location = useLocation()');
  const end = source.indexOf('  // -----------------------------------------\n  // Listen for cart updates', start);
  return source.slice(0, start) + '  const updateCartCount = () => setCartCount(getCartCount())\n\n' + source.slice(end);
});
edit('frontend/src/Pages/Cart.jsx', source => source.replace('useState([])', 'useState(getCart)').replace('        loadCart();\n\n', '').replace('window.addEventListener("cartUpdated", loadCart);', 'window.addEventListener("cartUpdated", loadCart);\n        window.addEventListener("storage", loadCart);').replace('window.removeEventListener("cartUpdated", loadCart);', 'window.removeEventListener("cartUpdated", loadCart);\n            window.removeEventListener("storage", loadCart);'));
edit('frontend/src/Utils/Cart.js', source => source.replace('return cart ? JSON.parse(cart) : [];', `const parsed = cart ? JSON.parse(cart) : [];
        return Array.isArray(parsed) ? parsed.filter(item => item && Number.isSafeInteger(Number(item.id)) && Number(item.id) > 0 && Number.isSafeInteger(Number(item.quantity)) && Number(item.quantity) > 0 && Number.isFinite(Number(item.price)) && Number(item.price) >= 0) : [];`));
edit('frontend/src/Pages/Checkout.jsx', source => {
  source = source.replace('import { useEffect, useState }', 'import { useState }');
  source = source.replace('useState(getCart())', 'useState(getCart)');
  source = source.replace(/    useEffect\(\(\) => \{[\s\S]*?    if \(!user\) return null;/, `    if (!user || !localStorage.getItem('coderwanda_token')) return <Navigate to="/login?redirect=/checkout" replace />;`);
  return source;
});
edit('frontend/src/Admin/Components/AdminSidebar.jsx', source => source.replace("try { await api.post('/auth/logout'); } finally { clearSession(); }\n    navigate(\"/login\");", "try { await api.post('/auth/logout'); } catch { /* The local session is cleared even if the server is unavailable. */ } finally { clearSession(); navigate('/login'); }"));
const manage = read('frontend/src/Admin/Pages/Manage.jsx');
const reportFn = manage.slice(manage.indexOf('export async function downloadReport'), manage.indexOf('\nfunction Editor'));
write('frontend/src/Utils/downloadReport.js', "import api from './api';\n" + reportFn);
write('frontend/src/Admin/Pages/Manage.jsx', "import { downloadReport } from '../../Utils/downloadReport';\n" + manage.replace(reportFn, ''));
edit('frontend/src/Admin/Pages/Analytics.jsx', source => source.replace("from './Manage'", "from '../../Utils/downloadReport'"));
const theme = read('frontend/src/Admin/ThemeContext.jsx');
write('frontend/src/Admin/useAdminTheme.js', `import { createContext, useContext } from 'react';
export const ThemeContext = createContext(null);
export function useAdminTheme() { return useContext(ThemeContext) || { theme: 'light', toggleTheme: () => {}, isDark: false }; }
`);
write('frontend/src/Admin/ThemeContext.jsx', theme.slice(0, theme.indexOf('export function useAdminTheme')).replace('createContext, useContext, ', '').replace('const ThemeContext = createContext();', "import { ThemeContext } from './useAdminTheme';"));
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(dir + '/' + item.name) : [dir + '/' + item.name]); }
for (const file of walk('frontend/src').filter(file => file.endsWith('.jsx'))) edit(file, source => source.replace(/import \{ useAdminTheme \} from (["'])\.\.\/ThemeContext\1;/g, "import { useAdminTheme } from '../useAdminTheme';").replace('import { ThemeProvider, useAdminTheme } from "../ThemeContext";', "import { ThemeProvider } from '../ThemeContext';\nimport { useAdminTheme } from '../useAdminTheme';"));

edit('frontend/src/Admin/Pages/AdminDashboard.jsx', source => {
  source = source.replace(/const DEFAULT_BAR_DATA = \[[^\]]+\];/, 'const DEFAULT_BAR_DATA = Array(20).fill(0);');
  source = source.replace('useState({ api: "Online", db: "Online" })', 'useState({ api: "Checking", db: "Checking" })');
  source = source.replace('const [stats, setStats]', "const [error, setError] = useState('');\n  const [stats, setStats]");
  source = source.replace('.catch(() => {})', ".catch(() => setError('Unable to load dashboard data. Refresh to retry.'))");
  source = source.replace('<div className="space-y-3">', '<div className="space-y-3">{error && <p role="alert" className="text-red-500">{error}</p>}');
  source = source.replace('`$${', '`RWF ${').replace(/\s+change="\+\d+%"/g, '');
  source = source.replace('All Systems Operational', '{health.api === "Online" && health.db === "Online" ? "All Systems Operational" : "Check system status"}');
  return source;
});
edit('frontend/src/Admin/Components/AdminHeader.jsx', source => {
  source = "import { useState } from 'react';\nimport useRemote from '../../Utils/useRemote';\n" + source;
  source = source.replace('import { useLocation }', 'import { useLocation, useNavigate }');
  source = source.replace('const location = useLocation();', "const location = useLocation();\n  const navigate = useNavigate();\n  const [search, setSearch] = useState('');\n  const health = useRemote('/health', null);");
  source = source.replace('<div className="relative flex-1 max-w-xs ml-4 hidden md:block">', `<form onSubmit={event => { event.preventDefault(); const match = Object.entries(titles).find(([route, label]) => label.toLowerCase().includes(search.toLowerCase()) || route === search); if (match) { navigate(match[0]); setSearch(''); } }} className="relative flex-1 max-w-xs ml-4 hidden md:block">`);
  source = source.replace('placeholder="Quick search..."', 'aria-label="Find dashboard page" list="dashboard-pages" value={search} onChange={event => setSearch(event.target.value)} placeholder="Find dashboard page…"');
  source = source.replace('          />\n        </div>\n\n        <div className="ml-auto', '          />\n          <datalist id="dashboard-pages">{Object.entries(titles).map(([route, label]) => <option key={route} value={route}>{label}</option>)}</datalist>\n        </form>\n\n        <div className="ml-auto');
  source = source.replace('>Online</span>', '>{health.loading ? "Checking" : health.error ? "Offline" : "Online"}</span>');
  return source;
});
// Remove only top-level declarations/imports that ESLint identified as unused.
const espree = require('./frontend/node_modules/espree');
const results = JSON.parse(read('.checks/lint.json'));
for (const result of results) {
  const names = new Set(result.messages.filter(message => message.ruleId === 'no-unused-vars').map(message => message.message.match(/^'([^']+)'/)[1]));
  if (!names.size) continue;
  const source = read(result.filePath);
  const ast = espree.parse(source, { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true }, range: true });
  const replacements = [];
  for (const node of ast.body) {
    if (node.type === 'ImportDeclaration') {
      const remaining = node.specifiers.filter(specifier => !names.has(specifier.local.name));
      if (remaining.length === node.specifiers.length) continue;
      if (!remaining.length) replacements.push([node.start, node.end, '']);
      else {
        const defaultSpec = remaining.find(s => s.type === 'ImportDefaultSpecifier');
        const namespace = remaining.find(s => s.type === 'ImportNamespaceSpecifier');
        const named = remaining.filter(s => s.type === 'ImportSpecifier').map(s => s.imported.name === s.local.name ? s.local.name : `${s.imported.name} as ${s.local.name}`);
        const parts = [defaultSpec?.local.name, namespace ? `* as ${namespace.local.name}` : null, named.length ? `{ ${named.join(', ')} }` : null].filter(Boolean);
        replacements.push([node.start, node.end, `import ${parts.join(', ')} from ${source.slice(node.source.start, node.source.end)};`]);
      }
    } else if (node.type === 'FunctionDeclaration' && names.has(node.id.name)) replacements.push([node.start, node.end, '']);
    else if (node.type === 'VariableDeclaration' && node.declarations.length === 1 && names.has(node.declarations[0].id.name)) replacements.push([node.start, node.end, '']);
  }
  let cleaned = source;
  for (const [start, end, replacement] of replacements.sort((a, b) => b[0] - a[0])) cleaned = cleaned.slice(0, start) + replacement + cleaned.slice(end);
  write(result.filePath, cleaned);
}
console.log('Integration fixes and unused code cleanup applied.');
