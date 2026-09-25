import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ShoppingBag,
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    ShieldCheck,
    Truck,
    CreditCard,
    ChevronLeft,
    PackageCheck,
} from "lucide-react";

import {
    getCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
} from "../Utils/Cart";

const formatPrice = (price) => {
    return new Intl.NumberFormat("en-RW").format(price);
};

export default function Cart() {
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    const loadCart = () => {
        setCart(getCart());
    };

    useEffect(() => {
        loadCart();

        window.addEventListener("cartUpdated", loadCart);

        return () => {
            window.removeEventListener("cartUpdated", loadCart);
        };
    }, []);

    const total = getCartTotal();

    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const handleCheckout = () => {
        const user = localStorage.getItem("coderwanda_user");

        if (!user) {
            navigate("/login?redirect=/checkout");
            return;
        }

        navigate("/checkout");
    };

    /*
    =========================================================
    EMPTY CART
    =========================================================
    */

    if (cart.length === 0) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-10">

                <div className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center">

                    <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">

                        {/* Icon */}
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-purple-50 text-purple-700">
                            <ShoppingBag size={38} strokeWidth={1.8} />
                        </div>

                        <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
                            CodeRwanda Store
                        </p>

                        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                            Your shopping bag is empty
                        </h1>

                        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-500">
                            You haven't added anything yet. Explore our technology
                            products and find something that works for you.
                        </p>

                        <Link
                            to="/ecommerce"
                            className="group mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-7 py-3.5 font-bold text-white transition duration-200 hover:bg-purple-800"
                        >
                            Continue Shopping

                            <ArrowRight
                                size={18}
                                className="transition-transform duration-200 group-hover:translate-x-1"
                            />
                        </Link>

                    </div>

                </div>

            </main>
        );
    }

    /*
    =========================================================
    CART
    =========================================================
    */

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

            <div className="mx-auto max-w-7xl">

                {/* =====================================================
                    HEADER
                ===================================================== */}

                <div className="mb-8">

                    <Link
                        to="/ecommerce"
                        className="group mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-purple-700"
                    >
                        <ChevronLeft
                            size={17}
                            className="transition-transform group-hover:-translate-x-1"
                        />

                        Continue Shopping
                    </Link>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
                                CodeRwanda Store
                            </p>

                            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                                Your Shopping Cart
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                Review your products before proceeding to checkout.
                            </p>

                        </div>

                        {/* Cart count */}

                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">

                            <ShoppingBag
                                size={17}
                                className="text-purple-600"
                            />

                            {totalItems}{" "}
                            {totalItems === 1 ? "item" : "items"}

                        </div>

                    </div>

                </div>

                {/* =====================================================
                    MAIN GRID
                ===================================================== */}

                <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">

                    {/* =================================================
                        PRODUCTS
                    ================================================= */}

                    <section>

                        <div className="space-y-4">

                            {cart.map((item) => {

                                const itemTotal =
                                    Number(item.price) * Number(item.quantity);

                                return (
                                    <article
                                        key={item.id}
                                        className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:border-purple-200 hover:shadow-md sm:p-5"
                                    >

                                        <div className="flex flex-col gap-5 sm:flex-row">

                                            {/* =========================
                                                PRODUCT IMAGE
                                            ========================== */}

                                            <Link
                                                to={`/ecommerce/product/${item.id}`}
                                                className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-4 sm:h-32 sm:w-32"
                                            >

                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                                                />

                                            </Link>

                                            {/* =========================
                                                PRODUCT INFO
                                            ========================== */}

                                            <div className="flex min-w-0 flex-1 flex-col">

                                                <div className="flex items-start justify-between gap-4">

                                                    <div className="min-w-0">

                                                        {item.category && (
                                                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-purple-600">
                                                                {item.category}
                                                            </p>
                                                        )}

                                                        <h2 className="mt-1 truncate text-lg font-extrabold text-slate-950 sm:text-xl">
                                                            {item.name}
                                                        </h2>

                                                        <p className="mt-2 text-sm text-slate-500">
                                                            Available from CodeRwanda Store
                                                        </p>

                                                    </div>

                                                    {/* Remove */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeFromCart(item.id)
                                                        }
                                                        aria-label={`Remove ${item.name}`}
                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>

                                                </div>

                                                {/* =====================
                                                    PRICE + QUANTITY
                                                ====================== */}

                                                <div className="mt-auto flex flex-col gap-4 pt-5 sm:flex-row sm:items-end sm:justify-between">

                                                    <div>

                                                        <p className="text-xs font-medium text-slate-400">
                                                            Unit price
                                                        </p>

                                                        <p className="mt-1 text-base font-extrabold text-slate-950">
                                                            {formatPrice(item.price)}{" "}
                                                            <span className="text-xs font-bold text-slate-500">
                                                                RWF
                                                            </span>
                                                        </p>

                                                    </div>

                                                    {/* Quantity */}

                                                    <div className="flex items-center justify-between gap-5 sm:justify-end">

                                                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.id,
                                                                        item.quantity - 1
                                                                    )
                                                                }
                                                                disabled={item.quantity <= 1}
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                <Minus size={15} />
                                                            </button>

                                                            <span className="flex w-10 items-center justify-center text-sm font-extrabold text-slate-900">
                                                                {item.quantity}
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.id,
                                                                        item.quantity + 1
                                                                    )
                                                                }
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-purple-700"
                                                            >
                                                                <Plus size={15} />
                                                            </button>

                                                        </div>

                                                        {/* Item total */}

                                                        <div className="min-w-[110px] text-right">

                                                            <p className="text-xs font-medium text-slate-400">
                                                                Item total
                                                            </p>

                                                            <p className="mt-1 font-extrabold text-purple-700">
                                                                {formatPrice(itemTotal)}{" "}
                                                                <span className="text-xs">
                                                                    RWF
                                                                </span>
                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </article>
                                );
                            })}

                        </div>

                        {/* =================================================
                            TRUST INFORMATION
                        ================================================= */}

                        <div className="mt-6 grid gap-3 sm:grid-cols-3">

                            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                                    <ShieldCheck size={19} />
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        Secure checkout
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Protected payment
                                    </p>
                                </div>

                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                                    <Truck size={19} />
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        Local delivery
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Rwanda delivery
                                    </p>
                                </div>

                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                                    <CreditCard size={19} />
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        Easy payment
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Pay in RWF
                                    </p>
                                </div>

                            </div>

                        </div>

                    </section>

                    {/* =================================================
                        ORDER SUMMARY
                    ================================================= */}

                    <aside className="lg:sticky lg:top-24">

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            {/* Header */}

                            <div className="border-b border-slate-100 p-6">

                                <div className="flex items-center justify-between">

                                    <h2 className="text-xl font-extrabold text-slate-950">
                                        Order Summary
                                    </h2>

                                    <PackageCheck
                                        size={22}
                                        className="text-purple-600"
                                    />

                                </div>

                            </div>

                            {/* Calculations */}

                            <div className="space-y-4 p-6">

                                <div className="flex items-center justify-between text-sm">

                                    <span className="text-slate-500">
                                        Items
                                    </span>

                                    <span className="font-bold text-slate-900">
                                        {totalItems}
                                    </span>

                                </div>

                                <div className="flex items-center justify-between text-sm">

                                    <span className="text-slate-500">
                                        Subtotal
                                    </span>

                                    <span className="font-bold text-slate-900">
                                        {formatPrice(total)} RWF
                                    </span>

                                </div>

                                <div className="flex items-center justify-between text-sm">

                                    <span className="text-slate-500">
                                        Delivery
                                    </span>

                                    <span className="font-semibold text-slate-600">
                                        Calculated at checkout
                                    </span>

                                </div>

                                <div className="border-t border-slate-100 pt-5">

                                    <div className="flex items-end justify-between gap-4">

                                        <div>

                                            <p className="text-sm font-bold text-slate-900">
                                                Total
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Including product subtotal
                                            </p>

                                        </div>

                                        <p className="text-2xl font-extrabold text-purple-700">
                                            {formatPrice(total)}{" "}
                                            <span className="text-sm">
                                                RWF
                                            </span>
                                        </p>

                                    </div>

                                </div>

                                {/* Checkout */}

                                <button
                                    type="button"
                                    onClick={handleCheckout}
                                    className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-700 px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-purple-700/10 transition duration-200 hover:bg-purple-800 hover:shadow-xl"
                                >
                                    Proceed to Checkout

                                    <ArrowRight
                                        size={18}
                                        className="transition-transform duration-200 group-hover:translate-x-1"
                                    />
                                </button>

                                <Link
                                    to="/ecommerce"
                                    className="flex w-full items-center justify-center rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                                >
                                    Continue Shopping
                                </Link>

                            </div>

                            {/* Secure message */}

                            <div className="border-t border-slate-100 bg-slate-50 p-5">

                                <div className="flex gap-3">

                                    <ShieldCheck
                                        size={19}
                                        className="mt-0.5 shrink-0 text-purple-600"
                                    />

                                    <div>

                                        <p className="text-xs font-bold text-slate-800">
                                            Safe & secure shopping
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Your order information is handled securely.
                                            Delivery and payment details will be confirmed
                                            during checkout.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </aside>

                </div>

            </div>

        </main>
    );
}