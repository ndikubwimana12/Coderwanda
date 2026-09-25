import useRemote from '../Utils/useRemote';
import DataState from '../Components/DataState';
import { getUser } from '../Utils/session';
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
    getCart,
    clearCart,
} from "../Utils/Cart";
import api from "../Utils/api";

const formatPrice = (price) => {
    return new Intl.NumberFormat("en-RW").format(price);
};

export default function Checkout() {
    const navigate = useNavigate();

    const [storedCart] = useState(getCart);
    const catalog = useRemote('/products');
    const cart = storedCart.map(item => { const product = catalog.data.find(product => product.id === item.id); return product ? { ...product, quantity: item.quantity } : null; }).filter(Boolean);
    const user = getUser();

    const [form, setForm] = useState({
        full_name: user?.name || "",
        phone: "",
        city: "Kigali",
        address: "",
    });

    const [paymentMethod, setPaymentMethod] = useState("mobile-money");
    const [loading, setLoading]             = useState(false);
    const [orderError, setOrderError]       = useState("");

    if (!user || !localStorage.getItem('coderwanda_token')) return <Navigate to="/login?redirect=/checkout" replace />;

    if (catalog.loading || catalog.error) return <DataState {...catalog} />;
    if (storedCart.length !== cart.length) return <main className="p-10 text-center"><h1>Some cart items are no longer available.</h1><a href="/cart">Return to your cart and remove unavailable items.</a></main>;
    if (cart.length === 0) {
        return <Navigate to="/ecommerce" replace />;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleFormChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setOrderError("");
        setLoading(true);

        try {
            await api.post("/orders", {
                full_name:      form.full_name,
                phone:          form.phone,
                city:           form.city,
                address:        form.address,
                payment_method: paymentMethod,
                items: cart.map((item) => ({
                    id:       item.id,
                    name:     item.name,
                    price:    item.price,
                    quantity: item.quantity,
                    image:    item.image,
                })),
            });

            clearCart();
            navigate("/ecommerce", { state: { orderSuccess: true } });
        } catch (err) {
            setOrderError(
                err.response?.data?.error || "Failed to place order. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-12">

            <div className="mx-auto max-w-6xl">

                <div className="mb-8">
                    <p className="text-sm font-bold uppercase tracking-widest text-purple-700">
                        Secure Checkout
                    </p>

                    <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
                        Complete Your Order
                    </h1>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

                    {/* Checkout form */}
                    <form
                        onSubmit={handlePayment}
                        className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
                    >

                        {orderError && (
                            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                {orderError}
                            </div>
                        )}

                        <h2 className="text-xl font-extrabold text-slate-900">
                            Delivery Information
                        </h2>

                        <div className="mt-6 grid gap-5 sm:grid-cols-2">

                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-bold">
                                    Full Name
                                </label>

                                <input
                                    name="full_name"
                                    value={form.full_name}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold">
                                    Phone
                                </label>

                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleFormChange}
                                    placeholder="078X XXX XXX"
                                    required
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold">
                                    City
                                </label>

                                <input
                                    name="city"
                                    value={form.city}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-bold">
                                    Delivery Address
                                </label>

                                <textarea
                                    name="address"
                                    value={form.address}
                                    onChange={handleFormChange}
                                    rows="3"
                                    required
                                    placeholder="Street, sector, district..."
                                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                                />
                            </div>

                        </div>

                        <div className="mt-10 border-t border-slate-100 pt-8">

                            <h2 className="text-xl font-extrabold text-slate-900">
                                Payment Method
                            </h2>

                            <div className="mt-5 space-y-3">

                                <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-purple-200 bg-purple-50 p-4">
                                    <input
                                        type="radio"
                                        value="mobile-money"
                                        checked={paymentMethod === "mobile-money"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />

                                    <div>
                                        <p className="font-bold text-slate-900">
                                            Mobile Money
                                        </p>

                                        <p className="text-sm text-slate-500">
                                            We will contact you with Mobile Money payment instructions.
                                        </p>
                                    </div>
                                </label>

                                <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 p-4">
                                    <input
                                        type="radio"
                                        value="cash"
                                        checked={paymentMethod === "cash"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />

                                    <div>
                                        <p className="font-bold text-slate-900">
                                            Cash on Delivery
                                        </p>

                                        <p className="text-sm text-slate-500">
                                            Pay when your order is delivered.
                                        </p>
                                    </div>
                                </label>

                            </div>

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-8 w-full rounded-xl bg-purple-700 py-4 font-bold text-white transition hover:bg-purple-800 disabled:opacity-60"
                        >
                            {loading ? "Placing order..." : "Confirm Order"}
                            {!loading && <i className="fa-solid fa-lock ml-2" />}
                        </button>

                    </form>

                    {/* Order summary */}
                    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6">

                        <h2 className="text-xl font-extrabold text-slate-900">
                            Your Order
                        </h2>

                        <div className="mt-6 space-y-4">

                            {cart.map((item) => (
                                <div key={item.id} className="flex gap-3">
                                    <div className="h-16 w-16 rounded-lg bg-slate-50 p-2">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900">
                                            {item.name}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            Qty: {item.quantity}
                                        </p>

                                        <p className="mt-1 text-sm font-bold text-purple-700">
                                            {formatPrice(item.price * item.quantity)} RWF
                                        </p>
                                    </div>
                                </div>
                            ))}

                        </div>

                        <div className="mt-6 border-t border-slate-100 pt-5">
                            <div className="flex justify-between">
                                <span className="font-bold">Total</span>

                                <span className="text-xl font-extrabold text-purple-700">
                                    {formatPrice(total)} RWF
                                </span>
                            </div>
                        </div>

                    </aside>

                </div>
            </div>
        </main>
    );
}
