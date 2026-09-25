import { useEffect, useState } from "react";
import { ShoppingCart, Mail, GraduationCap, ArrowRight, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
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

export default function RecentActivity() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useAdminTheme();

  useEffect(() => {
    Promise.all([
      api.get("/admin/orders?limit=2").catch(() => ({ data: [] })),
      api.get("/admin/contacts?limit=2").catch(() => ({ data: [] })),
      api.get("/admin/enrollments?limit=2").catch(() => ({ data: [] })),
      api.get("/admin/applications?limit=2").catch(() => ({ data: [] })),
    ]).then(([orders, contacts, enrollments, applications]) => {
      const merged = [
        ...orders.data.map((o) => ({
          id: `o-${o.id}`,
          icon: ShoppingCart,
          color: "blue",
          title: `Order #${o.id} placed`,
          desc: `${o.full_name || "Guest"} · $${Number(o.total_amount).toFixed(0)}`,
          time: o.created_at,
        })),
        ...contacts.data.map((c) => ({
          id: `c-${c.id}`,
          icon: Mail,
          color: "amber",
          title: `Contact from ${c.name}`,
          desc: c.subject || "Message received",
          time: c.created_at,
        })),
        ...enrollments.data.map((e) => ({
          id: `e-${e.id}`,
          icon: GraduationCap,
          color: "emerald",
          title: `New Student Enrollment`,
          desc: `${e.full_name || e.user_name || "Applicant"} · ${e.course_title || "Course"}`,
          time: e.enrolled_at || e.created_at,
        })),
        ...applications.data.map((a) => ({
          id: `a-${a.id}`,
          icon: Briefcase,
          color: "purple",
          title: `Job Application`,
          desc: `${a.name} · ${a.job_title || "Candidate"}`,
          time: a.created_at,
        })),
      ]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 4);

      setItems(merged);
    }).finally(() => setLoading(false));
  }, []);

  const colorStyles = {
    blue: isDark ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-200/80",
    amber: isDark ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-600 border-amber-200/80",
    emerald: isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200/80",
    purple: isDark ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-purple-50 text-purple-600 border-purple-200/80",
  };

  return (
    <div
      className={`rounded-xl border transition-colors ${
        isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      <div className={`flex items-center justify-between border-b px-4 py-2.5 ${isDark ? "border-white/5" : "border-slate-100"}`}>
        <div>
          <h2 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Live Activity Feed</h2>
          <p className="text-[10px] text-slate-400">Real-time platform occurrences</p>
        </div>
        <Link
          to="/admin/activity-logs"
          className="flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700"
        >
          View all <ArrowRight size={11} />
        </Link>
      </div>

      <div className="p-3 space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-2.5 items-center">
              <div className="h-7 w-7 animate-pulse rounded-lg bg-slate-200 dark:bg-white/5" />
              <div className="flex-1 space-y-1">
                <div className="h-2.5 w-32 animate-pulse rounded bg-slate-200 dark:bg-white/5" />
                <div className="h-2 w-20 animate-pulse rounded bg-slate-200 dark:bg-white/5" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-4">No recent activity</p>
        ) : (
          items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${colorStyles[item.color]}`}>
                    <Icon size={13} strokeWidth={2} />
                  </div>
                  <div className="truncate">
                    <p className={`text-xs font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{item.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-slate-400 shrink-0">
                  {timeAgo(item.time)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
