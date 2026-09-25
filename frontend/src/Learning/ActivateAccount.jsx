import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../Utils/api';
import { setSession } from '../Utils/session';
export default function ActivateAccount() {
  const [token] = useState(() => window.location.hash.slice(1));
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(event) { event.preventDefault(); setError(''); if (password !== confirm) { setError('Passwords do not match.'); return; } setBusy(true); try { const { data } = await api.post('/auth/activate', { token, password }); setSession(data.user, data.token); window.history.replaceState(null, '', '/activate-account'); navigate('/learn', { replace: true }); } catch (error) { setError(error.response?.data?.error || 'Activation failed. Please try again.'); } finally { setBusy(false); } }
  return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-950 to-slate-950 p-5"><section className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"><p className="text-xs font-bold uppercase tracking-[.25em] text-purple-700">Welcome to CodeRwanda Learn</p><h1 className="mt-4 text-3xl font-black">Your place is ready.</h1><p className="my-4 leading-7 text-slate-500">Your enrollment has been approved. Choose a password to activate your student account and start learning.</p>{!token ? <p role="alert" className="text-red-700">Open the activation link sent by the training team.</p> : <form onSubmit={submit} className="space-y-4"><label className="block font-semibold">Password<input autoComplete="new-password" required minLength={8} type="password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border p-3" /></label><label className="block font-semibold">Confirm password<input autoComplete="new-password" required minLength={8} type="password" value={confirm} onChange={event => setConfirm(event.target.value)} className="mt-2 w-full rounded-xl border p-3" /></label>{error && <p role="alert" className="text-red-700">{error}</p>}<button disabled={busy} className="w-full rounded-xl bg-purple-700 p-3 font-bold text-white">{busy ? 'Activating…' : 'Activate & start learning'}</button></form>}<Link to="/login?redirect=/learn" className="mt-6 inline-block text-sm font-semibold text-purple-700">Already activated? Sign in →</Link></section></main>;
}
