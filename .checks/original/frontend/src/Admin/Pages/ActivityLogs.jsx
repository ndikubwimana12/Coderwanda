import { useEffect, useState } from "react";
import { ScrollText, ShoppingCart, Mail, GraduationCap } from "lucide-react";
import api from "../../Utils/api";

function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(d).toLocaleDateString();
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/orders?limit=10").catch(() => ({ data: [] })),
      api.get("/admin/contacts?limit=10").catch(() => ({ data: [] })),
      api.get("/admin/enrollments?limit=10").catch(() => ({ data: [] })),
    ]).then(([orders, contacts, enrollments]) => {
      const merged = [
        ...orders.data.map((o) => ({ id: `o-${o.id}`, icon: ShoppingCart, color: "blue", text: `Order #${o.id} placed by ${o.full_name}`, time: o.created_at })),
        ...contacts.data.map((c) => ({ id: `c-${c.id}`, icon: Mail, color: "amber", text: `Contact message from ${c.name}: "${c.subject}"`, time: c.created_at })),
        ...enrollments.data.map((e) => ({ id: `e-${e.id}`, icon: GraduationCap, color: "emerald", text: `${e.user_name} enrolled in ${e.course_title}`, time: e.enrolled_at })),
      ].sort((a, b) => new Date(b.time) - new Date(a.time));
      setLogs(merged);
    }).finally(() => setLoading(false));
  }, []);

  const colorMap = {
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  };

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-extrabold text-white">Activity Logs</h1><p className="text-sm text-slate-500">Full audit trail of platform events</p></div>
      <div className="rounded-2xl border border-white/5 p-5" style={{ background: "linear-gradient(135deg, #0d1530 0%, #0a0f1e 100%)" }}>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-white/5" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-white/5" />
                  <div className="h-2.5 w-1/4 animate-pulse rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center py-12">
            <ScrollText size={32} className="text-slate-600 mb-3" />
            <p className="text-slate-500 text-sm">No activity recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const Icon = log.icon;
              return (
                <div key={log.id} className="flex gap-3 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${colorMap[log.color]}`}>
                    <Icon size={15} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200">{log.text}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{timeAgo(log.time)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
