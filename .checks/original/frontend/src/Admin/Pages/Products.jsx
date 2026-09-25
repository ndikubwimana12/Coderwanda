import { useEffect, useState } from "react";
import {
  Package, Search, Plus, Trash2, Eye, X,
  CheckCircle2, DollarSign, Image as ImageIcon,
} from "lucide-react";
import api from "../../Utils/api";
import { useAdminTheme } from "../ThemeContext";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const { isDark } = useAdminTheme();

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "Laptops",
    price: "",
    old_price: "",
    image: "",
    badge: "New",
  });

  const fetchProducts = () => {
    setLoading(true);
    api.get("/products")
      .then((r) => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await api.post("/admin/products", {
        ...formData,
        price: parseFloat(formData.price),
        old_price: formData.old_price ? parseFloat(formData.old_price) : null,
      });
      setShowAddModal(false);
      setFormData({
        name: "",
        brand: "",
        category: "Laptops",
        price: "",
        old_price: "",
        image: "",
        badge: "New",
      });
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to add product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete product: " + (err.response?.data?.error || err.message));
    }
  };

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Products & Inventory Catalog
          </h1>
          <p className="text-xs text-slate-500">{products.length} products listed in store</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-500 shadow-sm transition-colors"
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* Search & Categories */}
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
              placeholder="Search products by title or brand..."
              className={`w-full rounded-lg border py-1.5 pl-8 pr-3 text-xs outline-none transition ${
                isDark
                  ? "border-white/10 bg-white/5 text-slate-200 placeholder-slate-500 focus:border-purple-500"
                  : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white"
              }`}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold capitalize transition-colors shrink-0 ${
                  selectedCategory === c
                    ? "bg-purple-600 text-white"
                    : isDark
                    ? "bg-white/5 text-slate-400 hover:bg-white/10"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
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
          <table className="w-full min-w-[650px] text-xs">
            <thead>
              <tr
                className={`border-b text-left font-bold uppercase tracking-wider ${
                  isDark
                    ? "border-white/5 bg-white/2 text-slate-400"
                    : "border-slate-100 bg-slate-50/70 text-slate-500"
                }`}
              >
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Badge</th>
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
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className={`transition-colors ${isDark ? "hover:bg-white/2" : "hover:bg-slate-50"}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-8 w-8 shrink-0 rounded-lg object-cover border border-slate-200 dark:border-white/10"
                          />
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-600">
                            <Package size={14} />
                          </div>
                        )}
                        <div>
                          <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{p.name}</p>
                          <p className="text-[10px] text-slate-400">ID: #{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">{p.brand || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                        {p.category || "General"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-extrabold text-emerald-600">${Number(p.price).toFixed(2)}</p>
                      {p.old_price && (
                        <p className="text-[10px] text-slate-400 line-through">${Number(p.old_price).toFixed(2)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.badge && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                          {p.badge}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Delete Product"
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

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border p-5 shadow-2xl ${
              isDark ? "border-white/10 bg-[#0d1530] text-white" : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <h2 className="text-base font-extrabold">Add New Product</h2>
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

            <form onSubmit={handleAddProduct} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500">Product Name *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. MacBook Pro M3"
                  className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                    isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-500">Brand</label>
                  <input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Apple"
                    className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                      isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                    }`}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                      isDark ? "border-white/10 bg-[#0a0f1e] text-white" : "border-slate-200 bg-white text-slate-900"
                    }`}
                  >
                    <option value="Laptops">Laptops</option>
                    <option value="Smartphones">Smartphones</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Smart Devices">Smart Devices</option>
                    <option value="Cameras">Cameras</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-500">Price ($ USD) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1200.00"
                    className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                      isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                    }`}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500">Old Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.old_price}
                    onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                    placeholder="1400.00"
                    className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                      isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500">Image URL</label>
                <input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
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
                  {saving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
