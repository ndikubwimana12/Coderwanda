import { Settings, Save } from "lucide-react";

export default function SettingsPage() {
  const user = JSON.parse(localStorage.getItem("coderwanda_user") || "{}");

  return (
    <div className="space-y-5 max-w-2xl">
      <div><h1 className="text-xl font-extrabold text-white">Settings</h1><p className="text-sm text-slate-500">Configure your admin preferences</p></div>

      {/* Profile */}
      <div className="rounded-2xl border border-white/5 p-5" style={{ background: "linear-gradient(135deg, #0d1530 0%, #0a0f1e 100%)" }}>
        <h2 className="font-bold text-white mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
            <input defaultValue={user.name || ""} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
            <input defaultValue={user.email || ""} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10" />
          </div>
        </div>
      </div>

      {/* Site */}
      <div className="rounded-2xl border border-white/5 p-5" style={{ background: "linear-gradient(135deg, #0d1530 0%, #0a0f1e 100%)" }}>
        <h2 className="font-bold text-white mb-4">Site Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Site Name</label>
            <input defaultValue="Coderwanda" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500/50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Contact Email</label>
            <input defaultValue="info@coderwanda.com" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500/50" />
          </div>
        </div>
      </div>

      <button className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-purple-700 transition-colors">
        <Save size={16} /> Save Changes
      </button>
    </div>
  );
}
