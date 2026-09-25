import { useEffect, useState } from "react";
import { Newspaper, Plus, Trash2, X, Search, Calendar, User } from "lucide-react";
import api from "../../Utils/api";
import { useAdminTheme } from "../ThemeContext";

export default function BlogPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { isDark } = useAdminTheme();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "CodeRwanda Editorial",
    category: "Technology",
  });

  const fetchPosts = () => {
    setLoading(true);
    api.get("/blog")
      .then((r) => setPosts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAddPost = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/blog", formData);
      setShowAddModal(false);
      setFormData({ title: "", slug: "", excerpt: "", content: "", author: "CodeRwanda Editorial", category: "Technology" });
      fetchPosts();
    } catch (err) {
      alert("Failed to create blog post.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await api.delete(`/admin/blog/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete post.");
    }
  };

  const filtered = posts.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Blog & News Articles</h1>
          <p className="text-xs text-slate-500">{posts.length} published blog posts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-500 shadow-sm"
        >
          <Plus size={14} /> Write Post
        </button>
      </div>

      <div className={`rounded-xl border p-3 ${isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"}`}>
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by title..."
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
            No blog articles published yet. Click "Write Post" to add content.
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
                  <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                    {p.category}
                  </span>
                  <button onClick={() => handleDelete(p.id)} className="p-1 text-slate-400 hover:text-rose-600">
                    <Trash2 size={13} />
                  </button>
                </div>
                <h3 className="font-extrabold text-sm">{p.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.excerpt || p.content}</p>
              </div>
              <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-2 text-[10px] text-slate-400">
                <span className="font-bold">{p.author}</span>
                <span>{new Date(p.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl ${isDark ? "border-white/10 bg-[#0d1530] text-white" : "border-slate-200 bg-white text-slate-900"}`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-extrabold">Write New Post</h2>
              <button onClick={() => setShowAddModal(false)}><X size={16} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddPost} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500">Post Title *</label>
                <input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50"}`} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-500">Category</label>
                  <input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50"}`} />
                </div>
                <div>
                  <label className="font-bold text-slate-500">Author</label>
                  <input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50"}`} />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-500">Article Content *</label>
                <textarea rows="4" required value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className={`mt-1 w-full resize-none rounded-lg border py-1.5 px-3 outline-none ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50"}`} />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-600">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-purple-600 px-4 py-1.5 font-bold text-white disabled:opacity-50">{saving ? "Publishing..." : "Publish Post"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
