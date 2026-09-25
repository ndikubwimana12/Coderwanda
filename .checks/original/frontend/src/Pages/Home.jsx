import { Link } from "react-router-dom";

import bgImage from "../assets/bgImage.png";
import heroImage from "../assets/bgImage.png";
import homeImage from "../assets/3.jpg";
import Footer from '../Components/Footer';
import I1 from "../assets/1.png";
import I2 from "../assets/I2.png";
import I3 from "../assets/I3.png";
import I4 from "../assets/I4.png";
import I5 from "../assets/I5.png";
import I6 from "../assets/I6.png";
import c1 from "../assets/c1.png";
import c2 from "../assets/c2.png";
import c3 from "../assets/c3.png";
import c4 from "../assets/c4.png";
import c5 from "../assets/c5.png";
import I7 from "../assets/7.jpg";

import Navbar from "../Components/Navbar";
import api from "../utils/api";

import { useEffect, useState } from "react";


/* ── Fallback static data (used when API returns nothing) ── */

const DEFAULT_SERVICES = [
    { title: "Technology Development",  description: "Custom software, web & mobile apps, and digital solutions.", image: I1 },
    { title: "Training Programs",       description: "Programming, data science, cybersecurity & more.",            image: homeImage },
    { title: "Consulting Services",     description: "IT strategy, digital transformation and innovative solutions.", image: heroImage },
    { title: "Website Development",     description: "Responsive websites and e-commerce solutions.",               image: I1 },
];

const DEFAULT_PRODUCTS = [
    { id: 1, name: "HP ProBook 450 G9",     price: 950000,   image: I2 },
    { id: 2, name: 'Dell 24" Monitor',      price: 250000,   image: I3 },
    { id: 3, name: "Logitech Keyboard MK270", price: 45000,  image: I4 },
    { id: 4, name: "TP-Link Wi-Fi Router",  price: 60000,    image: I5 },
    { id: 5, name: "iPhone 13 Pro Max",     price: 1200000,  image: I6 },
];

const DEFAULT_COURSES = [
    { id: 1, slug: "web-development",      title: "Web Development with React",    level: "Beginner to Advanced", duration: "8 Weeks",  price: 120000, image: c1 },
    { id: 2, slug: "python-data-science",  title: "Python Programming Bootcamp",   level: "Beginner to Advanced", duration: "6 Weeks",  price: 100000, image: c2 },
    { id: 3, slug: "data-science",         title: "Data Science & Machine Learning",level: "Intermediate",         duration: "10 Weeks", price: 150000, image: c3 },
    { id: 4, slug: "cybersecurity",        title: "Cybersecurity Fundamentals",    level: "Beginner",             duration: "6 Weeks",  price: 190000, image: c4 },
    { id: 5, slug: "database-backend",     title: "Database Design & SQL",         level: "Beginner to Advanced", duration: "5 Weeks",  price: 80000,  image: c5 },
];

const COURSE_IMAGES = [c1, c2, c3, c4, c5];

const reasons = [
    "Experienced & Professional Team",
    "Quality & Practical Training",
    "Affordable & Scalable Solutions",
    "Modern Technology & Tools",
    "Customer-Centered Approach",
];

const formatRWF = (n) => `RWF ${new Intl.NumberFormat("en-RW").format(n)}`;

export default function Home() {

        const firstLine = "Empowering Rwanda";
        const secondLine = "Through Technology";

        const [firstText, setFirstText] = useState("");
        const [secondText, setSecondText] = useState("");
        const [isDeleting, setIsDeleting] = useState(false);

        /* ── live data state ── */
        const [services, setServices]   = useState(DEFAULT_SERVICES);
        const [products, setProducts]   = useState(DEFAULT_PRODUCTS);
        const [courses,  setCourses]    = useState(DEFAULT_COURSES);

        /* ── fetch live data ── */
        useEffect(() => {
            api.get("/services").then(r => {
                if (r.data?.length > 0) setServices(r.data.slice(0, 4));
            }).catch(() => {});

            api.get("/products").then(r => {
                if (r.data?.length > 0) setProducts(r.data.slice(0, 5));
            }).catch(() => {});

            api.get("/courses").then(r => {
                if (r.data?.length > 0) {
                    const mapped = r.data.slice(0, 5).map((c, i) => ({
                        ...c,
                        image: c.image || COURSE_IMAGES[i % COURSE_IMAGES.length],
                    }));
                    setCourses(mapped);
                }
            }).catch(() => {});
        }, []);

        useEffect(() => {
            let timer;

            // TYPING
            if (!isDeleting) {

                // Type "Empowering Rwanda"
                if (firstText.length < firstLine.length) {

                    timer = setTimeout(() => {
                        setFirstText(
                            firstLine.substring(0, firstText.length + 1)
                        );
                    }, 100);

                }

                // Type "Through Technology"
                else if (secondText.length < secondLine.length) {

                    timer = setTimeout(() => {
                        setSecondText(
                            secondLine.substring(0, secondText.length + 1)
                        );
                    }, 100);

                }

                // Both lines finished → wait
                else {

                    timer = setTimeout(() => {
                        setIsDeleting(true);
                    }, 2000);

                }

            }

            // DELETING
            else {

                // Delete second line
                if (secondText.length > 0) {

                    timer = setTimeout(() => {
                        setSecondText(
                            secondLine.substring(0, secondText.length - 1)
                        );
                    }, 50);

                }

                // Delete first line
                else if (firstText.length > 0) {

                    timer = setTimeout(() => {
                        setFirstText(
                            firstLine.substring(0, firstText.length - 1)
                        );
                    }, 50);

                }

                // Everything deleted → start again
                else {

                    timer = setTimeout(() => {
                        setIsDeleting(false);
                    }, 500);

                }
            }

            return () => clearTimeout(timer);

        }, [firstText, secondText, isDeleting]);


        
   
    return (
        <div className="min-h-screen overflow-hidden bg-white text-slate-900">
            <Navbar />
            {/* ================= HERO ================= */}
            <section
                className="relative overflow-hidden bg-[#080421] bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="absolute inset-0 bg-[#080421]/80" />

                <div className="relative mx-auto grid max-w-7xl items-center px-5 py-12 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-16">

                    {/* Hero Text */}
                    <div className="z-10 max-w-xl">


                        <h1 className="text-4xl font-extrabold leading-[1.08] text-white sm:text-2xl lg:text-[52px]">

                            <span className="block">
                                {firstText}
                            </span>

                            <span className="block text-fuchsia-400">
                                {secondText}
                                <span className="ml-1 animate-pulse text-white">
                                    |
                                </span>
                            </span>

                        </h1>

                        <p className="mt-5 max-w-lg text-sm leading-6 text-slate-200 sm:text-base">
                            We build digital solutions, empower people with technical
                            skills, and provide quality technology products and services
                            that drive growth and create opportunities.
                        </p>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                            <Link
                                to="/services"
                                className="flex items-center justify-center gap-3 rounded-md bg-purple-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-600"
                            >
                                Apply for Services
                                <span>→</span>
                            </Link>

                            <Link
                                to="/careers"
                                className="flex items-center justify-center gap-3 rounded-md border border-white px-6 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-purple-900"
                            >
                                Apply for Internship
                                <span>→</span>
                            </Link>

                        </div>

                        <div className="mt-8 flex flex-col gap-5 text-white sm:flex-row sm:gap-8">

                            <div className="flex items-start gap-3">
                                <span className="text-2xl text-fuchsia-400"><i className="fas fa-phone"></i></span>

                                <div>
                                    <p className="font-semibold">Call Us</p>
                                    <p className="text-xs text-slate-300">
                                        0781 257 942 / 0792 982 669
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="text-2xl text-fuchsia-400"><i className="fas fa-map-marker-alt"></i></span>

                                <div>
                                    <p className="font-semibold">Training Hub</p>
                                    <p className="text-xs text-slate-300">
                                        Musanze - Yawunde near JIBU
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="relative mt-10 lg:mt-0">

                        <div className="absolute -inset-5 rounded-full bg-purple-700/30 blur-3xl" />

                        <img
                            src={heroImage}
                            alt="CodeRwanda Team"
                            className="relative h-[320px] w-full rounded-2xl object-cover shadow-2xl sm:h-[400px] lg:h-[450px]"
                        />

                    </div>

                </div>
            </section>


            {/* ================= INTERNSHIP NEWS ================= */}
            <section className="relative z-10 mx-auto -mt-6 max-w-6xl px-5 sm:px-8">

                <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-xl">
                            {/* use fontawesome icon */}
                            <span><i className="fas fa-bullhorn"></i></span>
                        </div>

                        <div>
                            <p className="text-sm font-bold text-purple-700">
                                Exciting News!
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                                We are about to begin our Internship Program.
                                <br className="hidden sm:block" />
                                Our Training Hub is located at Musanze - Yawunde near JIBU.
                            </p>
                        </div>

                    </div>

                    <Link
                        to="/careers"
                        className="flex items-center justify-center gap-2 rounded-md border border-purple-400 px-5 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-700 hover:text-white"
                    >
                        Learn More
                        <span>→</span>
                    </Link>

                </div>
            </section>


            {/* ================= STATISTICS ================= */}
            <section className="mx-auto max-w-6xl px-5 pt-5 sm:px-8">

                <div className="grid overflow-hidden rounded-xl bg-[#10052d] sm:grid-cols-2 lg:grid-cols-4 text-center px-8">

                    <div className="flex justify-center items-center gap-4 border-b border-slate-700 p-2 sm:border-b-0 sm:border-r lg:border-r-0 text-center">
                        <span className="text-3xl text-fuchsia-300">
                            <span className="text-3xl text-fuchsia-300"><i className="fas fa-trophy"></i></span>
                        </span>

                        <div>
                            <h3 className="text-2xl font-bold text-white">
                                {10}+
                            </h3>

                            <p className="text-xs text-slate-300">
                                Projects Completed
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center items-center gap-4 border-b border-slate-700 p-2 sm:border-b-0 sm:border-r lg:border-r-0">
                        <span className="text-3xl text-fuchsia-300">
                            <span className="text-3xl text-fuchsia-300"><i className="fas fa-users"></i></span>
                        </span>

                        <div>
                            <h3 className="text-2xl font-bold text-white">
                                {100}+
                            </h3>

                            <p className="text-xs text-slate-300">
                                Happy Clients
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center items-center gap-4 border-b border-slate-700 p-2 sm:border-b-0 sm:border-r lg:border-r-0">
                        <span className="text-3xl text-fuchsia-300">
                            <span className="text-3xl text-fuchsia-300"><i className="fas fa-clock"></i></span>
                        </span>

                        <div>
                            <h3 className="text-2xl font-bold text-white">
                                {2}+
                            </h3>

                            <p className="text-xs text-slate-300">
                                Years of Experience
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center items-center gap-4 border-b border-slate-700 p-2 sm:border-b-0 sm:border-r lg:border-r-0">
                        <span className="text-3xl text-fuchsia-300">
                            <span className="text-3xl text-fuchsia-300"><i className="fas fa-users"></i></span>
                        </span>

                        <div>
                            <h3 className="text-2xl font-bold text-white">
                                {500}+
                            </h3>

                            <p className="text-xs text-slate-300">
                                trained Students
                            </p>
                        </div>
                    </div>

                </div>





            </section>


            {/* ================= SERVICES ================= */}
            <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">

                <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-purple-700">
                            What We Do
                        </p>

                        <h2 className="text-2xl font-bold sm:text-3xl">
                            Our Services
                        </h2>
                    </div>

                    <Link
                        to="/services"
                        className="flex w-fit items-center gap-2 rounded-md border border-purple-400 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-700 hover:text-white"
                    >
                        View All Services
                        <span>→</span>
                    </Link>

                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {services.map((service, i) => (
                        <div
                            key={service.id || service.title}
                            className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >

                            <div className="h-36 overflow-hidden">

                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    onError={e => { e.target.src = I1; }}
                                />

                            </div>

                            <div className="p-4">

                                <h3 className="min-h-[42px] text-sm font-bold leading-5">
                                    {service.title}
                                </h3>

                                <p className="mt-2 min-h-[54px] text-xs leading-5 text-slate-500">
                                    {service.short_description || service.description}
                                </p>

                                <Link
                                    to="/services"
                                    className="mt-4 flex items-center gap-2 text-xs font-bold text-purple-700"
                                >
                                    Learn More
                                    <span>→</span>
                                </Link>

                            </div>
                        </div>
                    ))}

                </div>
            </section>


            {/* ================= PRODUCTS ================= */}
            <section className="bg-slate-50">

                <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">

                    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                        <div>
                            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-purple-700">
                                Technology Products
                            </p>

                            <h2 className="text-2xl font-bold sm:text-3xl">
                                Shop Quality Electronics
                            </h2>
                        </div>

                        <Link
                            to="/e-commerce"
                            className="flex w-fit items-center gap-2 rounded-md border border-purple-400 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-700 hover:text-white"
                        >
                            Visit Store
                            <span>→</span>
                        </Link>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">

                        {products.map((product) => (
                            <div
                                key={product.id || product.name}
                                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                            >

                                <div className="flex h-40 items-center justify-center overflow-hidden bg-white p-3">

                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                                        onError={e => { e.target.src = I2; }}
                                    />

                                </div>

                                <div className="p-4">

                                    <h3 className="min-h-[40px] text-xs font-bold leading-5">
                                        {product.name}
                                    </h3>

                                    <div className="mt-3 flex items-center justify-between">

                                        <p className="text-sm font-bold text-purple-700">
                                            {typeof product.price === "number"
                                                ? formatRWF(product.price)
                                                : product.price}
                                        </p>

                                        <button
                                            className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-700 text-white transition hover:bg-purple-600"
                                        >
                                            <i className="fas fa-shopping-cart"></i>
                                        </button>

                                    </div>

                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </section>


            {/* ================= COURSES ================= */}
            <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">

                <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-purple-700">
                            Popular Courses
                        </p>

                        <h2 className="text-2xl font-bold sm:text-3xl">
                            Explore Our Courses
                        </h2>
                    </div>

                    <Link
                        to="/training/courses"
                        className="flex w-fit items-center gap-2 rounded-md border border-purple-400 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-700 hover:text-white"
                    >
                        View All Courses
                        <span>→</span>
                    </Link>

                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">

                    {courses.map((course, i) => (
                        <div
                            key={course.id || course.title}
                            className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >

                            <div className="h-36 overflow-hidden">

                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    onError={e => { e.target.src = [c1,c2,c3,c4,c5][i % 5]; }}
                                />

                            </div>

                            <div className="p-4">

                                <h3 className="min-h-[42px] text-sm font-bold leading-5">
                                    {course.title}
                                </h3>

                                <p className="mt-2 text-xs text-slate-500">
                                    {course.level}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    <i className="fas fa-clock"></i> {course.duration}
                                </p>

                                <p className="mt-4 text-sm font-bold text-purple-700">
                                    {typeof course.price === "number"
                                        ? formatRWF(course.price)
                                        : course.price}
                                </p>

                            </div>
                        </div>
                    ))}

                </div>
            </section>


            {/* ================= WHY CHOOSE + TESTIMONIAL ================= */}
            <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8">

                <div className="grid overflow-hidden rounded-xl bg-slate-50 lg:grid-cols-3">

                    {/* WHY CHOOSE */}
                    <div className="p-7">

                        <h2 className="text-xl font-bold">
                            Why Choose CodeRwanda?
                        </h2>

                        <ul className="mt-5 space-y-4">

                            {reasons.map((reason) => (
                                <li
                                    key={reason}
                                    className="flex items-start gap-3 text-sm text-slate-700"
                                >
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-700 text-xs text-white">
                                        ✓
                                    </span>

                                    {reason}
                                </li>
                            ))}

                        </ul>

                        <Link
                            to="/about"
                            className="mt-6 inline-flex items-center gap-2 rounded-md bg-purple-700 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-purple-600"
                        >
                            More About Us
                            <span>→</span>
                        </Link>

                    </div>


                    {/* TESTIMONIAL */}
                    <div className="border-t border-slate-200 p-7 lg:border-l lg:border-t-0">

                        <h2 className="text-xl font-bold">
                            What Our Clients Say
                        </h2>

                        <div className="mt-5">

                            <div className="text-5xl leading-none text-purple-700">
                                “
                            </div>

                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                CodeRwanda transformed our business operations with their
                                innovative software solutions. Highly recommend!
                            </p>

                            <div className="mt-4 tracking-widest text-yellow-400">
                                ★★★★★
                            </div>

                            <div className="mt-4 flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-700 text-sm font-bold text-white">
                                    ID
                                </div>

                                <div>
                                    <p className="text-sm font-bold">
                                        IRADUKUNDA Deo
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        CEO, VisionX Rwanda
                                    </p>
                                </div>

                            </div>

                        </div>
                    </div>


                    {/* IMAGE */}
                    <div className="min-h-[300px]">

                        <img
                            src={I7}
                            alt="CodeRwanda Training"
                            className="h-full min-h-[300px] w-full object-cover"
                        />

                    </div>

                </div>
            </section>


            {/* ================= CTA ================= */}
            <section className="mx-auto max-w-6xl px-5 pb-6 sm:px-8">

                <div className="relative overflow-hidden rounded-xl bg-purple-800 px-6 py-6 sm:px-10">

                    <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <h2 className="text-xl font-bold text-white sm:text-2xl">
                                Ready to start your project with us?
                            </h2>

                            <p className="mt-1 text-sm text-purple-100">
                                Let's build something amazing together.
                            </p>
                        </div>

                        <Link
                            to="/contact"
                            className="flex items-center justify-center gap-2 rounded-md bg-white px-7 py-3 text-sm font-bold text-purple-800 transition hover:bg-purple-50"
                        >
                            Get in Touch
                            <span>→</span>
                        </Link>

                    </div>

                </div>
            </section>
            <Footer />
        </div>
    );
}