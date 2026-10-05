export default function Pagination({ page, pageSize = 15, totalItems, onPageChange }) {
  if (totalItems <= pageSize) return null;
  const pages = Math.max(1, Math.ceil(totalItems / pageSize));
  const current = Math.min(page, pages);
  const first = (current - 1) * pageSize + 1;
  const last = Math.min(current * pageSize, totalItems);
  return <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
    <p className="text-slate-500">Showing {first}–{last} of {totalItems}</p>
    <div className="flex items-center gap-2">
      <button type="button" disabled={current <= 1} onClick={() => onPageChange(current - 1)} className="rounded-lg border px-3 py-2 font-semibold disabled:opacity-40">Previous</button>
      <span aria-live="polite">Page {current} of {pages}</span>
      <button type="button" disabled={current >= pages} onClick={() => onPageChange(current + 1)} className="rounded-lg border px-3 py-2 font-semibold disabled:opacity-40">Next</button>
    </div>
  </nav>;
}
