const fs=require('node:fs');const path=require('node:path');const parse=require('./frontend/node_modules/espree').parse;
function edit(file,fn){const source=fs.readFileSync(file,'utf8').replaceAll('\r\n','\n');const next=fn(source);if(/\.(js|jsx)$/.test(file))parse(next,{ecmaVersion:'latest',sourceType:file.startsWith('frontend')?'module':'script',ecmaFeatures:{jsx:true}});const backup=path.join('.checks','before-learning',file);fs.mkdirSync(path.dirname(backup),{recursive:true});if(!fs.existsSync(backup))fs.copyFileSync(file,backup);fs.writeFileSync(file,next);}
edit('server/migrate.js',source=>source.replace("  await pool.query('DELETE FROM sessions WHERE expires_at < NOW()');",`  const [userColumns] = await pool.query('SHOW COLUMNS FROM users');
  if (!userColumns.some(column => column.Field === 'account_active')) await pool.query('ALTER TABLE users ADD COLUMN account_active TINYINT NOT NULL DEFAULT 1');
  const learningSQL = await fs.readFile(path.join(__dirname, 'learning-schema.sql'), 'utf8');
  for (const statement of learningSQL.split(';').map(value => value.trim()).filter(Boolean)) await pool.query(statement);
  await pool.query('DELETE FROM sessions WHERE expires_at < NOW()');`));
edit('server/management.js',source=>source.replace("      if (!course.length) fail('Select an existing course.');","      if (!course.length) fail('Select an existing course.');\n      await require('./learning-accounts').ensureStudentAccount(conn, data, existing[0]);").replace('    await conn.commit();\n    return id;',"    await conn.commit();\n    if (resource === 'enrollments') require('./learning-accounts').deliverNotifications().catch(() => {});\n    return id;"));
edit('server/auth.js',source=>source.replace('s.expires_at > NOW()', 's.expires_at > NOW() AND u.account_active=1'));
edit('server/app.js',source=>{
source=source.replace("if (!rows.length || !await bcrypt.compare(req.body.password, rows[0].password))", "if (!rows.length || !rows[0].account_active || !await bcrypt.compare(req.body.password, rows[0].password))");
source=source.replace("  const user = format('users', rows[0]);", "  const user = format('users', rows[0]);\n  const [enrollments] = await pool.query(\"SELECT id FROM enrollments WHERE user_id=? AND status IN ('approved','completed') LIMIT 1\", [user.id]);\n  user.is_student = enrollments.length > 0;");
source=source.replace("require('./reports')(app);", "require('./reports')(app);\nrequire('./learning-media').registerMedia(app);\nrequire('./learning').registerLearning(app);");return source;});
edit('server/start.js',source=>source.replace("  const server = app.listen", "  const notificationTimer = setInterval(() => require('./learning-accounts').deliverNotifications().catch(() => {}), 60000);\n  notificationTimer.unref();\n  const server = app.listen"));
edit('frontend/src/App.jsx',source=>{
const imports=`const StudentDashboard = lazy(() => import('./Learning/StudentDashboard'));
const CoursePlayer = lazy(() => import('./Learning/CoursePlayer'));
const Assessment = lazy(() => import('./Learning/Assessment'));
const ActivateAccount = lazy(() => import('./Learning/ActivateAccount'));
const Certificate = lazy(() => import('./Learning/Certificate'));
const AdminLearning = lazy(() => import('./Learning/AdminLearning'));
const AdminStudents = lazy(() => import('./Learning/AdminStudents'));
`;
source=source.replace('const App = () => {',imports+'\nconst App = () => {');
source=source.replace('{/* Public routes */}',`{/* Learning routes */}
        <Route path="/learn" element={<StudentDashboard />} />
        <Route path="/learn/courses/:courseId" element={<CoursePlayer />} />
        <Route path="/learn/assessments/:assessmentId" element={<Assessment />} />
        <Route path="/activate-account" element={<ActivateAccount />} />
        <Route path="/certificates/:code" element={<Certificate />} />
        {/* Public routes */}`);
source=source.replace('<Route index element={<AdminDashboard />} />','<Route index element={<AdminDashboard />} />\n          <Route path="learning" element={<AdminLearning />} />\n          <Route path="students" element={<AdminStudents />} />');return source;});
edit('frontend/src/Admin/Components/AdminSidebar.jsx',source=>source.replace('{ label: "Courses", to: "/admin/courses", icon: BookOpen },','{ label: "Courses", to: "/admin/courses", icon: BookOpen },\n      { label: "Learning Studio", to: "/admin/learning", icon: BookOpen },\n      { label: "Student Progress", to: "/admin/students", icon: ClipboardList },'));
edit('frontend/src/Admin/Components/AdminHeader.jsx',source=>source.replace('const titles = {','const titles = {\n  "/admin/learning": "Learning Studio",\n  "/admin/students": "Student Progress",'));
edit('frontend/src/Pages/Enrollment.jsx',()=>"export { default } from '../Learning/EnrollmentApplication';\n");
edit('frontend/src/Pages/Login.jsx',source=>source.replace('const redirect = params.get("redirect") || "/ecommerce";', 'const redirect = params.get("redirect");').replace("navigate(data.user.admin_access ? '/admin' : (redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/'));", "navigate(redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : data.user.admin_access ? '/admin' : data.user.is_student ? '/learn' : '/ecommerce');"));
edit('frontend/src/Components/Navbar.jsx',source=>source.replace("{ to: '/training', label: 'Training Room' },", "{ to: '/training', label: 'Training Room' },\n  { to: '/learn', label: 'Student Portal' },"));
edit('frontend/src/Admin/Pages/Enrollments.jsx',()=>`import { Link } from 'react-router-dom';
import Manage from './Manage';
export default function Page() { return <div className="space-y-5"><Link to="/admin/students" className="inline-block rounded-xl bg-purple-700 px-5 py-3 font-bold text-white">Approve applicants, activate accounts & view learning progress →</Link><Manage resource="enrollments" /></div>; }
`);
edit('frontend/src/Admin/Pages/Courses.jsx',()=>`import { Link } from 'react-router-dom';
import Manage from './Manage';
export default function Page() { return <div className="space-y-5"><Link to="/admin/learning" className="inline-block rounded-xl bg-purple-700 px-5 py-3 font-bold text-white">Build course modules, video lessons & assessments →</Link><Manage resource="courses" /></div>; }
`);
edit('.gitignore',source=>source+'\nserver/learning-media/\n');
edit('server/.env.example',source=>source+`\n# Public URL used in student activation links\nPUBLIC_ORIGIN=http://localhost:5173\n# Configure SMTP to deliver approval/activation messages automatically\nSMTP_HOST=\nSMTP_PORT=587\nSMTP_SECURE=false\nSMTP_USER=\nSMTP_PASSWORD=\nSMTP_FROM=\n# Set a long random secret for private lesson-media links in production\nLEARNING_MEDIA_SECRET=\n`);
console.log('Learning platform wired into the existing app with source backups.');
