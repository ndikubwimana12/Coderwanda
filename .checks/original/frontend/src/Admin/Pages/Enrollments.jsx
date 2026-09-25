import { useEffect, useState } from "react";
import {
  ClipboardList, Search, Eye, Download, Printer,
  GraduationCap, CheckCircle2, Clock, XCircle, X,
  User, Mail, Phone, Calendar, BookOpen,
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
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  rejected: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
};

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const { isDark } = useAdminTheme();

  const fetchEnrollments = () => {
    setLoading(true);
    api.get("/admin/enrollments?limit=100")
      .then((r) => setEnrollments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleStatusChange = async (enrollmentId, newStatus) => {
    setUpdatingId(enrollmentId);
    try {
      await api.patch(`/admin/enrollments/${enrollmentId}/status`, { status: newStatus });
      setEnrollments((prev) =>
        prev.map((e) => (e.id === enrollmentId ? { ...e, status: newStatus } : e))
      );
      if (selectedStudent && selectedStudent.id === enrollmentId) {
        setSelectedStudent((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.error || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    window.open("http://127.0.0.1:5000/api/admin/reports/export/enrollments", "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  const filtered = enrollments.filter((e) => {
    const name = e.full_name || e.user_name || "";
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.course_title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || (e.status || "pending") === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Course Enrollments
          </h1>
          <p className="text-xs text-slate-500">
            {enrollments.length} total applicant submissions across all training programs
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

      {/* Filters */}
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
              placeholder="Search by student name, email, or course..."
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
              {["all", "pending", "approved", "rejected"].map((st) => (
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
                <th className="px-4 py-3">Applicant / Student</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Mode & Start</th>
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
                    No enrollments found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => {
                  const studentName = e.full_name || e.user_name || "Applicant";
                  const currentStatus = e.status || "pending";
                  return (
                    <tr
                      key={e.id}
                      className={`transition-colors ${isDark ? "hover:bg-white/2" : "hover:bg-slate-50"}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-[10px] font-bold text-white shadow-sm">
                            {studentName[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{studentName}</p>
                            <p className="text-[10px] text-slate-400">{e.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700">
                          {e.course_title || e.course_name || "Course Program"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{e.mode || "Physical"}</p>
                        <p className="text-[10px] text-slate-400">{e.start_period || "Immediate"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={currentStatus}
                          disabled={updatingId === e.id}
                          onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                          className={`rounded-lg border px-2 py-0.5 text-[11px] font-bold capitalize outline-none cursor-pointer ${
                            statusColor[currentStatus] || statusColor.pending
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{timeAgo(e.enrolled_at || e.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedStudent(e)}
                          className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 font-bold text-purple-700 hover:bg-purple-600 hover:text-white transition-colors"
                        >
                          <Eye size={12} /> View Details
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

      {/* Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border p-5 shadow-2xl ${
              isDark ? "border-white/10 bg-[#0d1530] text-white" : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600">Application File</span>
                <h2 className="text-base font-extrabold">{selectedStudent.full_name || selectedStudent.user_name}</h2>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className={`rounded-xl border p-3 ${isDark ? "border-white/5 bg-white/2" : "border-slate-100 bg-slate-50"}`}>
                <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-2">Applicant Profile</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px]">Name:</span>
                    <p className="font-bold">{selectedStudent.full_name || selectedStudent.user_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Email:</span>
                    <p className="font-bold">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Phone:</span>
                    <p className="font-bold">{selectedStudent.phone || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Education:</span>
                    <p className="font-bold">{selectedStudent.education || "Not specified"}</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl border p-3 ${isDark ? "border-white/5 bg-white/2" : "border-slate-100 bg-slate-50"}`}>
                <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-2">Program Selection</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px]">Course:</span>
                    <p className="font-bold text-purple-600">{selectedStudent.course_title || selectedStudent.course_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Experience:</span>
                    <p className="font-bold">{selectedStudent.experience || "Beginner"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Mode:</span>
                    <p className="font-bold">{selectedStudent.mode || "Physical Training"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Start Period:</span>
                    <p className="font-bold">{selectedStudent.start_period || "Immediate"}</p>
                  </div>
                </div>
              </div>

              {selectedStudent.message && (
                <div className={`rounded-xl border p-3 ${isDark ? "border-white/5 bg-white/2" : "border-slate-100 bg-slate-50"}`}>
                  <span className="text-slate-400 text-[10px]">Applicant Note:</span>
                  <p className="text-slate-700 dark:text-slate-200 mt-1 italic leading-relaxed">"{selectedStudent.message}"</p>
                </div>
              )}

              {/* Status Selector */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 font-semibold">Change Status:</span>
                <select
                  value={selectedStudent.status || "pending"}
                  onChange={(e) => handleStatusChange(selectedStudent.id, e.target.value)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-bold capitalize outline-none ${
                    statusColor[selectedStudent.status || "pending"]
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
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
