import { useEffect, useState } from "react";
import { FolderKanban, Plus, Trash2, X, Search, ExternalLink, Globe } from "lucide-react";
import api from "../../Utils/api";
import { useAdminTheme } from "../ThemeContext";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { isDark } = useAdminTheme();

  const [formData, setFormData] = useState({
    title: "",
    category: "Web Application",
    description: "",
    client: "CodeRwanda Client",
    image: "",
    url: "",
  });

  const fetchProjects = () => {
    setLoading(true);
    api.get("/projects")
      .then((r) => setProjects(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/projects", formData);
      setShowAddModal(false);
      setFormData({ title: "", category: "Web Application", description: "", client: "CodeRwanda Client", image: "", url: "" });
      fetchProjects();
    } catch (err) {
      alert("Failed to add project.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.delete(`/admin/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete project.");
    }
  };

  const filtered = projects.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Company Projects</h1>
          <p className="text-xs text-slate-500">{projects.length} completed and ongoing projects</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-500 shadow-sm"
        >
          <Plus size={14} /> Add Project
        </button>
      </div>

      <div className={`rounded-xl border p-3 ${isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"}`}>
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className={`w-full rounded-lg border py-1.5 pl-8 pr-3 text-xs outline-none ${
              isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
            }`}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`rounded-xl border p-4 animate-pulse ${isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white"}`} />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-10 text-center text-xs text-slate-400">
            No projects added yet. Click "Add Project" to record your company work.
          </div>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                isDark ? "border-white/5 bg-[#0d1530] text-white" : "border-slate-200 bg-white text-slate-900 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                    {p.category}
                  </span>
                  <button onClick={() => handleDelete(p.id)} className="p-1 text-slate-400 hover:text-rose-600">
                    <Trash2 size={13} />
                  </button>
                </div>
                <h3 className="font-extrabold text-sm">{p.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                <p className="text-[10px] text-slate-400 mt-2 font-semibold">Client: {p.client || "Internal"}</p>
              </div>
              {p.url && (
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5">
                  <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline">
                    Live Demo <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl ${isDark ? "border-white/10 bg-[#0d1530] text-white" : "border-slate-200 bg-white text-slate-900"}`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-extrabold">Add New Project</h2>
              <button onClick={() => setShowAddModal(false)}><X size={16} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddProject} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500">Project Title *</label>
                <input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50"}`} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-500">Category</label>
                  <input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50"}`} />
                </div>
                <div>
                  <label className="font-bold text-slate-500">Client</label>
                  <input value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50"}`} />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-500">Description *</label>
                <textarea rows="2" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`mt-1 w-full resize-none rounded-lg border py-1.5 px-3 outline-none ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50"}`} />
              </div>
              <div>
                <label className="font-bold text-slate-500">Project URL</label>
                <input value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://..." className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50"}`} />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-600">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-purple-600 px-4 py-1.5 font-bold text-white disabled:opacity-50">{saving ? "Saving..." : "Save Project"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
