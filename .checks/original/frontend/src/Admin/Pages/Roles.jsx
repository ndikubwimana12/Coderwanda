import { ShieldCheck, Plus } from "lucide-react";

const roles = [
  { name: "Super Admin", users: 1, color: "purple", perms: "Full access to all modules" },
  { name: "Admin", users: 3, color: "blue", perms: "Manage content, users, orders" },
  { name: "Editor", users: 5, color: "emerald", perms: "Manage blog, testimonials, partners" },
  { name: "Customer", users: 120, color: "amber", perms: "Place orders, view products" },
  { name: "Student", users: 85, color: "rose", perms: "Enroll in courses, view content" },
];

const colorMap = {
  purple: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  rose: "border-rose-500/20 bg-rose-500/10 text-rose-400",
};

export default function RolesPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white">Roles & Permissions</h1>
          <p className="text-sm text-slate-500">Define access levels for each user type</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-700 transition-colors">
          <Plus size={16} /> Add Role
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => (
          <div
            key={r.name}
            className="rounded-2xl border border-white/5 p-5 transition hover:border-white/10"
            style={{ background: "linear-gradient(135deg, #0d1530 0%, #0a0f1e 100%)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colorMap[r.color]}`}>
                <ShieldCheck size={18} strokeWidth={1.8} />
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${colorMap[r.color]}`}>
                {r.users} users
              </span>
            </div>
            <h3 className="font-bold text-white">{r.name}</h3>
            <p className="mt-1 text-xs text-slate-500">{r.perms}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
