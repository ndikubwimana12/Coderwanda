import { getUser } from '../../Utils/session';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, ShoppingCart, GraduationCap, DollarSign, Package, Phone, CheckCircle2, Server, Database, HardDrive, Shield, FileSpreadsheet } from "lucide-react";
import StatCard from "../Components/StatCard";
import RecentUsers from "../Components/RecentUsers";
import RecentActivity from "../Components/RecentActivity";
import QuickActions from "../Components/QuickActions";
import api from "../../Utils/api";
import { useAdminTheme } from '../useAdminTheme';

const DEFAULT_BAR_DATA = Array(20).fill(0);

export default function AdminDashboard() {
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState({ api: "Checking", db: "Checking" });
  const { isDark } = useAdminTheme();
  const user = (getUser() || {});

  useEffect(() => {
    api.get("/admin/stats")
      .then((r) => setStats(r.data))
      .catch(() => setError('Unable to load dashboard data. Refresh to retry.'))
      .finally(() => setLoading(false));

    api.get("/health")
      .then((r) => {
        setHealth({
          api: r.data?.status === "ok" ? "Online" : "Degraded",
          db: r.data?.database === "connected" ? "Online" : "Disconnected",
        });
      })
      .catch(() => {
        setHealth({ api: "Offline", db: "Unknown" });
      });
  }, []);

  const fmt = (n) => Number(n || 0).toLocaleString();
  const fmtMoney = (n) => `RWF ${Number(n || 0).toLocaleString("en", { minimumFractionDigits: 0 })}`;
  const chartData = stats?.trend && stats.trend.length > 0 ? stats.trend : DEFAULT_BAR_DATA;

  return (
    <div className="space-y-3">{error && <p role="alert" className="text-red-500">{error}</p>}

      {/* Header bar - Compact */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Welcome back, {user.name?.split(" ")[0] || "Admin"} 👋
          </h1>
          <p className="text-xs text-slate-500">Platform activity & performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/analytics"
            className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-purple-500 transition-colors"
          >
            <FileSpreadsheet size={13} />
            Generate Report
          </Link>
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span className="text-[11px] font-bold text-emerald-600">{health.api === "Online" && health.db === "Online" ? "All Systems Operational" : "Check system status"}</span>
          </div>
        </div>
      </div>

      {/* KPI Grid - Short & Compact (6 cards in a single row on desktop) */}
      <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          title="Total Users"
          value={fmt(stats?.users)}
          positive
          icon={Users}
          color="purple"
          loading={loading}
        />
        <StatCard
          title="Total Orders"
          value={fmt(stats?.orders)}
          positive
          icon={ShoppingCart}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Enrollments"
          value={fmt(stats?.enrollments)}
          positive
          icon={GraduationCap}
          color="emerald"
          loading={loading}
        />
        <StatCard
          title="Revenue"
          value={fmtMoney(stats?.revenue)}
          positive
          icon={DollarSign}
          color="amber"
          loading={loading}
        />
        <StatCard
          title="Products"
          value={fmt(stats?.products)}
          icon={Package}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Inquiries"
          value={fmt(stats?.contacts)}
          icon={Phone}
          color="rose"
          loading={loading}
        />
      </div>

      {/* Middle Row: Trend Chart (60%) + Activity Feed (40%) */}
      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">

        {/* Compact Chart */}
        <div
          className={`rounded-xl border p-3.5 transition-colors ${
            isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Platform Activity Trend</h2>
              <p className="text-[10px] text-slate-400">Events over the last 20 days</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="h-2 w-2 rounded-full bg-purple-600" />
                <span>Peak Load</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="h-2 w-2 rounded-full bg-purple-300" />
                <span>Normal</span>
              </div>
            </div>
          </div>

          {/* Bar chart container */}
          <div className="relative h-[110px]">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pb-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`border-t ${isDark ? "border-white/5" : "border-slate-100"}`} />
              ))}
            </div>

            {/* Bars */}
            <div className="absolute inset-x-0 bottom-4 top-0 flex items-end gap-1 px-1">
              {chartData.map((h, i) => (
                <div key={i} className="group relative flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full rounded-t transition-all duration-200"
                    style={{
                      height: `${h}%`,
                      background: h > 80
                        ? "linear-gradient(180deg, #9333ea 0%, #7c3aed 100%)"
                        : isDark
                        ? "linear-gradient(180deg, #4c1d95 0%, #2e1065 100%)"
                        : "linear-gradient(180deg, #c084fc 0%, #a855f7 100%)",
                      opacity: 0.9,
                    }}
                  />
                  {/* Tooltip */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white rounded px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap z-10 shadow">
                    {h}%
                  </div>
                </div>
              ))}
            </div>

            {/* X labels */}
            <div className="absolute bottom-0 left-1 right-1 flex justify-between text-[9px] text-slate-400">
              <span>Day 1</span>
              <span>Day 5</span>
              <span>Day 10</span>
              <span>Day 15</span>
              <span>Day 20</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>

      {/* Bottom Row: Recent Users (35%) + Quick Shortcuts (35%) + System Health (30%) */}
      <div className="grid gap-3 lg:grid-cols-[1.1fr_1.1fr_0.8fr]">
        <RecentUsers />
        <QuickActions />

        {/* System Health Card */}
        <div
          className={`rounded-xl border p-3.5 transition-colors ${
            isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>System Health</h2>
              <p className="text-[10px] text-slate-400">Infrastructure operational status</p>
            </div>
            <span className="text-xs font-black text-emerald-600">99.9% uptime</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { name: "API Server", status: health.api, icon: Server, color: health.api === "Online" ? "emerald" : "amber" },
              { name: "MySQL DB", status: health.db, icon: Database, color: health.db === "Online" ? "emerald" : "rose" },
              { name: "Storage", status: "Healthy", icon: HardDrive, color: "emerald" },
              { name: "Security", status: "Protected", icon: Shield, color: "emerald" },
            ].map((s) => {
              const Icon = s.icon;
              const isOk = s.color === "emerald";
              return (
                <div
                  key={s.name}
                  className={`flex items-center gap-2 rounded-lg border p-2 ${
                    isDark
                      ? "border-white/5 bg-white/2"
                      : "border-slate-100 bg-slate-50/70"
                  }`}
                >
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                    isOk
                      ? isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                      : isDark ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-600"
                  }`}>
                    <Icon size={12} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] font-bold truncate ${isDark ? "text-white" : "text-slate-800"}`}>{s.name}</p>
                    <p className={`text-[10px] font-semibold ${isOk ? "text-emerald-600" : "text-rose-500"}`}>{s.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
