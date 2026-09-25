const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(file, 'utf8').replaceAll('\r\n', '\n');
function edit(file, fn) { const source = read(file); const backup = path.join('.checks', 'original', file); fs.mkdirSync(path.dirname(backup), { recursive: true }); if (!fs.existsSync(backup)) fs.copyFileSync(file, backup); fs.writeFileSync(file, fn(source)); }
const prefix = "import useRemote from '../Utils/useRemote';\nimport DataState from '../Components/DataState';\n";
const state = (variable, label) => `<DataState {...${variable}} empty={!${variable}.data.length} label="${label}" />`;

edit('frontend/src/Pages/Home.jsx', source => {
  source = prefix + source;
  source = source.replace(/const DEFAULT_SERVICES = \[[\s\S]*?const reasons =/, 'const reasons =');
  source = source.replace('const firstLine = "Empowering Rwanda";', "const settings = useRemote('/settings', null);\n        const firstLine = settings.data?.hero_title || '';" ).replace('const secondLine = "Through Technology";', "const secondLine = settings.data?.hero_subtitle || '';" );
  const start = source.indexOf('        const [services, setServices]');
  const end = source.indexOf('        useEffect(() => {\n            let timer;', start);
  source = source.slice(0, start) + `        const serviceData = useRemote('/services');
        const productData = useRemote('/products');
        const courseData = useRemote('/courses');
        const services = serviceData.data.slice(0, 4);
        const products = productData.data.slice(0, 5);
        const courses = courseData.data.slice(0, 5);

` + source.slice(end);
  source = source.replace('{services.map((service, i) => (', state('serviceData', 'services') + '\n{services.map((service) => (');
  source = source.replace('{products.map((product) => (', state('productData', 'products') + '\n{products.map((product) => (');
  source = source.replace('{courses.map((course, i) => (', state('courseData', 'courses') + '\n{courses.map((course, i) => (');
  source = source.replace('{course.title}\n                                </h3>', '<Link to={`/training-room/course/${course.slug}`}>{course.title}</Link>\n                                </h3>');
  source = source.replace('<Navbar />', '<Navbar />\n            {settings.error && <DataState {...settings} />}');
  source = source.replace('<Footer />', '<PublicContent />\n            <Footer />');
  source = "import PublicContent from '../Components/PublicContent';\n" + source;
  return source;
});

edit('frontend/src/Pages/Services.jsx', source => {
  source = prefix + source;
  source = source.replace(/const services = \[[\s\S]*?export default function Services\(\) \{/, `export default function Services() {
    const remote = useRemote('/services');
    const services = useMemo(() => remote.data.map(item => ({ ...item, shortDescription: item.short_description })), [remote.data]);
    const categories = [{ name: 'All Services', icon: 'fa-solid fa-layer-group' }, ...Array.from(new Set(services.map(item => item.category))).map(name => ({ name, icon: 'fa-solid fa-code' }))];`);
  source = source.replace('}, [activeCategory])', '}, [activeCategory, services])');
  source = source.replace('(currentPage - 1) * servicesPerPage', '(Math.min(currentPage, Math.max(1, totalPages)) - 1) * servicesPerPage');
  source = source.replace('<Navbar />', '<Navbar />\n            ' + state('remote', 'services'));
  return source;
});

edit('frontend/src/Pages/Ecommerce.jsx', source => {
  source = prefix + source;
  source = source.replace(/const categories = \[[\s\S]*?const formatRWF =/, 'const formatRWF =');
  source = source.replace('const [productList, setProductList] = useState(products);', `const remote = useRemote('/products');
    const productList = useMemo(() => remote.data.map(item => ({ ...item, oldPrice: item.old_price })), [remote.data]);
    const categories = Array.from(new Set(productList.map(item => item.category))).map(name => ({ name, count: productList.filter(item => item.category === name).length, icon: 'fa-solid fa-box', image: productList.find(item => item.category === name)?.image }));`);
  source = source.replace(/    useEffect\(\(\) => \{\n        api.get\("\/products"\)[\s\S]*?    \}, \[\]\);/, '');
  source = source.replace('<Navbar />', '<Navbar />\n            ' + state('remote', 'products'));
  source = source.replace('const [cart, setCart]', 'const [, setCart]');
  return source;
});

edit('frontend/src/Pages/TrainingRoom.jsx', source => {
  source = prefix + source;
  const start = source.indexOf('const FALLBACK_IMAGES');
  const end = source.indexOf('    return (', source.indexOf('export default function TrainingRoom'));
  source = source.slice(0, start) + `export default function TrainingRoom() {
    const remote = useRemote('/courses');
    const projectData = useRemote('/projects');
    const testimonialData = useRemote('/testimonials');
    const courses = remote.data.map(course => ({ ...course, icon: getIcon(course.title) }));
    const projects = projectData.data;
    const testimonials = testimonialData.data;
` + source.slice(end);
  source = source.replace('<Navbar />', '<Navbar />\n            ' + state('remote', 'courses'));
  source = source.replace('{projects.map((project) => (', state('projectData', 'projects') + '\n{projects.map((project) => (').replace('key={project}', 'key={project.id}').replace('{project}\n', '{project.title}\n');
  source = source.replace('{testimonials.map((testimonial) => (', state('testimonialData', 'testimonials') + '\n{testimonials.map((testimonial) => (').replace('key={testimonial.name}', 'key={testimonial.id}').replace('testimonial.text', 'testimonial.content').replace('testimonial.course', 'testimonial.role').replace('[1, 2, 3, 4, 5].map((star)', 'Array.from({ length: testimonial.rating || 0 }, (_, i) => i).map((star)');
  return source;
});

edit('frontend/src/Pages/CourseDetails.jsx', source => {
  source = prefix + source;
  source = source.replace(/const courses = \[[\s\S]*?export default function CourseDetails\(\) \{/, 'export default function CourseDetails() {');
  const start = source.indexOf('    const [course, setCourse]');
  const end = source.indexOf('    if (loading)', start);
  source = source.slice(0, start) + `    const remote = useRemote('/courses/' + encodeURIComponent(courseId), null);
    const course = remote.data;
    const loading = remote.loading;
    if (remote.error) return <main><Navbar /><DataState {...remote} /><Footer /></main>;

` + source.slice(end);
  source = source.replace('to={`/training-room/enroll/${course.id}`}', 'to={`/training-room/enroll/${course.slug}`}');
  return source;
});

edit('frontend/src/Pages/Enrollment.jsx', source => {
  source = prefix + source;
  source = source.replace(/const courses = \[[\s\S]*?export default function Enrollment\(\) \{/, 'export default function Enrollment() {');
  source = source.replace(/    const course = useMemo\([\s\S]*?    \);/, `    const remote = useRemote('/courses/' + encodeURIComponent(slug), null);
    const course = remote.data;
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);`);
  source = source.replace('    if (!course) {', '    if (remote.loading || remote.error) return <main><Navbar /><DataState {...remote} /><Footer /></main>;\n\n    if (!course) {');
  return source;
});

edit('frontend/src/Pages/Careers.jsx', source => {
  source = prefix + source;
  source = source.replace('import { useState }', 'import { useEffect, useState }');
  const start = source.indexOf('const jobs = [');
  const end = source.indexOf('\n];', start) + 4;
  source = source.slice(0, start) + source.slice(end);
  source = source.replace('export default function Careers() {', `export default function Careers() {
    const remote = useRemote('/careers');
    const jobs = remote.data.map(job => ({ ...job, icon: BriefcaseBusiness }));
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);`);
  source = source.replace('    const [submitted, setSubmitted] = useState(false);', `    const [submitted, setSubmitted] = useState(false);
    useEffect(() => {
      if (!selectedJob) return;
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const close = event => { if (event.key === 'Escape') setSelectedJob(null); };
      window.addEventListener('keydown', close);
      return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', close); };
    }, [selectedJob]);`);
  source = source.replace(/        document.body.style.overflow = "(?:hidden|auto)";/g, '');
  source = source.replace('job_title:      selectedJob?.title,', 'job_id: selectedJob?.id,\n                job_title: selectedJob?.title,');
  source = source.replace('<Navbar />', '<Navbar />\n            ' + state('remote', 'job listings'));
  return source;
});

edit('frontend/src/Components/Footer.jsx', source => {
  source = "import useRemote from '../Utils/useRemote';\nimport { useState } from 'react';\nimport api from '../Utils/api';\n" + source;
  source = source.replace(/const contactInfo = \[[\s\S]*?\n\]/, '');
  source = source.replace('export default function Footer() {', `export default function Footer() {
  const settings = useRemote('/settings', null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const contactInfo = settings.data ? [
    { icon: 'fa-solid fa-location-dot', text: settings.data.address },
    { icon: 'fa-solid fa-phone', text: settings.data.phone },
    { icon: 'fa-solid fa-envelope', text: settings.data.contact_email },
    { icon: 'fa-regular fa-clock', text: settings.data.hours },
  ] : [];
  async function subscribe(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { const response = await api.post('/subscribers', { email }); setMessage(response.data.message); setEmail(''); }
    catch(error) { setMessage(error.response?.data?.error || 'Unable to subscribe. Please try again.'); }
    finally { setBusy(false); }
  }`);
  source = source.replace('<footer ', '<footer ');
  source = source.replace('{/* Main footer */}', `<form onSubmit={subscribe} className="mb-10 flex flex-wrap items-center gap-3 border-b border-white/10 pb-8"><label htmlFor="newsletter-email" className="font-bold text-white">Newsletter</label><input id="newsletter-email" required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Your email address" className="rounded-lg bg-white px-4 py-2 text-slate-900" /><button disabled={busy} className="rounded-lg bg-purple-600 px-4 py-2 text-white">{busy ? 'Subscribing…' : 'Subscribe'}</button><p role="status">{message}</p></form>
        {/* Main footer */}`);
  return source;
});
console.log('Public pages now use API data without sample catalog fallbacks.');
