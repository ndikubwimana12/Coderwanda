import { useEffect, useState } from "react";
import { Briefcase, Plus, Trash2, X, Search, MapPin, Clock, CheckCircle2 } from "lucide-react";
import api from "../../Utils/api";
import { useAdminTheme } from "../ThemeContext";

export default function AdminCareersPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const { isDark } = useAdminTheme();

  const [formData, setFormData] = useState({
    title: "",
    type: "Full-time",
    location: "Musanze, Rwanda",
    level: "Junior / Mid-level",
    description: "",
    skills: "",
    responsibilities: "",
  });

  const fetchJobs = () => {
    setLoading(true);
    api.get("/admin/careers")
      .then((r) => setJobs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAddJob = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await api.post("/admin/careers", formData);
      setShowAddModal(false);
      setFormData({
        title: "",
        type: "Full-time",
        location: "Musanze, Rwanda",
        level: "Junior / Mid-level",
        description: "",
        skills: "",
        responsibilities: "",
      });
      fetchJobs();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to post job.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job opening?")) return;
    try {
      await api.delete(`/admin/careers/${id}`);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      alert("Failed to delete job: " + (err.response?.data?.error || err.message));
    }
  };

  const filtered = jobs.filter((j) =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Job Listings & Openings
          </h1>
          <p className="text-xs text-slate-500">{jobs.length} open career vacancies posted</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-500 shadow-sm transition-colors"
        >
          <Plus size={14} /> Post New Job
        </button>
      </div>

      {/* Search Bar */}
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
            placeholder="Search job vacancies by title..."
            className={`w-full rounded-lg border py-1.5 pl-8 pr-3 text-xs outline-none transition ${
              isDark
                ? "border-white/10 bg-white/5 text-slate-200 placeholder-slate-500 focus:border-purple-500"
                : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white"
            }`}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`rounded-xl border p-4 animate-pulse ${isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white"}`} />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-10 text-center text-xs text-slate-400">
            No job openings posted yet. Click "Post New Job" to add one.
          </div>
        ) : (
          filtered.map((j) => (
            <div
              key={j.id}
              className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                isDark ? "border-white/5 bg-[#0d1530] text-white hover:border-purple-500/30" : "border-slate-200 bg-white text-slate-900 shadow-sm hover:border-purple-300"
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-600">
                    <Briefcase size={16} />
                  </div>
                  <button
                    onClick={() => handleDelete(j.id)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Delete Job"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <h3 className="font-extrabold text-sm">{j.title}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{j.description}</p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                    {j.type || "Full-time"}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                    <MapPin size={11} /> {j.location || "Musanze, Rwanda"}
                  </span>
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-2 text-xs">
                <span className="font-semibold text-slate-400 text-[11px]">{j.level}</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                  <CheckCircle2 size={11} /> Active
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border p-5 shadow-2xl ${
              isDark ? "border-white/10 bg-[#0d1530] text-white" : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <h2 className="text-base font-extrabold">Post Job Opening</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddJob} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500">Job Title *</label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                    isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-500">Employment Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                      isDark ? "border-white/10 bg-[#0a0f1e] text-white" : "border-slate-200 bg-white text-slate-900"
                    }`}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-500">Location</label>
                  <input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Musanze, Rwanda"
                    className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                      isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500">Experience Level</label>
                <input
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="Junior / Mid-level"
                  className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                    isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                  }`}
                />
              </div>

              <div>
                <label className="font-bold text-slate-500">Job Description *</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role and key goals..."
                  className={`mt-1 w-full resize-none rounded-lg border py-1.5 px-3 outline-none ${
                    isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                  }`}
                />
              </div>

              <div>
                <label className="font-bold text-slate-500">Required Skills (comma separated)</label>
                <input
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="React, TypeScript, Tailwind, REST APIs"
                  className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                    isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-500 disabled:opacity-50"
                >
                  {saving ? "Posting..." : "Post Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
