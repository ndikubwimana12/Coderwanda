import { useState } from 'react';
import useRemote from '../../Utils/useRemote';
import api from '../../Utils/api';
import DataState from '../../Components/DataState';
export default function AuditLog() {
  const remote = useRemote('/admin/activity-logs');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  async function remove() {
    setBusy(true);
    try { await api.delete(`/admin/activity-logs/${selected}`); setSelected(null); remote.reload(); }
    catch { setError('Unable to remove log.'); }
    finally { setBusy(false); }
  }
  const rows = remote.data.filter(row => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Activity logs</h1><p>Latest 1,000 recorded changes to the platform.</p><input aria-label="Search activity logs" value={search} onChange={event => setSearch(event.target.value)} className="w-full rounded border bg-white p-3 text-slate-900" placeholder="Search actor, action or module…" /><DataState {...remote} />{error && <p role="alert">{error}</p>}{selected && <div role="alertdialog" aria-label="Delete activity log">Delete log #{selected}? <button disabled={busy} onClick={remove}>Confirm delete</button> <button onClick={() => setSelected(null)}>Cancel</button></div>}<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{['Time', 'Actor', 'Action', 'Module', 'Record', ''].map((label, index) => <th className="p-3" key={index}>{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-b border-slate-300/20"><td className="p-3">{new Date(row.created_at).toLocaleString()}</td><td className="p-3">{row.actor}</td><td className="p-3">{row.action}</td><td className="p-3">{row.resource}</td><td className="p-3">{row.record_id || '—'}</td><td className="p-3"><button onClick={() => setSelected(row.id)}>Delete</button></td></tr>)}</tbody></table>{!remote.loading && !rows.length && <p className="p-6">No activity found.</p>}</div></div>;
}
