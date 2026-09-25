import { Handshake, Plus } from "lucide-react";
export default function PartnersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-extrabold text-white">Partners</h1><p className="text-sm text-slate-500">Manage partner organizations and logos</p></div>
        <button className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-700 transition-colors"><Plus size={16} /> Add Partner</button>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 py-20" style={{ background: "linear-gradient(135deg, #0d1530 0%, #0a0f1e 100%)" }}>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 mb-4"><Handshake size={28} className="text-emerald-400" strokeWidth={1.5} /></div>
        <h2 className="text-lg font-bold text-white">No partners yet</h2>
        <p className="mt-1 text-sm text-slate-500">Add partner logos to showcase collaborations</p>
      </div>
    </div>
  );
}
