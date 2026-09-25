import { useEffect, useState } from "react";
import { MessageSquare, Plus, Trash2, X, Star } from "lucide-react";
import api from "../../Utils/api";
import { useAdminTheme } from "../ThemeContext";

export default function TestimonialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { isDark } = useAdminTheme();

  const [formData, setFormData] = useState({
    name: "",
    role: "Full-Stack Graduate",
    company: "Kigali",
    content: "",
    rating: "5",
  });

  const fetchTestimonials = () => {
    setLoading(true);
    api.get("/testimonials")
      .then((r) => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/testimonials", formData);
      setShowAddModal(false);
      setFormData({ name: "", role: "Full-Stack Graduate", company: "Kigali", content: "", rating: "5" });
      fetchTestimonials();
    } catch (err) {
      alert("Failed to add testimonial.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      await api.delete(`/admin/testimonials/${id}`);
      setItems((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert("Failed to delete testimonial.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Client & Student Testimonials</h1>
          <p className="text-xs text-slate-500">{items.length} reviews and testimonials</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-500 shadow-sm"
        >
          <Plus size={14} /> Add Testimonial
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`rounded-xl border p-4 animate-pulse ${isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white"}`} />
          ))
        ) : items.length === 0 ? (
          <div className="col-span-full py-10 text-center text-xs text-slate-400">
            No testimonials added yet. Click "Add Testimonial" to create one.
          </div>
        ) : (
          items.map((t) => (
            <div
              key={t.id}
              className={`flex flex-col justify-between rounded-xl border p-4 ${
                isDark ? "border-white/5 bg-[#0d1530] text-white" : "border-slate-200 bg-white text-slate-900 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={i} size={13} fill="currentColor" />
                    ))}
                  </div>
                  <button onClick={() => handleDelete(t.id)} className="p-1 text-slate-400 hover:text-rose-600">
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-3">"{t.content}"</p>
              </div>
              <div className="border-t border-slate-100 dark:border-white/5 pt-2 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-[10px]">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-xs font-bold">{t.name}</p>
                  <p className="text-[10px] text-slate-400">{t.role} · {t.company}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl ${isDark ? "border-white/10 bg-[#0d1530] text-white" : "border-slate-200 bg-white text-slate-900"}`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-extrabold">Add Testimonial</h2>
              <button onClick={() => setShowAddModal(false)}><X size={16} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleAdd} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500">Person Name *</label>
                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50"}`} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-500">Role / Profession</label>
                  <input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50"}`} />
                </div>
                <div>
                  <label className="font-bold text-slate-500">Organization / City</label>
                  <input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50"}`} />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-500">Testimonial Content *</label>
                <textarea rows="3" required value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className={`mt-1 w-full resize-none rounded-lg border py-1.5 px-3 outline-none ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50"}`} />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-600">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-purple-600 px-4 py-1.5 font-bold text-white disabled:opacity-50">{saving ? "Saving..." : "Save Testimonial"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
