import { Menu, Search, Bell, RefreshCw, Sun, Moon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAdminTheme } from "../ThemeContext";

const titles = {
  "/admin": "Overview Dashboard",
  "/admin/users": "Users Management",
  "/admin/roles": "Roles & Permissions",
  "/admin/services": "Services Management",
  "/admin/projects": "Company Projects",
  "/admin/products": "Products & Inventory",
  "/admin/orders": "Orders & Sales",
  "/admin/courses": "Courses & Training",
  "/admin/enrollments": "Student Enrollments",
  "/admin/careers": "Job Openings",
  "/admin/applications": "Job Applications",
  "/admin/blog": "Blog & Articles",
  "/admin/testimonials": "Client Testimonials",
  "/admin/partners": "Partners & Collaborators",
  "/admin/subscribers": "Newsletter Subscribers",
  "/admin/contacts": "Contact Inquiries",
  "/admin/analytics": "Analytics & Reports",
  "/admin/activity-logs": "Audit Activity Logs",
  "/admin/settings": "System Settings",
};

export default function AdminHeader({ onMenuClick }) {
  const location = useLocation();
  const { isDark, toggleTheme } = useAdminTheme();
  const title = titles[location.pathname] || "Admin Console";

  return (
    <header
      className={`sticky top-0 z-30 border-b transition-colors duration-200 ${
        isDark
          ? "bg-[#0a0f1e]/90 border-white/5 shadow-sm shadow-purple-950/20 backdrop-blur-md"
          : "bg-white/95 border-slate-200 shadow-sm backdrop-blur-md"
      }`}
    >
      <div className="flex h-14 items-center gap-3 px-4 sm:px-5">

        {/* Mobile menu toggle */}
        <button
          onClick={onMenuClick}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors lg:hidden ${
            isDark ? "border-white/10 text-slate-400 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Menu size={16} />
        </button>

        {/* Page Title */}
        <div>
          <h1 className={`text-sm font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            {title}
          </h1>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs ml-4 hidden md:block">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Quick search..."
            className={`w-full rounded-lg border py-1.5 pl-8 pr-3 text-xs outline-none transition ${
              isDark
                ? "border-white/10 bg-white/5 text-slate-200 placeholder-slate-500 focus:border-purple-500"
                : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white"
            }`}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
              isDark
                ? "border-white/10 text-amber-400 hover:bg-white/5"
                : "border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Refresh button */}
          <button
            onClick={() => window.location.reload()}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
              isDark ? "border-white/10 text-slate-400 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
            title="Refresh"
          >
            <RefreshCw size={13} />
          </button>

          {/* Divider */}
          <div className={`h-4 w-px mx-0.5 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />

          {/* Live System indicator */}
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-600">Online</span>
          </div>

        </div>
      </div>
    </header>
  );
}
