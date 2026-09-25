import { TrendingUp, TrendingDown } from "lucide-react";
import { useAdminTheme } from "../ThemeContext";

const colorMap = {
  purple: {
    bgLight: "bg-purple-50 border-purple-200/80 text-purple-600",
    bgDark: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  },
  blue: {
    bgLight: "bg-blue-50 border-blue-200/80 text-blue-600",
    bgDark: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  },
  emerald: {
    bgLight: "bg-emerald-50 border-emerald-200/80 text-emerald-600",
    bgDark: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  },
  amber: {
    bgLight: "bg-amber-50 border-amber-200/80 text-amber-600",
    bgDark: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  },
  rose: {
    bgLight: "bg-rose-50 border-rose-200/80 text-rose-600",
    bgDark: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  },
};

export default function StatCard({
  title,
  value,
  change,
  positive = true,
  icon: Icon,
  color = "purple",
  loading = false,
}) {
  const { isDark } = useAdminTheme();
  const c = colorMap[color] || colorMap.purple;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-3.5 transition-all duration-150 ${
        isDark
          ? "border-white/5 bg-[#0d1530] text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-900 shadow-sm hover:border-slate-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
              isDark ? c.bgDark : c.bgLight
            }`}
          >
            {Icon && <Icon size={16} strokeWidth={2} />}
          </div>
          <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {title}
          </span>
        </div>

        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
              positive
                ? isDark
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-emerald-50 text-emerald-700"
                : isDark
                ? "bg-rose-500/10 text-rose-400"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {change}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline justify-between">
        {loading ? (
          <div className="h-6 w-16 animate-pulse rounded bg-slate-200" />
        ) : (
          <p className="text-xl font-extrabold tracking-tight">{value}</p>
        )}
      </div>
    </div>
  );
}
