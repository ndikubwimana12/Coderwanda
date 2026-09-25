import { downloadReport } from '../../Utils/downloadReport';
import { useEffect, useState } from "react";
import { TrendingUp, Users, ShoppingCart, GraduationCap, DollarSign, FileSpreadsheet, Download, Printer, Briefcase, Mail, RefreshCw, CheckCircle2 } from "lucide-react";
import api from "../../Utils/api";
import { useAdminTheme } from '../useAdminTheme';

export default function AnalyticsPage() {
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState("orders");
  const { isDark } = useAdminTheme();

  const fetchSummary = () => {
    api.get("/admin/reports/summary")
      .then((r) => setReportData(r.data))
      .catch(() => setError('Unable to load analytics. Please retry.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleExportCSV = (type) => { downloadReport(type || selectedModule).catch(() => setError('Export failed. Please try again.')); };


  const handlePrint = () => {
    window.print();
  };

  const kpi = reportData?.kpi || {
    users: 0,
    orders: 0,
    enrollments: 0,
    applications: 0,
    contacts: 0,
    revenue: 0,
  };

  return (
    <div className="space-y-4">{error && <p role="alert" className="text-red-500">{error}</p>}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Analytics & Business Reporting
          </h1>
          <p className="text-xs text-slate-500">
            Real-time platform insights, KPI metrics, and exportable business reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSummary}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
              isDark
                ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
            }`}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-purple-500 transition-colors"
          >
            <Printer size={13} /> Print Full Report
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
        <div
          className={`rounded-xl border p-3 transition-colors ${
            isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between text-purple-600 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <Users size={14} />
          </div>
          <p className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{kpi.users}</p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
            <TrendingUp size={10} /> Active
          </span>
        </div>

        <div
          className={`rounded-xl border p-3 transition-colors ${
            isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Orders</span>
            <ShoppingCart size={14} />
          </div>
          <p className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{kpi.orders}</p>
          <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-0.5">
            <CheckCircle2 size={10} /> Store Orders
          </span>
        </div>

        <div
          className={`rounded-xl border p-3 transition-colors ${
            isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enrollments</span>
            <GraduationCap size={14} />
          </div>
          <p className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{kpi.enrollments}</p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
            <TrendingUp size={10} /> Learners
          </span>
        </div>

        <div
          className={`rounded-xl border p-3 transition-colors ${
            isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Applications</span>
            <Briefcase size={14} />
          </div>
          <p className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{kpi.applications}</p>
          <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-0.5">
            <Users size={10} /> Candidates
          </span>
        </div>

        <div
          className={`rounded-xl border p-3 transition-colors ${
            isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inquiries</span>
            <Mail size={14} />
          </div>
          <p className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{kpi.contacts}</p>
          <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1 mt-0.5">
            <Mail size={10} /> Messages
          </span>
        </div>

        <div
          className={`rounded-xl border p-3 transition-colors ${
            isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gross Sales</span>
            <DollarSign size={14} />
          </div>
          <p className="text-xl font-black text-emerald-600">${Number(kpi.revenue || 0).toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
            <TrendingUp size={10} /> Revenue
          </span>
        </div>
      </div>

      {/* Report Generator Box */}
      <div
        className={`rounded-xl border p-4 transition-colors ${
          isDark
            ? "border-purple-500/20 bg-[#131b3d]"
            : "border-purple-200 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 shadow-sm"
        }`}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-purple-200/60 dark:border-white/10 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-purple-600 mb-0.5">
              <FileSpreadsheet size={15} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Report Export Center</span>
            </div>
            <h2 className={`text-sm font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
              Generate & Download Specific Dataset Report
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportCSV(selectedModule)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm transition-colors"
            >
              <Download size={13} /> Export {selectedModule.toUpperCase()} CSV
            </button>
            <button
              onClick={handlePrint}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                isDark ? "border-white/15 bg-white/5 text-white" : "border-slate-300 bg-white text-slate-800 shadow-sm"
              }`}
            >
              <Printer size={13} /> Print Document
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { id: "orders", label: "Orders & Sales", icon: ShoppingCart },
            { id: "enrollments", label: "Training Students", icon: GraduationCap },
            { id: "applications", label: "Careers Candidates", icon: Briefcase },
            { id: "contacts", label: "Contact Inquiries", icon: Mail },
            { id: "users", label: "User Directory", icon: Users },
          ].map((mod) => {
            const Icon = mod.icon;
            const isSelected = selectedModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setSelectedModule(mod.id)}
                className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-bold transition-all ${
                  isSelected
                    ? "border-purple-600 bg-purple-600 text-white shadow-sm"
                    : isDark
                    ? "border-white/5 bg-white/3 text-slate-400 hover:bg-white/5 hover:text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-purple-50"
                }`}
              >
                <Icon size={15} />
                <span>{mod.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Analytics Breakdowns */}
      <div className="grid gap-3 lg:grid-cols-3">

        {/* Order Status Breakdown */}
        <div
          className={`rounded-xl border p-3.5 transition-colors ${
            isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <h3 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Orders by Status</h3>
          <p className="text-[10px] text-slate-400 mb-3">Volume & proportion</p>

          <div className="space-y-2.5">
            {reportData?.order_status && reportData.order_status.length > 0 ? (
              reportData.order_status.map((st) => {
                const pct = kpi.orders > 0 ? Math.round((st.count / kpi.orders) * 100) : 0;
                return (
                  <div key={st.status} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold capitalize text-slate-700 dark:text-slate-300">{st.status}</span>
                      <span className="text-slate-400">{st.count} orders ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                      <div className="h-full rounded-full bg-purple-600" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-[11px] text-slate-400 py-4 text-center">No order records found.</p>
            )}
          </div>
        </div>

        {/* Popular Courses */}
        <div
          className={`rounded-xl border p-3.5 transition-colors ${
            isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <h3 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Popular Training Courses</h3>
          <p className="text-[10px] text-slate-400 mb-3">Student enrollment counts</p>

          <div className="space-y-2">
            {reportData?.enrollments_by_course && reportData.enrollments_by_course.length > 0 ? (
              reportData.enrollments_by_course.map((c, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between rounded-lg border p-2 text-xs ${
                    isDark ? "border-white/5 bg-white/2" : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-100 text-[10px] font-bold text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                      {idx + 1}
                    </span>
                    <p className="font-bold truncate">{c.course_title}</p>
                  </div>
                  <span className="font-bold text-purple-600 shrink-0">{c.students} learners</span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-slate-400 py-4 text-center">No enrollment records found.</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div
          className={`rounded-xl border p-3.5 transition-colors ${
            isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <h3 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Top Products Sold</h3>
          <p className="text-[10px] text-slate-400 mb-3">Sales volume & traction</p>

          <div className="space-y-2">
            {reportData?.top_products && reportData.top_products.length > 0 ? (
              reportData.top_products.map((p, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between rounded-lg border p-2 text-xs ${
                    isDark ? "border-white/5 bg-white/2" : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-[10px] font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                      {idx + 1}
                    </span>
                    <p className="font-bold truncate">{p.product_name}</p>
                  </div>
                  <span className="font-bold text-emerald-600 shrink-0">{p.total_sold} sold</span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-slate-400 py-4 text-center">No product sales records yet.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
