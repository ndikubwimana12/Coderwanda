import { useEffect, useState } from "react";
import {
  FileText, Search, Eye, Download, Printer,
  Briefcase, CheckCircle2, Clock, XCircle, X,
  User, Mail, Phone, ExternalLink,
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

const statusColor = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  reviewed: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  shortlisted: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  hired: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  rejected: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedApp, setSelectedApp] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const { isDark } = useAdminTheme();

  const fetchApplications = () => {
    setLoading(true);
    api.get("/admin/applications?limit=100")
      .then((r) => setApplications(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await api.patch(`/admin/applications/${appId}/status`, { status: newStatus });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.error || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    window.open("http://127.0.0.1:5000/api/admin/reports/export/applications", "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  const filtered = applications.filter((a) => {
    const matchSearch =
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.job_title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || (a.status || "pending") === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Job Applications
          </h1>
          <p className="text-xs text-slate-500">
            {applications.length} total job candidates reviewed & recorded
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
              isDark
                ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
            }`}
          >
            <Download size={13} /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-purple-500 transition-colors"
          >
            <Printer size={13} /> Print Report
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div
        className={`rounded-xl border p-3 transition-colors ${
          isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
        }`}
      >
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by candidate name, email, or position..."
              className={`w-full rounded-lg border py-1.5 pl-8 pr-3 text-xs outline-none transition ${
                isDark
                  ? "border-white/10 bg-white/5 text-slate-200 placeholder-slate-500 focus:border-purple-500"
                  : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white"
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Status:</span>
            <div className="flex flex-wrap gap-1">
              {["all", "pending", "reviewed", "shortlisted", "hired", "rejected"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold capitalize transition-colors ${
                    filterStatus === st
                      ? "bg-purple-600 text-white"
                      : isDark
                      ? "bg-white/5 text-slate-400 hover:bg-white/10"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className={`overflow-hidden rounded-xl border transition-colors ${
          isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-xs">
            <thead>
              <tr
                className={`border-b text-left font-bold uppercase tracking-wider ${
                  isDark
                    ? "border-white/5 bg-white/2 text-slate-400"
                    : "border-slate-100 bg-slate-50/70 text-slate-500"
                }`}
              >
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Position Applied</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applied</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-white/5" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-slate-400">
                    No job applications found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => {
                  const currentStatus = a.status || "pending";
                  return (
                    <tr
                      key={a.id}
                      className={`transition-colors ${isDark ? "hover:bg-white/2" : "hover:bg-slate-50"}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-[10px] font-bold text-white shadow-sm">
                            {a.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{a.name}</p>
                            <p className="text-[10px] text-slate-400">{a.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                          {a.job_title || "General Application"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{a.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <select
                          value={currentStatus}
                          disabled={updatingId === a.id}
                          onChange={(ev) => handleStatusChange(a.id, ev.target.value)}
                          className={`rounded-lg border px-2 py-0.5 text-[11px] font-bold capitalize outline-none cursor-pointer ${
                            statusColor[currentStatus] || statusColor.pending
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{timeAgo(a.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedApp(a)}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 font-bold text-amber-700 hover:bg-amber-600 hover:text-white transition-colors"
                        >
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border p-5 shadow-2xl ${
              isDark ? "border-white/10 bg-[#0d1530] text-white" : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Candidate File</span>
                <h2 className="text-base font-extrabold">{selectedApp.name}</h2>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className={`rounded-xl border p-3 ${isDark ? "border-white/5 bg-white/2" : "border-slate-100 bg-slate-50"}`}>
                <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-2">Candidate Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px]">Position:</span>
                    <p className="font-bold text-amber-600">{selectedApp.job_title}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Email:</span>
                    <p className="font-bold">{selectedApp.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Phone:</span>
                    <p className="font-bold">{selectedApp.phone || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Portfolio / CV:</span>
                    {selectedApp.portfolio_link ? (
                      <a
                        href={selectedApp.portfolio_link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-purple-600 hover:underline font-bold"
                      >
                        Visit Link <ExternalLink size={11} />
                      </a>
                    ) : (
                      <p className="text-slate-400 text-[10px]">None provided</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedApp.message && (
                <div className={`rounded-xl border p-3 ${isDark ? "border-white/5 bg-white/2" : "border-slate-100 bg-slate-50"}`}>
                  <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-1">Cover Note / Message</h3>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{selectedApp.message}</p>
                </div>
              )}

              {/* Status Selector */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 font-semibold">Change Stage:</span>
                <select
                  value={selectedApp.status || "pending"}
                  onChange={(e) => handleStatusChange(selectedApp.id, e.target.value)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-bold capitalize outline-none ${
                    statusColor[selectedApp.status || "pending"]
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
