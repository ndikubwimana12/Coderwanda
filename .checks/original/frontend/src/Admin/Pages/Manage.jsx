import { useState } from 'react';
import api from '../../Utils/api';
import useRemote from '../../Utils/useRemote';
import { contentChanged } from '../../Utils/session';
import DataState from '../../Components/DataState';
import { useAdminTheme } from '../ThemeContext';

export async function downloadReport(resource) {
  const { data } = await api.get(`/admin/reports/export/${resource}`, { responseType: 'blob' });
  const url = URL.createObjectURL(data);
  const link = document.createElement('a'); link.href = url; link.download = `coderwanda-${resource}.csv`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Editor({ resource, config, record, onClose, onSaved }) {
  const [form, setForm] = useState(() => Object.fromEntries(Object.entries(config.fields).map(([key, field]) => [key, field.type === 'password' ? '' : field.type === 'list' ? (record?.[key] || []).join('\n') : record?.[key] ?? field.default ?? (field.type === 'items' ? [] : '')])));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { data: courses } = useRemote('/admin/courses');
  const { data: careers } = useRemote('/admin/careers');
  const { data: roles } = useRemote('/admin/roles');
  const { data: products } = useRemote('/admin/products');
  const choices = { courses, careers };
  const set = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
  const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900';
  async function upload(key, file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Images must be no larger than 5 MB.'); return; }
    setUploading(true); setError('');
    try {
      const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file); });
      const response = await api.post('/admin/uploads', { data }); set(key, response.data.url);
    } catch (error) { setError(error.response?.data?.error || 'Image upload failed.'); }
    finally { setUploading(false); }
  }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (record) await api.put(`/admin/${resource}/${record.id}`, form);
      else await api.post(`/admin/${resource}`, form);
      contentChanged(); onSaved();
    } catch (error) { setError(error.response?.data?.error || 'Unable to save changes.'); }
    finally { setBusy(false); }
  }
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm">
    <div className="mb-5 flex justify-between"><h2 className="text-xl font-bold">{record ? `Edit record #${record.id}` : `Add ${config.title.toLowerCase()}`}</h2><button onClick={onClose} disabled={busy || uploading}>Cancel</button></div>
    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
      {Object.entries(config.fields).map(([key, field]) => <div key={key} className={['textarea', 'list', 'items'].includes(field.type) ? 'md:col-span-2' : ''}>
        <label htmlFor={`field-${key}`} className="mb-1 block text-sm font-semibold">{field.label}{field.required ? ' *' : ''}</label>
        {field.type === 'items' ? <div className="space-y-2">
          {form.items.map((item, index) => <div key={index} className="flex gap-2">
            <select aria-label={`Product ${index + 1}`} required className={inputClass} value={item.id || ''} onChange={event => set('items', form.items.map((line, i) => i === index ? { ...line, id: Number(event.target.value) } : line))}>
              <option value="">Select product</option>{products.map(product => <option key={product.id} value={product.id}>{product.name} — RWF {product.price}</option>)}
            </select>
            <input aria-label={`Quantity ${index + 1}`} type="number" min="1" max="1000" required className="w-24 rounded border p-2" value={item.quantity} onChange={event => set('items', form.items.map((line, i) => i === index ? { ...line, quantity: Number(event.target.value) } : line))} />
            <button type="button" onClick={() => set('items', form.items.filter((_, i) => i !== index))}>Remove</button>
          </div>)}
          <button type="button" className="rounded border px-3 py-2" onClick={() => set('items', [...form.items, { id: '', quantity: 1 }])}>Add product</button>
          <p className="text-sm text-slate-500">Totals are calculated from current catalog prices when saved.</p>
        </div> : ['textarea', 'list'].includes(field.type) ? <textarea id={`field-${key}`} className={inputClass} rows={4} required={field.required} value={form[key]} onChange={event => set(key, event.target.value)} />
          : ['select', 'relation', 'role'].includes(field.type) ? <select id={`field-${key}`} className={inputClass} required={field.required} value={form[key] ?? ''} onChange={event => set(key, event.target.value)}>
            <option value="">Select…</option>{field.type === 'role' ? roles.map(role => <option key={role.id} value={role.name}>{role.name}</option>) : field.type === 'relation' ? (choices[field.resource] || []).map(row => <option key={row.id} value={row.id}>{row.title}</option>) : field.options.map(value => <option key={value} value={value}>{value === '1' ? 'Yes' : value === '0' ? 'No' : value}</option>)}
          </select> : <input id={`field-${key}`} className={inputClass} type={field.type === 'image' ? 'text' : field.type} required={field.required || (key === 'password' && !record)} min={field.min} max={field.max} minLength={field.type === 'password' ? 8 : undefined} value={form[key] ?? ''} onChange={event => set(key, event.target.value)} />}
        {field.type === 'image' && <div className="mt-2 space-y-2"><input aria-label={`Upload ${field.label}`} type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={event => upload(key, event.target.files[0])} />{form[key] && <img src={form[key]} alt="Preview" className="h-24 max-w-full rounded object-contain" />}<p className="text-xs text-slate-500">Upload an image up to 5 MB, or enter an image URL.</p></div>}
      </div>)}
      {error && <p role="alert" className="text-red-700 md:col-span-2">{error}</p>}
      <div className="md:col-span-2"><button disabled={busy || uploading} className="rounded-lg bg-purple-700 px-5 py-2 font-bold text-white disabled:opacity-50">{uploading ? 'Uploading…' : busy ? 'Saving…' : 'Save changes'}</button></div>
    </form>
  </section>;
}

export default function Manage({ resource }) {
  const remote = useRemote(`/admin/${resource}`);
  const meta = useRemote('/admin/meta');
  const [editor, setEditor] = useState(undefined);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const { isDark } = useAdminTheme();
  const config = meta.data?.[resource];
  if (!config) return <DataState {...meta} />;
  const filtered = remote.data.filter(row => Object.values(row).some(value => String(value).toLowerCase().includes(search.toLowerCase())));
  const pages = Math.max(1, Math.ceil(filtered.length / 15));
  const currentPage = Math.min(page, pages);
  const columns = Object.entries(config.fields).filter(([, field]) => !['password', 'textarea', 'list', 'image', 'items'].includes(field.type)).slice(0, 5);
  async function remove() {
    setBusy(true); setError('');
    try { await api.delete(`/admin/${resource}/${deleting.id}`); setDeleting(null); contentChanged(); remote.reload(); }
    catch (error) { setError(error.response?.data?.error || 'Unable to delete record.'); }
    finally { setBusy(false); }
  }
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-extrabold">{config.title}</h1><p className="text-sm text-slate-500">{remote.data.length} records · Create, view, edit and delete</p></div><div className="flex gap-2"><button onClick={() => downloadReport(resource).catch(() => setError('Export failed. Please try again.'))} className="rounded-lg border px-3 py-2">Export CSV</button><button className="rounded-lg bg-purple-700 px-4 py-2 font-bold text-white" onClick={() => setEditor(null)}>Add new</button></div></div>
    {editor !== undefined && <Editor key={editor?.id || 'new'} resource={resource} config={config} record={editor} onClose={() => setEditor(undefined)} onSaved={() => { setEditor(undefined); remote.reload(); }} />}
    {error && <p role="alert" className="rounded border border-red-300 p-3 text-red-600">{error}</p>}
    {deleting && <div role="alertdialog" aria-label="Confirm deletion" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900"><p>Delete record #{deleting.id}? This permanently removes the record.</p><div className="mt-3 flex gap-3"><button disabled={busy} onClick={remove} className="rounded bg-red-700 px-4 py-2 text-white">{busy ? 'Deleting…' : 'Delete record'}</button><button disabled={busy} onClick={() => setDeleting(null)}>Cancel</button></div></div>}
    <input aria-label={`Search ${config.title}`} value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder={`Search ${config.title.toLowerCase()}…`} className={`w-full rounded-xl border p-3 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`} />
    <DataState {...remote} />
    {!remote.loading && !remote.error && <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">ID</th>{columns.map(([key, field]) => <th key={key} className="p-3">{field.label}</th>)}<th className="p-3">Actions</th></tr></thead><tbody>{filtered.slice((currentPage - 1) * 15, currentPage * 15).map(row => <tr key={row.id} className="border-b border-slate-200/20"><td className="p-3">{row.id}</td>{columns.map(([key]) => <td key={key} className="max-w-56 truncate p-3">{String(row[key] ?? '—')}</td>)}<td className="whitespace-nowrap p-3"><button className="mr-4 font-bold text-purple-500" onClick={() => setEditor(row)}>View / edit</button><button className="text-red-500" onClick={() => { setError(''); setDeleting(row); }}>Delete</button></td></tr>)}</tbody></table>{!filtered.length && <p className="p-8 text-center text-slate-500">No records found.</p>}</div>}
    <div className="flex items-center justify-end gap-4"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage} of {pages}</span><button disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Next</button></div>
  </div>;
}
