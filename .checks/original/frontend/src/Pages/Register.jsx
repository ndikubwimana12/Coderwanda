import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../Utils/api";

export default function Register() {
    const navigate = useNavigate();
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect") || "/ecommerce";

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
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

        if (!form.name || !form.email || !form.phone || !form.password || !form.confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (form.password.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post("/auth/register", {
                name: form.name,
                email: form.email,
                phone: form.phone,
                password: form.password,
            });

            localStorage.setItem(
                "coderwanda_user",
                JSON.stringify(data.user)
            );

            window.dispatchEvent(new Event("storage"));
            navigate(redirect);
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f7f3ff] px-6 py-12">

            <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

                <div className="grid lg:grid-cols-2">

                    {/* Form */}
                    <div className="p-7 sm:p-10 lg:p-12">

                        <div className="mb-7">
                            <p className="text-sm font-bold uppercase tracking-widest text-purple-700">
                                CodeRwanda Tech
                            </p>

                            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
                                Create Account
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                Create your account to continue with your order.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Full Name
                                </label>

                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Your full name"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="078X XXX XXX"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
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
                                    placeholder="Minimum 6 characters"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Confirm Password
                                </label>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Repeat your password"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-purple-700 py-3.5 font-bold text-white transition hover:bg-purple-800 disabled:opacity-60"
                            >
                                {loading ? "Creating account..." : "Create Account"}
                            </button>

                        </form>

                        <p className="mt-6 text-center text-sm text-slate-500">
                            Already have an account?{" "}
                            <Link
                                to={`/login?redirect=${encodeURIComponent(redirect)}`}
                                className="font-bold text-purple-700"
                            >
                                Sign In
                            </Link>
                        </p>

                    </div>

                    {/* Visual */}
                    <div className="hidden bg-purple-700 p-12 text-white lg:block">

                        <div className="flex h-full flex-col justify-center">

                            <i className="fa-solid fa-user-plus text-6xl text-purple-200"></i>

                            <h2 className="mt-8 text-4xl font-extrabold leading-tight">
                                Shop smarter.
                                <span className="block text-purple-200">
                                    Shop with confidence.
                                </span>
                            </h2>

                            <p className="mt-5 leading-7 text-purple-100">
                                Create your CodeRwanda account and enjoy a
                                smoother shopping and checkout experience.
                            </p>

                        </div>

                    </div>

                </div>

            </div>
        </main>
    );
}