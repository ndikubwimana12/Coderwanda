import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api from "../../Utils/api";
import { useAdminTheme } from '../useAdminTheme';

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function RecentUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useAdminTheme();

  useEffect(() => {
    api.get("/admin/users?limit=4")
      .then((r) => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className={`rounded-xl border transition-colors ${
        isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      <div className={`flex items-center justify-between border-b px-4 py-2.5 ${isDark ? "border-white/5" : "border-slate-100"}`}>
        <div>
          <h2 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Recent Users</h2>
          <p className="text-[10px] text-slate-400">Newly registered accounts</p>
        </div>
        <Link
          to="/admin/users"
          className="flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700"
        >
          View all <ArrowRight size={11} />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 px-4 py-2">
              <div className="h-7 w-7 animate-pulse rounded-full bg-slate-200 dark:bg-white/5" />
              <div className="flex-1 space-y-1">
                <div className="h-2.5 w-24 animate-pulse rounded bg-slate-200 dark:bg-white/5" />
                <div className="h-2 w-32 animate-pulse rounded bg-slate-200 dark:bg-white/5" />
              </div>
            </div>
          ))
        ) : users.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">No users found</p>
        ) : (
          users.slice(0, 4).map((u) => (
            <div
              key={u.id}
              className={`flex items-center justify-between px-4 py-2 text-xs transition-colors ${
                isDark ? "hover:bg-white/2" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-[10px] font-bold text-white shadow-sm">
                  {u.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="truncate">
                  <p className={`truncate font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{u.name}</p>
                  <p className="truncate text-[10px] text-slate-400">{u.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-medium text-slate-400 shrink-0 ml-2">
                {timeAgo(u.created_at)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
