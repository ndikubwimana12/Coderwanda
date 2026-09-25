import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

import { Link, useNavigate } from "react-router-dom";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import bgImage from "../assets/bgImage.png";

/* =========================================================
   CATEGORIES
========================================================= */

const categories = [
    {
        name: "Laptops",
        count: 24,
        icon: "fa-solid fa-laptop",
        image:
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85",
    },
    {
        name: "Smartphones",
        count: 38,
        icon: "fa-solid fa-mobile-screen-button",
        image:
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85",
    },
    {
        name: "Accessories",
        count: 56,
        icon: "fa-solid fa-headphones",
        image:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
    },
    {
        name: "Smart Devices",
        count: 18,
        icon: "fa-solid fa-house",
        image:
            "https://images.unsplash.com/photo-1558008258-3256797b43f3?auto=format&fit=crop&w=900&q=85",
    },
    {
        name: "Cameras",
        count: 22,
        icon: "fa-solid fa-camera",
        image:
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85",
    },
    {
        name: "Networking",
        count: 15,
        icon: "fa-solid fa-wifi",
        image:
            "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?auto=format&fit=crop&w=900&q=85",
    },
];


/* =========================================================
   PRODUCTS
========================================================= */

const products = [
    {
        id: 1,
        name: "MacBook Air M2",
        brand: "Apple",
        category: "Laptops",
        price: 1950000,
        oldPrice: null,
        badge: "New",
        rating: 5,
        reviews: 24,
        image:
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=85",
    },
    {
        id: 2,
        name: "iPhone 15 Pro",
        brand: "Apple",
        category: "Smartphones",
        price: 1450000,
        oldPrice: 1580000,
        badge: "-10%",
        rating: 5,
        reviews: 31,
        image:
            "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=85",
    },
    {
        id: 3,
        name: "Sony WH-1000XM5",
        brand: "Sony",
        category: "Accessories",
        price: 485000,
        oldPrice: 540000,
        badge: "Sale",
        rating: 5,
        reviews: 18,
        image:
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=85",
    },
    {
        id: 4,
        name: "Canon EOS Camera",
        brand: "Canon",
        category: "Cameras",
        price: 1250000,
        oldPrice: 1390000,
        badge: "New",
        rating: 5,
        reviews: 16,
        image:
            "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1000&q=85",
    },
    {
        id: 5,
        name: "Dell XPS 15",
        brand: "Dell",
        category: "Laptops",
        price: 1750000,
        oldPrice: 1890000,
        badge: "-8%",
        rating: 5,
        reviews: 12,
        image:
            "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=85",
    },
    {
        id: 6,
        name: "Samsung Galaxy S24",
        brand: "Samsung",
        category: "Smartphones",
        price: 1100000,
        oldPrice: 1220000,
        badge: "Sale",
        rating: 5,
        reviews: 21,
        image:
            "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1000&q=85",
    },
    {
        id: 7,
        name: "Wireless Keyboard",
        brand: "Logitech",
        category: "Accessories",
        price: 85000,
        oldPrice: 99000,
        badge: "New",
        rating: 5,
        reviews: 15,
        image:
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=85",
    },
    {
        id: 8,
        name: "Security Camera",
        brand: "Hikvision",
        category: "Cameras",
        price: 195000,
        oldPrice: 225000,
        badge: "-15%",
        rating: 4,
        reviews: 10,
        image:
            "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1000&q=85",
    },
    {
        id: 9,
        name: "Apple Watch Series 9",
        brand: "Apple",
        category: "Smart Devices",
        price: 765000,
        oldPrice: null,
        badge: "New",
        rating: 5,
        reviews: 14,
        image:
            "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=1000&q=85",
    },
    {
        id: 10,
        name: 'LG 27" 4K Monitor',
        brand: "LG",
        category: "Accessories",
        price: 495000,
        oldPrice: 550000,
        badge: "Sale",
        rating: 5,
        reviews: 9,
        image:
            "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=85",
    },
    {
        id: 11,
        name: "Lenovo ThinkPad",
        brand: "Lenovo",
        category: "Laptops",
        price: 1250000,
        oldPrice: 1390000,
        badge: "New",
        rating: 5,
        reviews: 17,
        image:
            "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=85",
    },
    {
        id: 12,
        name: "AirPods Pro",
        brand: "Apple",
        category: "Accessories",
        price: 295000,
        oldPrice: 325000,
        badge: "-8%",
        rating: 5,
        reviews: 29,
        image:
            "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1000&q=85",
    },
];


/* =========================================================
   HELPERS
========================================================= */

const formatRWF = (amount) =>
    `${new Intl.NumberFormat("en-RW").format(amount)} RWF`;


const getStoredCart = () => {
    try {
        const stored = localStorage.getItem("coderwanda_cart");

        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);

        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};


/* =========================================================
   E-COMMERCE
========================================================= */

export default function Ecommerce() {

    const navigate = useNavigate();

    const [productList, setProductList] = useState(products);

    const [cart, setCart] = useState(getStoredCart);

    const [favorites, setFavorites] = useState([]);

    const [activeCategory, setActiveCategory] =
        useState("All");

    const [activeTab, setActiveTab] =
        useState("All Products");

    const [search, setSearch] =
        useState("");

    const [sort, setSort] =
        useState("newest");

    const [visibleProducts, setVisibleProducts] =
        useState(10);

    const [toast, setToast] =
        useState(null);

    /* =====================================================
       FETCH PRODUCTS FROM API
    ===================================================== */

    useEffect(() => {
        api.get("/products")
            .then((r) => {
                if (r.data && r.data.length > 0) {
                    setProductList(r.data);
                }
            })
            .catch(() => {
                // silently fall back to static products
            });
    }, []);



    /* =====================================================
       TOAST
    ===================================================== */

    const showToast = (
        message,
        type = "success"
    ) => {

        setToast({
            message,
            type,
        });

        window.setTimeout(() => {
            setToast(null);
        }, 2800);
    };


    /* =====================================================
       SAVE CART
    ===================================================== */

    const saveCart = (updatedCart) => {

        setCart(updatedCart);

        localStorage.setItem(
            "coderwanda_cart",
            JSON.stringify(updatedCart)
        );

        /*
          IMPORTANT:
          Navbar listens for this event.
        */

        window.dispatchEvent(
            new Event("cartUpdated")
        );
    };


    /* =====================================================
       ADD TO CART
    ===================================================== */

    const handleAddToCart = (product) => {

        /*
          Customer must login before shopping.
        */

        const user =
            localStorage.getItem("coderwanda_user");

        if (!user) {

            /*
              Remember product.
              Login page can process this after
              successful authentication.
            */

            localStorage.setItem(
                "pending_cart_product",
                JSON.stringify(product)
            );

            showToast(
                "Please login to add this product to your cart.",
                "login"
            );

            window.setTimeout(() => {
                navigate("/login", {
                    state: {
                        from: "/ecommerce",
                        productId: product.id,
                    },
                });
            }, 500);

            return;
        }


        const currentCart =
            getStoredCart();


        const existingProduct =
            currentCart.find(
                (item) =>
                    item.id === product.id
            );


        let updatedCart;


        if (existingProduct) {

            updatedCart =
                currentCart.map(
                    (item) =>
                        item.id === product.id
                            ? {
                                ...item,
                                quantity:
                                    Number(
                                        item.quantity || 1
                                    ) + 1,
                            }
                            : item
                );

            showToast(
                `${product.name} quantity increased.`
            );

        } else {

            updatedCart = [
                ...currentCart,
                {
                    ...product,
                    quantity: 1,
                },
            ];

            showToast(
                `${product.name} added to your cart.`
            );
        }


        saveCart(updatedCart);
    };


    /* =====================================================
       FAVORITES
    ===================================================== */

    const toggleFavorite = (id) => {

        setFavorites((current) =>
            current.includes(id)
                ? current.filter(
                    (item) => item !== id
                )
                : [...current, id]
        );
    };


    /* =====================================================
       FILTER PRODUCTS
    ===================================================== */

    const filteredProducts = useMemo(() => {

        let result = [...productList];


        /* CATEGORY */

        if (activeCategory !== "All") {

            result =
                result.filter(
                    (product) =>
                        product.category ===
                        activeCategory
                );
        }


        /* SEARCH */

        const query =
            search.trim().toLowerCase();

        if (query) {

            result =
                result.filter((product) => {

                    return (
                        product.name
                            .toLowerCase()
                            .includes(query) ||

                        product.brand
                            .toLowerCase()
                            .includes(query) ||

                        product.category
                            .toLowerCase()
                            .includes(query)
                    );
                });
        }


        /* TABS */

        if (activeTab === "New Arrivals") {

            result =
                result.filter(
                    (product) =>
                        product.badge === "New"
                );
        }


        if (activeTab === "Best Sellers") {
            result = [...result].sort((a, b) => b.reviews - a.reviews);
        }

        if (activeTab === "Special Offers") {
            result = result.filter((product) => product.oldPrice);
        }

        if (activeTab === "Featured") {
            result = result.filter((product) => product.rating >= 5);
        }


        /* SORT */

        if (sort === "price-low") {
            result = [...result].sort((a, b) => a.price - b.price);
        }

        if (sort === "price-high") {
            result = [...result].sort((a, b) => b.price - a.price);
        }

        if (sort === "rating") {
            result = [...result].sort((a, b) => b.rating - a.rating);
        }


        return result;

    }, [
        productList,
        activeCategory,
        activeTab,
        search,
        sort,
    ]);


    const displayedProducts =
        filteredProducts.slice(
            0,
            visibleProducts
        );


    /* =====================================================
       RESET
    ===================================================== */

    const resetFilters = () => {

        setActiveCategory("All");

        setActiveTab("All Products");

        setSearch("");

        setSort("newest");

        setVisibleProducts(10);
    };


    /* =====================================================
       CATEGORY
    ===================================================== */

    const handleCategory = (category) => {

        setActiveCategory(category);

        setActiveTab("All Products");

        setVisibleProducts(10);

        window.setTimeout(() => {

            document
                .getElementById("products")
                ?.scrollIntoView({
                    behavior: "smooth",
                });

        }, 50);
    };


    /* =====================================================
       SHOP NOW
    ===================================================== */

    const scrollToProducts = () => {

        document
            .getElementById("products")
            ?.scrollIntoView({
                behavior: "smooth",
            });
    };


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <main className="min-h-screen bg-white text-slate-900">

            <Navbar />


            {/* =================================================
                TOAST
            ================================================= */}

            {toast && (

                <div
                    className="
                        fixed
                        right-4
                        top-24
                        z-[100]
                        w-[calc(100%-2rem)]
                        max-w-sm
                    "
                >

                    <div
                        className="
                            flex
                            items-start
                            gap-3
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            p-4
                            shadow-2xl
                        "
                    >

                        <div
                            className={`
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                ${toast.type === "login"
                                    ? "bg-amber-100 text-amber-600"
                                    : "bg-purple-100 text-purple-700"
                                }
                            `}
                        >

                            <i
                                className={
                                    toast.type === "login"
                                        ? "fa-solid fa-lock"
                                        : "fa-solid fa-check"
                                }
                            />

                        </div>


                        <div className="flex-1">

                            <p className="text-sm font-bold text-slate-900">

                                {toast.type === "login"
                                    ? "Login required"
                                    : "Cart updated"}

                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                {toast.message}
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                setToast(null)
                            }
                            className="
                                text-slate-400
                                transition
                                hover:text-slate-800
                            "
                        >
                            <i className="fa-solid fa-xmark" />
                        </button>

                    </div>

                </div>
            )}


            {/* =================================================
                HERO
            ================================================= */}

            <section
                className="relative overflow-hidden"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-slate-950/50" />

                {/* Purple glow */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/4 top-0 h-[350px] w-[600px] rounded-full bg-purple-700/25 blur-[120px]" />
                </div>

                <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
                    <div className="grid items-center gap-10 py-6 sm:py-20 lg:grid-cols-2">

                        {/* LEFT — content */}
                        <div>
                            {/* Eyebrow */}
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 backdrop-blur">
                                <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                                <span className="text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-500">
                                    CodeRwanda Tech Store
                                </span>
                            </div>

                            {/* Heading */}
                            <h1 className="text-4xl font-black  text-white sm:text-4xl lg:text-5xl">
                                Premium Tech Delivered,
                                <span className="mt-1 block text-fuchsia-500">across Rwanda.</span>
                            </h1>

                            {/* Description */}
                            <p className="mt-6 max-w-md text-sm leading-7 text-white/55 sm:text-base">
                                Laptops, smartphones, accessories & smart devices —
                                genuine products at competitive prices.
                            </p>

                            {/* Buttons */}
                            <div className="mt-8 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={scrollToProducts}
                                    className="group inline-flex items-center gap-2 rounded-xl bg-purple-600 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-purple-900/40 transition duration-300 hover:-translate-y-0.5 hover:bg-purple-500"
                                >
                                    Shop Now
                                    <i className="fa-solid fa-arrow-right text-xs transition duration-300 group-hover:translate-x-1" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        document
                                            .getElementById("categories")
                                            ?.scrollIntoView({ behavior: "smooth" })
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.10]"
                                >
                                    Browse Categories
                                </button>
                            </div>
                        </div>

                        {/* RIGHT — featured product card */}
                        <div className="hidden lg:flex lg:justify-end">
                            <div className="relative w-[540px]">
                                {/* Glow behind card */}
                                <div className="absolute inset-0 rounded-3xl bg-purple-600/20 blur-2xl" />

                                {/* Card */}
                                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-3 shadow-2xl backdrop-blur">
                                    <div className="overflow-hidden rounded-2xl">
                                        <img
                                            src={products[10].image}
                                            alt={products[10].name}
                                            className="h-74 w-full object-cover"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-3 px-2 pb-2 pt-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                                                Featured
                                            </p>
                                            <p className="mt-0.5 text-base font-extrabold text-white">
                                                {products[10].name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-extrabold text-white">
                                                {formatRWF(products[10].price)}
                                            </p>
                                            <div className="mt-1 flex justify-end gap-0.5 text-[10px] text-amber-400">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <i key={i} className="fa-solid fa-star" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating mini card — second product */}
                                <div className="absolute -bottom-4 -left-10 w-36 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.08] p-2 shadow-xl backdrop-blur">
                                    <img
                                        src={products[5].image}
                                        alt={products[5].name}
                                        className="h-24 w-full rounded-xl object-cover"
                                    />
                                    <div className="px-1 pt-2">
                                        <p className="truncate text-[10px] font-bold text-white">{products[5].name}</p>
                                        <p className="mt-0.5 text-[10px] text-white/40">{formatRWF(products[5].price)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* =================================================
                CATEGORIES
            ================================================= */}

            <section
                id="categories"
                className="
                    mx-auto
                    max-w-7xl
                    px-5
                    py-4
                    sm:px-8
                    lg:px-10
                    lg:py-6
                "
            >

                <SectionHeading
                    eyebrow="Explore"
                    title="Shop by Category"
                    action="View all"
                    onAction={resetFilters}
                />


                <div
                    className="
                        mt-7
                        grid
                        grid-cols-2
                        gap-3
                        sm:grid-cols-3
                        lg:grid-cols-6
                    "
                >

                    {categories.map((category) => (

                        <button
                            key={category.name}
                            type="button"
                            onClick={() =>
                                handleCategory(
                                    category.name
                                )
                            }
                            className={`
                                group
                                overflow-hidden
                                rounded-2xl
                                border
                                bg-white
                                text-left
                                transition
                                duration-300
                                hover:-translate-y-1
                                hover:shadow-xl
                                hover:shadow-purple-100
                                ${activeCategory ===
                                    category.name
                                    ? "border-purple-500 ring-2 ring-purple-100"
                                    : "border-slate-200"
                                }
                            `}
                        >

                            <div className="h-28 overflow-hidden bg-slate-50 sm:h-36">

                                <img
                                    src={category.image}
                                    alt={category.name}
                                    loading="lazy"
                                    className="
                                        h-full
                                        w-full
                                        object-cover
                                        transition
                                        duration-500
                                        group-hover:scale-110
                                    "
                                />

                            </div>


                            <div className="p-3 sm:p-4">

                                <div className="flex items-center gap-2">

                                    <i
                                        className={`${category.icon} text-sm text-purple-700`}
                                    />

                                    <span className="truncate text-sm font-bold text-slate-900">
                                        {category.name}
                                    </span>

                                </div>


                                <p className="mt-1 text-xs text-slate-500">
                                    {category.count} items
                                </p>

                            </div>

                        </button>

                    ))}

                </div>

            </section>


            {/* =================================================
                PRODUCTS
            ================================================= */}

            <section
                id="products"
                className="
                    border-y
                    border-slate-100
                    bg-[#fcfbff]
                    py-4
                    sm:py-6
                "
            >

                <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

                    <SectionHeading
                        eyebrow="Our Collection"
                        title="Popular Products"
                        action="View all products"
                        onAction={resetFilters}
                    />


                    {/* =================================================
                        CONTROLS
                    ================================================= */}

                    <div className="mt-7">

                        <div
                            className="
                                flex
                                flex-col
                                gap-4
                                xl:flex-row
                                xl:items-center
                                xl:justify-between
                            "
                        >

                            {/* Tabs */}

                            <div
                                className="
                                    flex
                                    overflow-x-auto
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    p-1
                                "
                            >

                                {[
                                    "All Products",
                                    "Featured",
                                    "New Arrivals",
                                    "Best Sellers",
                                    "Special Offers",
                                ].map((tab) => (

                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => {

                                            setActiveTab(tab);

                                            setVisibleProducts(10);
                                        }}
                                        className={`
                                            whitespace-nowrap
                                            rounded-lg
                                            px-4
                                            py-2.5
                                            text-xs
                                            font-bold
                                            transition
                                            ${activeTab === tab
                                                ? "bg-purple-700 text-white"
                                                : "text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                                            }
                                        `}
                                    >
                                        {tab}
                                    </button>

                                ))}

                            </div>


                            {/* Search + sort */}

                            <div className="flex flex-col gap-2 sm:flex-row">

                                <div className="relative">

                                    <i
                                        className="
                                            fa-solid
                                            fa-magnifying-glass
                                            absolute
                                            left-4
                                            top-1/2
                                            -translate-y-1/2
                                            text-sm
                                            text-slate-400
                                        "
                                    />

                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(e) => {

                                            setSearch(
                                                e.target.value
                                            );

                                            setVisibleProducts(10);
                                        }}
                                        placeholder="Search products..."
                                        className="
                                            h-11
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            pl-11
                                            pr-4
                                            text-sm
                                            outline-none
                                            transition
                                            focus:border-purple-500
                                            focus:ring-4
                                            focus:ring-purple-100
                                            sm:w-[280px]
                                        "
                                    />

                                </div>


                                <select
                                    value={sort}
                                    onChange={(e) =>
                                        setSort(e.target.value)
                                    }
                                    className="
                                        h-11
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        px-4
                                        text-sm
                                        font-medium
                                        outline-none
                                        focus:border-purple-500
                                        focus:ring-4
                                        focus:ring-purple-100
                                    "
                                >

                                    <option value="newest">
                                        Sort by: Newest
                                    </option>

                                    <option value="price-low">
                                        Price: Low to High
                                    </option>

                                    <option value="price-high">
                                        Price: High to Low
                                    </option>

                                    <option value="rating">
                                        Highest Rated
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* Filter information */}

                        {(search ||
                            activeCategory !== "All") && (

                                <div
                                    className="
                                    mt-4
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                    rounded-xl
                                    border
                                    border-purple-100
                                    bg-purple-50
                                    px-4
                                    py-3
                                "
                                >

                                    <p className="text-xs text-purple-800">

                                        {filteredProducts.length}

                                        {" "}

                                        product
                                        {filteredProducts.length !== 1
                                            ? "s"
                                            : ""}

                                        {" "}found

                                        {search && (
                                            <>
                                                {" "}for{" "}
                                                <strong>
                                                    "{search}"
                                                </strong>
                                            </>
                                        )}

                                    </p>


                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="
                                        shrink-0
                                        text-xs
                                        font-bold
                                        text-purple-700
                                        hover:text-purple-900
                                    "
                                    >
                                        Clear filters
                                    </button>

                                </div>

                            )}

                    </div>


                    {/* =================================================
                        PRODUCT GRID
                    ================================================= */}

                    {displayedProducts.length > 0 ? (

                        <div
                            className="
                                mt-7
                                grid
                                grid-cols-2
                                gap-3
                                sm:grid-cols-3
                                md:gap-5
                                lg:grid-cols-4
                                xl:grid-cols-5
                            "
                        >

                            {displayedProducts.map((product) => (

                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    favorite={favorites.includes(
                                        product.id
                                    )}
                                    onFavorite={() =>
                                        toggleFavorite(
                                            product.id
                                        )
                                    }
                                    onAddToCart={() =>
                                        handleAddToCart(
                                            product
                                        )
                                    }
                                />

                            ))}

                        </div>

                    ) : (

                        <EmptyState
                            reset={resetFilters}
                        />

                    )}


                    {/* =================================================
                        LOAD MORE
                    ================================================= */}

                    {visibleProducts <
                        filteredProducts.length && (

                            <div className="mt-10 flex justify-center">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setVisibleProducts(
                                            (current) =>
                                                current + 5
                                        )
                                    }
                                    className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-purple-700
                                    px-7
                                    py-3.5
                                    text-sm
                                    font-bold
                                    text-white
                                    shadow-lg
                                    shadow-purple-100
                                    transition
                                    hover:-translate-y-0.5
                                    hover:bg-purple-800
                                "
                                >

                                    Load More Products

                                    <i className="fa-solid fa-arrow-down text-xs" />

                                </button>

                            </div>

                        )}

                </div>

            </section>


            {/* =================================================
                TRUST
            ================================================= */}

            <section
                className="
                    mx-auto
                    max-w-7xl
                    px-5
                    py-12
                    sm:px-8
                    lg:px-10
                    lg:py-16
                "
            >

                <div
                    className="
                        grid
                        overflow-hidden
                        rounded-2xl
                        border
                        border-purple-100
                        bg-[#faf8ff]
                        sm:grid-cols-2
                        lg:grid-cols-4
                    "
                >

                    <TrustItem
                        icon="fa-solid fa-circle-check"
                        title="100% Authentic"
                        text="Genuine products only"
                    />

                    <TrustItem
                        icon="fa-solid fa-arrow-rotate-left"
                        title="Easy Returns"
                        text="Simple return process"
                    />

                    <TrustItem
                        icon="fa-solid fa-shield-halved"
                        title="Warranty Protection"
                        text="Manufacturer warranty"
                    />

                    <TrustItem
                        icon="fa-solid fa-tags"
                        title="Best Prices"
                        text="Competitive pricing"
                    />

                </div>

            </section>


            <Footer />

        </main>
    );
}


/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
    product,
    favorite,
    onFavorite,
    onAddToCart,
}) {

    return (

        <article
            className="
                group
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                transition
                duration-300
                hover:-translate-y-1
                hover:border-purple-200
                hover:shadow-[0_15px_40px_rgba(91,33,182,0.10)]
            "
        >

            {/* IMAGE */}

            <Link
                to={`/ecommerce/product/${product.id}`}
                className="
                    relative
                    block
                    overflow-hidden
                    bg-[#fafafa]
                "
            >

                <div className="relative aspect-square">

                    <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="
                            h-full
                            w-full
                            object-cover
                            transition
                            duration-500
                            group-hover:scale-105
                        "
                    />

                </div>


                {/* BADGE */}

                {product.badge && (

                    <span
                        className={`
                            absolute
                            left-3
                            top-3
                            rounded-md
                            px-2
                            py-1
                            text-[10px]
                            font-extrabold
                            uppercase
                            ${product.badge === "Sale"
                                ? "bg-orange-500 text-white"
                                : product.badge === "New"
                                    ? "bg-purple-700 text-white"
                                    : "bg-purple-100 text-purple-700"
                            }
                        `}
                    >
                        {product.badge}
                    </span>

                )}


                {/* FAVORITE */}

                <button
                    type="button"
                    aria-label={
                        favorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                    }
                    onClick={(e) => {

                        e.preventDefault();
                        e.stopPropagation();

                        onFavorite();
                    }}
                    className={`
                        absolute
                        right-3
                        top-3
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        bg-white
                        text-sm
                        shadow-sm
                        transition
                        hover:text-purple-700
                        ${favorite
                            ? "text-purple-700"
                            : "text-slate-500"
                        }
                    `}
                >

                    <i
                        className={
                            favorite
                                ? "fa-solid fa-heart"
                                : "fa-regular fa-heart"
                        }
                    />

                </button>

            </Link>


            {/* DETAILS */}

            <div className="p-3 sm:p-4">

                <p
                    className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-purple-600
                        sm:text-xs
                    "
                >
                    {product.brand}
                </p>


                <Link
                    to={`/ecommerce/product/${product.id}`}
                    className="
                        mt-1
                        block
                        truncate
                        text-sm
                        font-bold
                        text-slate-900
                        transition
                        hover:text-purple-700
                        sm:text-[15px]
                    "
                >
                    {product.name}
                </Link>


                {/* RATING */}

                <div className="mt-2 flex items-center gap-1.5">

                    <div
                        className="
                            flex
                            text-[10px]
                            text-amber-400
                        "
                    >

                        {Array.from({
                            length: 5,
                        }).map((_, index) => (

                            <i
                                key={index}
                                className={
                                    index < product.rating
                                        ? "fa-solid fa-star"
                                        : "fa-regular fa-star"
                                }
                            />

                        ))}

                    </div>


                    <span className="text-[10px] text-slate-400">
                        ({product.reviews})
                    </span>

                </div>


                {/* PRICE */}

                <div className="mt-3">

                    <p
                        className="
                            text-sm
                            font-extrabold
                            text-slate-950
                            sm:text-base
                        "
                    >
                        {formatRWF(product.price)}
                    </p>


                    {product.oldPrice && (

                        <p
                            className="
                                mt-0.5
                                text-[10px]
                                text-slate-400
                                line-through
                                sm:text-xs
                            "
                        >
                            {formatRWF(product.oldPrice)}
                        </p>

                    )}

                </div>


                {/* ADD TO CART */}

                <button
                    type="button"
                    onClick={onAddToCart}
                    className="
                        mt-3
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        bg-purple-700
                        py-2.5
                        text-[11px]
                        font-bold
                        text-white
                        transition
                        duration-300
                        hover:bg-purple-800
                        hover:shadow-lg
                        hover:shadow-purple-200
                        active:scale-[0.98]
                        sm:text-xs
                    "
                >

                    <i className="fa-solid fa-cart-shopping" />

                    Add to Cart

                </button>

            </div>

        </article>
    );
}


/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
    eyebrow,
    title,
    action,
    onAction,
}) {

    return (

        <div
            className="
                flex
                items-end
                justify-between
                gap-5
            "
        >

            <div>

                <p
                    className="
                        mb-1
                        text-xs
                        font-extrabold
                        uppercase
                        tracking-[0.15em]
                        text-purple-700
                    "
                >
                    {eyebrow}
                </p>


                <h2
                    className="
                        text-2xl
                        font-black
                        tracking-tight
                        text-[#11152c]
                        sm:text-3xl
                    "
                >
                    {title}
                </h2>

            </div>


            <button
                type="button"
                onClick={onAction}
                className="
                    hidden
                    items-center
                    gap-2
                    text-xs
                    font-bold
                    text-purple-700
                    transition
                    hover:text-purple-900
                    sm:flex
                "
            >

                {action}

                <span
                    className="
                        flex
                        h-6
                        w-6
                        items-center
                        justify-center
                        rounded-full
                        bg-purple-100
                    "
                >
                    <i className="fa-solid fa-arrow-right text-[9px]" />
                </span>

            </button>

        </div>

    );
}


/* =========================================================
   BENEFIT
========================================================= */

function Benefit({
    icon,
    title,
    text,
}) {

    return (

        <div
            className="
                flex
                items-center
                gap-4
                px-5
                py-5
                sm:px-7
                md:py-6
            "
        >

            <div
                className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-purple-100
                    text-purple-700
                "
            >
                <i className={icon} />
            </div>


            <div>

                <p className="text-sm font-extrabold text-slate-900">
                    {title}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                    {text}
                </p>

            </div>

        </div>

    );
}


/* =========================================================
   TRUST ITEM
========================================================= */

function TrustItem({
    icon,
    title,
    text,
}) {

    return (

        <div
            className="
                flex
                items-center
                gap-4
                border-b
                border-purple-100
                px-6
                py-6
                sm:border-r
                sm:border-b-0
                lg:px-7
            "
        >

            <div
                className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-purple-700
                    text-white
                "
            >
                <i className={icon} />
            </div>


            <div>

                <p className="text-sm font-extrabold text-slate-900">
                    {title}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                    {text}
                </p>

            </div>

        </div>

    );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
    reset,
}) {

    return (

        <div
            className="
                mt-8
                rounded-2xl
                border
                border-dashed
                border-slate-300
                bg-white
                px-6
                py-20
                text-center
            "
        >

            <div
                className="
                    mx-auto
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-full
                    bg-purple-100
                    text-purple-700
                "
            >
                <i className="fa-solid fa-magnifying-glass text-xl" />
            </div>


            <h3
                className="
                    mt-5
                    text-lg
                    font-extrabold
                    text-slate-900
                "
            >
                No products found
            </h3>


            <p
                className="
                    mx-auto
                    mt-2
                    max-w-md
                    text-sm
                    text-slate-500
                "
            >
                We couldn't find products matching
                your search or selected category.
            </p>


            <button
                type="button"
                onClick={reset}
                className="
                    mt-6
                    rounded-lg
                    bg-purple-700
                    px-5
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-purple-800
                "
            >
                Clear Filters
            </button>

        </div>

    );
}