import { useEffect, useState } from "react";
import {
  Mail, Search, Trash2, Download, CheckCircle2,
  Calendar, Users,
} from "lucide-react";
import api from "../../Utils/api";
import { useAdminTheme } from "../ThemeContext";

function timeAgo(d) {
  if (!d) return "—";
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { isDark } = useAdminTheme();

  const fetchSubscribers = () => {
    setLoading(true);
    api.get("/admin/subscribers")
      .then((r) => setSubscribers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this newsletter subscriber?")) return;
    try {
      await api.delete(`/admin/subscribers/${id}`);
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Failed to delete subscriber: " + (err.response?.data?.error || err.message));
    }
  };

  const exportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,ID,Email,Subscribed At\n" +
      subscribers.map((s) => `${s.id},"${s.email}","${s.created_at}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = subscribers.filter((s) =>
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Newsletter Subscribers
          </h1>
          <p className="text-xs text-slate-500">{subscribers.length} total subscribers receiving email updates</p>
        </div>

        <button
          onClick={exportCSV}
          disabled={subscribers.length === 0}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${
            isDark
              ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
          }`}
        >
          <Download size={13} /> Export Subscribers CSV
        </button>
      </div>

      {/* Search */}
      <div
        className={`rounded-xl border p-3 transition-colors ${
          isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
        }`}
      >
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscribers by email address..."
            className={`w-full rounded-lg border py-1.5 pl-8 pr-3 text-xs outline-none transition ${
              isDark
                ? "border-white/10 bg-white/5 text-slate-200 placeholder-slate-500 focus:border-purple-500"
                : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white"
            }`}
          />
        </div>
      </div>

      {/* Table */}
      <div
        className={`overflow-hidden rounded-xl border transition-colors ${
          isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[550px] text-xs">
            <thead>
              <tr
                className={`border-b text-left font-bold uppercase tracking-wider ${
                  isDark
                    ? "border-white/5 bg-white/2 text-slate-400"
                    : "border-slate-100 bg-slate-50/70 text-slate-500"
                }`}
              >
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Subscribed Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-white/5" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-xs text-slate-400">
                    No newsletter subscribers found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    className={`transition-colors ${isDark ? "hover:bg-white/2" : "hover:bg-slate-50"}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-600">
                          <Mail size={13} />
                        </div>
                        <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{s.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 size={10} /> Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{timeAgo(s.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Remove Subscriber"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
