import { Link } from 'react-router-dom';
import Manage from './Manage';
export default function Page() { return <div className="space-y-5"><Link to="/admin/students" className="inline-block rounded-xl bg-purple-700 px-5 py-3 font-bold text-white">Approve applicants, activate accounts & view learning progress →</Link><Manage resource="enrollments" /></div>; }
