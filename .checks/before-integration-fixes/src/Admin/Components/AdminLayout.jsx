import useRemote from '../../Utils/useRemote';
import DataState from '../../Components/DataState';
import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { ThemeProvider, useAdminTheme } from "../ThemeContext";

function AdminLayoutInner() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const auth = useRemote('/auth/me', null);
  const user = auth.data;
  const { isDark } = useAdminTheme();

  if (!localStorage.getItem('coderwanda_token')) return <Navigate to="/login?redirect=/admin" replace />;
  if (auth.loading || auth.error) return <DataState {...auth} />;
  if (!user?.admin_access) return <Navigate to="/" replace />;

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
