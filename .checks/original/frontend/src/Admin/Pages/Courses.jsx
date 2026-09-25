import { useEffect, useState } from "react";
import {
  BookOpen, Plus, Trash2, X, Search,
  Clock, Award, Users, CheckCircle2,
} from "lucide-react";
import api from "../../Utils/api";
import { useAdminTheme } from "../ThemeContext";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const { isDark } = useAdminTheme();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "Development",
    price: "150",
    level: "Beginner → Advanced",
    duration: "3 Months",
    description: "",
  });

  const fetchCourses = () => {
    setLoading(true);
    api.get("/courses")
      .then((r) => setCourses(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleTitleChange = (val) => {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormData((prev) => ({ ...prev, title: val, slug }));
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await api.post("/admin/courses", {
        ...formData,
        price: parseFloat(formData.price) || 0,
      });
      setShowAddModal(false);
      setFormData({
        title: "",
        slug: "",
        category: "Development",
        price: "150",
        level: "Beginner → Advanced",
        duration: "3 Months",
        description: "",
      });
      fetchCourses();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to add course.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course program?")) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete course: " + (err.response?.data?.error || err.message));
    }
  };

  const filtered = courses.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Courses & Training Programs
          </h1>
          <p className="text-xs text-slate-500">{courses.length} educational courses available</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-500 shadow-sm transition-colors"
        >
          <Plus size={14} /> Add Course
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
            placeholder="Search courses by title or subject..."
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
            <div
              key={i}
              className={`rounded-xl border p-4 animate-pulse ${
                isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white"
              }`}
            >
              <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-white/5 mb-2" />
              <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-white/5" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-10 text-center text-xs text-slate-400">
            No courses found matching your query.
          </div>
        ) : (
          filtered.map((c) => (
            <div
              key={c.id}
              className={`flex flex-col justify-between rounded-xl border p-4 transition-all duration-150 ${
                isDark
                  ? "border-white/5 bg-[#0d1530] text-white hover:border-purple-500/30"
                  : "border-slate-200 bg-white text-slate-900 shadow-sm hover:border-purple-300"
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-600">
                    <BookOpen size={16} />
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <h3 className="font-extrabold text-sm">{c.title}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{c.description || "Comprehensive hands-on training module."}</p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                    {c.category || "General"}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                    <Clock size={11} /> {c.duration || "3 Months"}
                  </span>
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-2 text-xs">
                <span className="font-semibold text-slate-400 text-[11px]">{c.level || "All Levels"}</span>
                <span className="font-extrabold text-emerald-600 text-xs">
                  {c.price > 0 ? `$${Number(c.price).toFixed(0)}` : "Free"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border p-5 shadow-2xl ${
              isDark ? "border-white/10 bg-[#0d1530] text-white" : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <h2 className="text-base font-extrabold">Create New Course</h2>
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

            <form onSubmit={handleAddCourse} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500">Course Title *</label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Full-Stack Web Development"
                  className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                    isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-500">Slug *</label>
                  <input
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="web-development"
                    className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                      isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                    }`}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500">Category</label>
                  <input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Development"
                    className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                      isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-500">Price ($ USD)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="150"
                    className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                      isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                    }`}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500">Duration</label>
                  <input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="3 Months"
                    className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                      isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                    }`}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500">Level</label>
                  <input
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    placeholder="Beginner"
                    className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                      isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Course summary..."
                  className={`mt-1 w-full resize-none rounded-lg border py-1.5 px-3 outline-none ${
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
                  {saving ? "Saving..." : "Save Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
