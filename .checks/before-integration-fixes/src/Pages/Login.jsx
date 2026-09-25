import { setSession } from '../Utils/session';
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../Utils/api";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect") || "/ecommerce";

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.email || !form.password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post("/auth/login", {
                email: form.email,
                password: form.password,
            });

            setSession(data.user, data.token);

            window.dispatchEvent(new Event("storage"));
            navigate(data.user.admin_access ? '/admin' : (redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/'));
        } catch (err) {
            setError(err.response?.data?.error || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f7f3ff] px-6 py-12">

            <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">

                {/* Left */}
                <div className="hidden bg-purple-700 p-12 text-white lg:block">

                    <div className="flex h-full flex-col justify-between">

                        <div>
                            <p className="text-sm font-bold uppercase tracking-widest text-purple-200">
                                CodeRwanda Tech Store
                            </p>

                            <h1 className="mt-6 text-4xl font-extrabold leading-tight">
                                Welcome back to
                                <span className="block text-purple-200">
                                    CodeRwanda.
                                </span>
                            </h1>

                            <p className="mt-5 max-w-sm leading-7 text-purple-100">
                                Sign in to continue with your shopping,
                                checkout and orders.
                            </p>
                        </div>

                        <div className="mt-12">
                            <i className="fa-solid fa-cart-shopping text-7xl text-purple-200"></i>
                        </div>

                    </div>
                </div>

                {/* Form */}
                <div className="p-7 sm:p-10 lg:p-12">

                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-slate-900">
                            Sign In
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Login to continue your purchase.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Email Address
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-purple-700 py-3.5 font-bold text-white transition hover:bg-purple-800 disabled:opacity-60"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                            {!loading && <i className="fa-solid fa-arrow-right ml-2"></i>}
                        </button>

                    </form>

                    <p className="mt-7 text-center text-sm text-slate-500">
                        Don't have an account?{" "}
                        <Link
                            to={`/register?redirect=${encodeURIComponent(redirect)}`}
                            className="font-bold text-purple-700 hover:text-purple-900"
                        >
                            Create an account
                        </Link>
                    </p>

                </div>

            </div>
        </main>
    );
}