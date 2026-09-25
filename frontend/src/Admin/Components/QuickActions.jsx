import { Link } from "react-router-dom";
import { UserPlus, Package, BookOpen, Briefcase, FileSpreadsheet, Settings } from "lucide-react";
import { useAdminTheme } from '../useAdminTheme';

const actions = [
  { label: "Add User", to: "/admin/users", icon: UserPlus, color: "purple" },
  { label: "Add Product", to: "/admin/products", icon: Package, color: "blue" },
  { label: "Add Course", to: "/admin/courses", icon: BookOpen, color: "emerald" },
  { label: "Post Job", to: "/admin/careers", icon: Briefcase, color: "amber" },
  { label: "Analytics", to: "/admin/analytics", icon: FileSpreadsheet, color: "rose" },
  { label: "Settings", to: "/admin/settings", icon: Settings, color: "slate" },
];

export default function QuickActions() {
  const { isDark } = useAdminTheme();

  const colorStyles = {
    purple: isDark ? "border-purple-500/20 bg-purple-500/5 text-purple-400 hover:bg-purple-500/15" : "border-purple-200 bg-purple-50/70 text-purple-700 hover:bg-purple-100",
    blue: isDark ? "border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/15" : "border-blue-200 bg-blue-50/70 text-blue-700 hover:bg-blue-100",
    emerald: isDark ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/15" : "border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100",
    amber: isDark ? "border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/15" : "border-amber-200 bg-amber-50/70 text-amber-700 hover:bg-amber-100",
    rose: isDark ? "border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/15" : "border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100",
    slate: isDark ? "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
  };

  return (
    <div
      className={`rounded-xl border p-3.5 transition-colors ${
        isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <h2 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Quick Shortcuts</h2>
          <p className="text-[10px] text-slate-400">Common administrative actions</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.to}
              to={a.to}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border py-2.5 px-2 text-center transition-all ${colorStyles[a.color]}`}
            >
              <Icon size={15} strokeWidth={2} />
              <span className="text-[11px] font-bold tracking-tight leading-tight">{a.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
