import { useEffect, useState } from "react";
import {
  Phone, Search, Eye, Download, Printer,
  Mail, Trash2, CheckCircle2, Clock, X, MessageSquare,
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
  unread: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  read: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  replied: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const { isDark } = useAdminTheme();

  const fetchContacts = () => {
    setLoading(true);
    api.get("/admin/contacts?limit=100")
      .then((r) => setContacts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleStatusChange = async (msgId, newStatus) => {
    setUpdatingId(msgId);
    try {
      await api.patch(`/admin/contacts/${msgId}/status`, { status: newStatus });
      setContacts((prev) =>
        prev.map((c) => (c.id === msgId ? { ...c, status: newStatus } : c))
      );
      if (selectedMessage && selectedMessage.id === msgId) {
        setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.error || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (msgId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await api.delete(`/admin/contacts/${msgId}`);
      setContacts((prev) => prev.filter((c) => c.id !== msgId));
      if (selectedMessage && selectedMessage.id === msgId) {
        setSelectedMessage(null);
      }
    } catch (err) {
      alert("Failed to delete message: " + (err.response?.data?.error || err.message));
    }
  };

  const openMessage = (c) => {
    setSelectedMessage(c);
    if (c.status === "unread") {
      handleStatusChange(c.id, "read");
    }
  };

  const exportCSV = () => {
    window.open("http://127.0.0.1:5000/api/admin/reports/export/contacts", "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  const filtered = contacts.filter((c) => {
    const matchSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.subject?.toLowerCase().includes(search.toLowerCase()) ||
      c.message?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || (c.status || "unread") === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Contact Inquiries
          </h1>
          <p className="text-xs text-slate-500">
            {contacts.length} total messages received from clients and visitors
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

      {/* Search & Filters */}
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
              placeholder="Search by sender, email, or message subject..."
              className={`w-full rounded-lg border py-1.5 pl-8 pr-3 text-xs outline-none transition ${
                isDark
                  ? "border-white/10 bg-white/5 text-slate-200 placeholder-slate-500 focus:border-purple-500"
                  : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white"
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Status:</span>
            <div className="flex gap-1">
              {["all", "unread", "read", "replied"].map((st) => (
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
                <th className="px-4 py-3">Sender</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Received</th>
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
                    No contact inquiries found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const currentStatus = c.status || "unread";
                  return (
                    <tr
                      key={c.id}
                      className={`transition-colors ${isDark ? "hover:bg-white/2" : "hover:bg-slate-50"}`}
                    >
                      <td className="px-4 py-3">
                        <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{c.name}</p>
                        <p className="text-[10px] text-slate-400">{c.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{c.subject || "General Inquiry"}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{c.message}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{c.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <select
                          value={currentStatus}
                          disabled={updatingId === c.id}
                          onChange={(ev) => handleStatusChange(c.id, ev.target.value)}
                          className={`rounded-lg border px-2 py-0.5 text-[11px] font-bold capitalize outline-none cursor-pointer ${
                            statusColor[currentStatus] || statusColor.unread
                          }`}
                        >
                          <option value="unread">Unread</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{timeAgo(c.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openMessage(c)}
                            className="rounded-lg border border-purple-200 bg-purple-50 p-1.5 font-bold text-purple-700 hover:bg-purple-600 hover:text-white transition-colors"
                            title="View Message"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 font-bold text-rose-700 hover:bg-rose-600 hover:text-white transition-colors"
                            title="Delete Message"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Reader Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border p-5 shadow-2xl ${
              isDark ? "border-white/10 bg-[#0d1530] text-white" : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600">Inquiry Details</span>
                <h2 className="text-base font-extrabold">{selectedMessage.subject || "Message"}</h2>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className={`rounded-xl border p-3 ${isDark ? "border-white/5 bg-white/2" : "border-slate-100 bg-slate-50"}`}>
                <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-2">Sender Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px]">Name:</span>
                    <p className="font-bold">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Email:</span>
                    <a href={`mailto:${selectedMessage.email}`} className="font-bold text-purple-600 hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Phone:</span>
                    <p className="font-bold">{selectedMessage.phone || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Date:</span>
                    <p className="font-bold">{new Date(selectedMessage.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl border p-3 ${isDark ? "border-white/5 bg-white/2" : "border-slate-100 bg-slate-50"}`}>
                <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-1">Message Content</h3>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 font-semibold">Change Status:</span>
                <select
                  value={selectedMessage.status || "unread"}
                  onChange={(e) => handleStatusChange(selectedMessage.id, e.target.value)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-bold capitalize outline-none ${
                    statusColor[selectedMessage.status || "unread"]
                  }`}
                >
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
