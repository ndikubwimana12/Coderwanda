import api from '../../Utils/api';
import { clearSession } from '../../Utils/session';
import { getUser } from '../../Utils/session';
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, ShieldCheck, Briefcase, FolderKanban, Package, ShoppingCart, BookOpen, ClipboardList, FileText, MessageSquare, Handshake, Mail, Phone, Newspaper, BarChart2, ScrollText, Settings, Wrench, X, LogOut, ChevronRight } from "lucide-react";
import logo from "../../assets/CODERWANDA.png";
import { useAdminTheme } from '../useAdminTheme';

const NAV = [
  { section: null, items: [{ label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true }] },
  {
    section: "MANAGE",
    items: [
      { label: "Users", to: "/admin/users", icon: Users },
      { label: "Roles", to: "/admin/roles", icon: ShieldCheck },
      { label: "Services", to: "/admin/services", icon: Wrench },
      { label: "Projects", to: "/admin/projects", icon: FolderKanban },
    ],
  },
  {
    section: "ECOMMERCE",
    items: [
      { label: "Products", to: "/admin/products", icon: Package },
      { label: "Orders", to: "/admin/orders", icon: ShoppingCart },
    ],
  },
  {
    section: "TRAINING",
    items: [
      { label: "Courses", to: "/admin/courses", icon: BookOpen },
      { label: "Enrollments", to: "/admin/enrollments", icon: ClipboardList },
    ],
  },
  {
    section: "CAREERS",
    items: [
      { label: "Job Listings", to: "/admin/careers", icon: Briefcase },
      { label: "Applications", to: "/admin/applications", icon: FileText },
    ],
  },
  {
    section: "CONTENT",
    items: [
      { label: "Blog Posts", to: "/admin/blog", icon: Newspaper },
      { label: "Testimonials", to: "/admin/testimonials", icon: MessageSquare },
      { label: "Partners", to: "/admin/partners", icon: Handshake },
      { label: "Subscribers", to: "/admin/subscribers", icon: Mail },
      { label: "Contacts", to: "/admin/contacts", icon: Phone },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      { label: "Analytics", to: "/admin/analytics", icon: BarChart2 },
      { label: "Activity Logs", to: "/admin/activity-logs", icon: ScrollText },
      { label: "Settings", to: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();
  const { isDark } = useAdminTheme();
  const user = (getUser() || {});

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* The local session is cleared even if the server is unavailable. */ } finally { clearSession(); navigate('/login'); }
  };

  return (
    <>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col transition-all duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isDark
            ? "bg-[#0a0f1e] border-r border-white/5 text-slate-200"
            : "bg-white border-r border-slate-200 text-slate-800 shadow-sm"
        }`}
      >
        {/* Top accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400" />

        {/* Logo & Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isDark ? "border-white/5" : "border-slate-100"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 shadow-md shadow-purple-200 text-white font-bold p-1">
              <img src={logo} alt="CodeRwanda" className="h-6 w-auto object-contain brightness-0 invert" />
            </div>
            <div>
              <p className={`text-sm font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Coder<span className="text-purple-600">wanda</span>
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Workspace</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className={`rounded-lg p-1.5 lg:hidden ${
              isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs font-semibold scrollbar-thin">
          {NAV.map((group, gi) => (
            <div key={gi}>
              {group.section && (
                <p className={`mb-1 px-3 text-[10px] font-bold tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {group.section}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                          isActive
                            ? isDark
                              ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                              : "bg-purple-50 text-purple-700 border border-purple-200/80 shadow-sm"
                            : isDark
                            ? "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={15}
                            strokeWidth={isActive ? 2.2 : 1.8}
                            className={isActive ? (isDark ? "text-purple-400" : "text-purple-600") : "text-slate-400 group-hover:text-slate-600"}
                          />
                          <span className="flex-1">{item.label}</span>
                          {isActive && <ChevronRight size={12} className={isDark ? "text-purple-400" : "text-purple-600"} />}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className={`border-t p-3 ${isDark ? "border-white/5" : "border-slate-100 bg-slate-50/50"}`}>
          <div className={`flex items-center gap-2.5 rounded-xl p-2.5 border ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
              {user.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{user.name || "Admin"}</p>
              <p className="truncate text-[10px] text-slate-400 capitalize">{user.role || "Administrator"}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
