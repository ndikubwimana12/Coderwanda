export default function DataState({ loading, error, empty, reload, label = 'content' }) {
  if (loading) return <p role="status" className="p-6 text-center text-slate-500">Loading {label}…</p>;
  if (error) return <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error} <button type="button" onClick={reload} className="ml-3 underline">Try again</button></div>;
  if (empty) return <p className="p-6 text-center text-slate-500">No {label} published yet. Please check back soon.</p>;
  return null;
}
