import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { ThemeProvider, useAdminTheme } from "../ThemeContext";

function AdminLayoutInner() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("coderwanda_user") || "null");
  const { isDark } = useAdminTheme();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div
      className={`flex h-screen overflow-hidden transition-colors duration-200 ${
        isDark ? "bg-[#0a0f1e] text-slate-100" : "bg-slate-100/70 text-slate-900"
      }`}
    >
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex flex-1 flex-col overflow-hidden lg:pl-[260px]">
        <AdminHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <ThemeProvider>
      <AdminLayoutInner />
    </ThemeProvider>
  );
}
