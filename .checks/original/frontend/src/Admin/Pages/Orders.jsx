import { useEffect, useState } from "react";
import {
  ShoppingCart, Search, Eye, Download, Printer,
  CheckCircle2, Clock, AlertTriangle, XCircle, X,
  MapPin, Phone, Mail, CreditCard, ChevronDown,
} from "lucide-react";
import api from "../../Utils/api";
import { useAdminTheme } from "../ThemeContext";

function timeAgo(d) {
  if (!d) return "—";
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const statusColor = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  processing: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const { isDark } = useAdminTheme();

  const fetchOrders = () => {
    setLoading(true);
    api.get("/admin/orders?limit=100")
      .then((r) => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert("Failed to update order status: " + (err.response?.data?.error || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    window.open("http://127.0.0.1:5000/api/admin/reports/export/orders", "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.email?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search);
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  return (
    <div className="space-y-4">

      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Orders & Sales Management
          </h1>
          <p className="text-xs text-slate-500">
            {orders.length} total orders · Total Revenue:{" "}
            <span className="font-bold text-emerald-600">${totalRevenue.toLocaleString()}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
              isDark
                ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
            }`}
          >
            <Download size={13} /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-purple-500 transition-colors"
          >
            <Printer size={13} /> Print Report
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className={`rounded-xl border p-3 transition-colors ${
          isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
        }`}
      >
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, email, or order #..."
              className={`w-full rounded-lg border py-1.5 pl-8 pr-3 text-xs outline-none transition ${
                isDark
                  ? "border-white/10 bg-white/5 text-slate-200 placeholder-slate-500 focus:border-purple-500"
                  : "border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white"
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Status:</span>
            <div className="flex gap-1">
              {["all", "pending", "processing", "completed", "cancelled"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold capitalize transition-colors ${
                    filterStatus === st
                      ? "bg-purple-600 text-white"
                      : isDark
                      ? "bg-white/5 text-slate-400 hover:bg-white/10"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div
        className={`overflow-hidden rounded-xl border transition-colors ${
          isDark ? "border-white/5 bg-[#0d1530]" : "border-slate-200 bg-white shadow-sm"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-xs">
            <thead>
              <tr
                className={`border-b text-left font-bold uppercase tracking-wider ${
                  isDark
                    ? "border-white/5 bg-white/2 text-slate-400"
                    : "border-slate-100 bg-slate-50/70 text-slate-500"
                }`}
              >
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-white/5" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-slate-400">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr
                    key={o.id}
                    className={`transition-colors ${isDark ? "hover:bg-white/2" : "hover:bg-slate-50"}`}
                  >
                    <td className="px-4 py-3 font-bold text-purple-600">#{o.id}</td>
                    <td className="px-4 py-3">
                      <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{o.full_name}</p>
                      <p className="text-[10px] text-slate-400">{o.email || o.phone}</p>
                    </td>
                    <td className={`px-4 py-3 font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                      ${Number(o.total_amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-500 capitalize">
                      {o.payment_method?.replace("-", " ") || "Mobile Money"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`rounded-lg border px-2 py-0.5 text-[11px] font-bold capitalize outline-none cursor-pointer ${
                          statusColor[o.status] || statusColor.pending
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{timeAgo(o.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 font-bold text-purple-700 hover:bg-purple-600 hover:text-white transition-colors"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border p-5 shadow-2xl ${
              isDark ? "border-white/10 bg-[#0d1530] text-white" : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600">Order Information</span>
                <h2 className="text-base font-extrabold">Order #{selectedOrder.id}</h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              {/* Customer Info */}
              <div className={`rounded-xl border p-3 ${isDark ? "border-white/5 bg-white/2" : "border-slate-100 bg-slate-50"}`}>
                <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-2">Customer Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px]">Name:</span>
                    <p className="font-bold">{selectedOrder.full_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Email:</span>
                    <p className="font-bold">{selectedOrder.email || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Phone:</span>
                    <p className="font-bold">{selectedOrder.phone || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Delivery Address:</span>
                    <p className="font-bold">{selectedOrder.address}, {selectedOrder.city}</p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className={`rounded-xl border p-3 ${isDark ? "border-white/5 bg-white/2" : "border-slate-100 bg-slate-50"}`}>
                <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-2">Ordered Items</h3>
                <div className="space-y-1.5">
                  {selectedOrder.items && Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-1.5 last:border-0 last:pb-0">
                        <div>
                          <p className="font-bold">{item.product_name || item.name}</p>
                          <p className="text-[10px] text-slate-400">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</p>
                        </div>
                        <p className="font-bold text-purple-600">
                          ${(Number(item.quantity) * Number(item.price)).toFixed(2)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-400">Items recorded in total amount.</p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-2 font-bold">
                  <span>Total Amount:</span>
                  <span className="text-sm font-extrabold text-emerald-600">
                    ${Number(selectedOrder.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 font-semibold">Change Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-bold capitalize outline-none ${
                    statusColor[selectedOrder.status]
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
