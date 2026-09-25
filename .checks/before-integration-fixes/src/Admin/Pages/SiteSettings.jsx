import { useState } from 'react';
import api from '../../Utils/api';
import useRemote from '../../Utils/useRemote';
import DataState from '../../Components/DataState';
import { contentChanged } from '../../Utils/session';
function Form({ settings }) {
  const [form, setForm] = useState(settings);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function save(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { await api.put('/admin/settings', form); setMessage('Settings saved.'); contentChanged(); }
    catch (error) { setMessage(error.response?.data?.error || 'Unable to save settings.'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} className="max-w-3xl space-y-4 rounded-xl bg-white p-6 text-slate-900">{Object.entries(form).map(([key, value]) => <label key={key} className="block"><span className="mb-1 block font-semibold capitalize">{key.replaceAll('_', ' ')}</span><input required type={key === 'contact_email' ? 'email' : 'text'} maxLength={1000} value={value} onChange={event => setForm({ ...form, [key]: event.target.value })} className="w-full rounded border border-slate-300 p-3" /></label>)}<p role="status">{message}</p><button disabled={busy} className="rounded bg-purple-700 px-5 py-3 font-bold text-white">{busy ? 'Saving…' : 'Save settings'}</button></form>;
}
export default function SiteSettings() {
  const remote = useRemote('/admin/settings', null);
  return <div className="space-y-5"><h1 className="text-2xl font-bold">Site settings</h1><p>Manage homepage headings and public contact information. Manage account details in Users.</p><DataState {...remote} />{remote.data && <Form settings={remote.data} />}</div>;
}
