import { Link, Navigate } from 'react-router-dom';
import useRemote from '../Utils/useRemote';
import api from '../Utils/api';
import { clearSession } from '../Utils/session';
import DataState from '../Components/DataState';
import logo from '../assets/CODERWANDA.png';
export default function LearningShell({ children }) {
  const auth = useRemote('/auth/me', null);
  if (!localStorage.getItem('coderwanda_token')) return <Navigate to="/login?redirect=/learn" replace />;
  if (auth.loading || auth.error) return <DataState {...auth} />;
  return <div className="min-h-screen bg-[#f5f6fb] text-slate-900">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-5 backdrop-blur"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 py-4"><Link to="/learn" className="text-xl font-black tracking-tight"><img src={logo} alt="CodeRwanda" className="h-12 w-36 object-contain" /></Link><nav className="flex flex-wrap items-center gap-4 text-sm font-semibold"><Link to="/learn">My learning</Link><Link to="/learn/playground">Coding playground</Link>{auth.data?.is_trainer || auth.data?.admin_access ? <Link to="/teach">Trainer studio</Link> : null}<Link to="/training-room">Explore courses</Link>{auth.data?.admin_access ? <Link to="/admin/learning">Admin</Link> : null}<button onClick={async () => { try { await api.post('/auth/logout'); } catch { /* Clear the local session when offline too. */ } clearSession(); window.location.assign('/login?redirect=/learn'); }}>Sign out</button></nav></div></header>
    <main className="mx-auto max-w-7xl px-5 py-8 sm:py-10">{children}</main>
    <footer className="mx-auto max-w-7xl px-5 py-8 text-sm text-slate-500">Build skills. Practice with purpose. Celebrate your progress.</footer>
  </div>;
}
