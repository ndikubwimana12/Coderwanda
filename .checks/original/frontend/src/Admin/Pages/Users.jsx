import { useEffect, useState } from "react";
import {
  Users, Search, UserPlus, Trash2, Shield,
  ShieldCheck, Download, Printer, X, Mail, Phone,
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

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const { isDark } = useAdminTheme();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
  });

  const fetchUsers = () => {
    setLoading(true);
    api.get("/admin/users?limit=100")
      .then((r) => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await api.post("/admin/users", formData);
      setShowAddModal(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "user",
      });
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to create user account.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`Are you sure you want to change this user's role to ${nextRole.toUpperCase()}?`)) return;
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: nextRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u))
      );
    } catch (err) {
      alert("Failed to update role: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user account?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert("Failed to delete user: " + (err.response?.data?.error || err.message));
    }
  };

  const exportCSV = () => {
    window.open("http://127.0.0.1:5000/api/admin/reports/export/users", "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  const filtered = users.filter((u) => {
    return (
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Users Directory & Accounts
          </h1>
          <p className="text-xs text-slate-500">{users.length} registered accounts across the platform</p>
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
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
              isDark
                ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
            }`}
          >
            <Printer size={13} /> Print
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-500 shadow-sm transition-colors"
          >
            <UserPlus size={14} /> Add User
          </button>
        </div>
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
            placeholder="Search by name, email, or phone number..."
            className={`w-full rounded-lg border py-1.5 pl-8 pr-3 text-xs outline-none transition ${
              isDark
                ? "border-white/10 bg-white/5 text-slate-200 placeholder-slate-500 focus:border-purple-500"
                : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white"
            }`}
          />
        </div>
      </div>

      {/* Users Table */}
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
                <th className="px-4 py-3">User Profile</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Role / Permission</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-white/5" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-slate-400">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const isAdmin = u.role === "admin";
                  return (
                    <tr
                      key={u.id}
                      className={`transition-colors ${isDark ? "hover:bg-white/2" : "hover:bg-slate-50"}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ${
                              isAdmin
                                ? "bg-gradient-to-br from-amber-500 to-amber-600"
                                : "bg-gradient-to-br from-purple-600 to-indigo-600"
                            }`}
                          >
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{u.name}</p>
                            <p className="text-[10px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">{u.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleRole(u.id, u.role)}
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold capitalize transition-colors ${
                            isAdmin
                              ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
                          }`}
                        >
                          {isAdmin ? <ShieldCheck size={11} /> : <Shield size={11} />}
                          {u.role || "user"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{timeAgo(u.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={13} />
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
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border p-5 shadow-2xl ${
              isDark ? "border-white/10 bg-[#0d1530] text-white" : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <h2 className="text-base font-extrabold">Create New User</h2>
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

            <form onSubmit={handleAddUser} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500">Full Name *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Eric Ndikubwimana"
                  className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                    isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                  }`}
                />
              </div>

              <div>
                <label className="font-bold text-slate-500">Email Address *</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                    isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-500">Password *</label>
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                      isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                    }`}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500">Phone</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+250 78X XXX XXX"
                    className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                      isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={`mt-1 w-full rounded-lg border py-1.5 px-3 outline-none ${
                    isDark ? "border-white/10 bg-[#0a0f1e] text-white" : "border-slate-200 bg-white text-slate-900"
                  }`}
                >
                  <option value="user">User (Standard account)</option>
                  <option value="admin">Admin (Full access)</option>
                </select>
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
                  {saving ? "Saving..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
