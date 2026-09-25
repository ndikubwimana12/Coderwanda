import { Link } from 'react-router-dom';
import Manage from './Manage';
export default function Page() { return <div className="space-y-5"><Link to="/admin/learning" className="inline-block rounded-xl bg-purple-700 px-5 py-3 font-bold text-white">Build course modules, video lessons & assessments →</Link><Manage resource="courses" /></div>; }
