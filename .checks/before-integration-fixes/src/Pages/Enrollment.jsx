import useRemote from '../Utils/useRemote';
import DataState from '../Components/DataState';
import { useMemo, useState } from "react";
import api from "../Utils/api";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Clock3,
    MapPin,
    Send,
    User,
    Mail,
    Phone,
    BookOpen,
} from "lucide-react";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

import codingClass from "../assets/1.png";
import students from "../assets/2.jpg";
import projectImage from "../assets/3.jpg";
import trainingHub from "../assets/7.jpg";


export default function Enrollment() {

    const { slug } = useParams();

    const remote = useRemote('/courses/' + encodeURIComponent(slug), null);
    const course = remote.data;
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        education: "",
        experience: "Beginner",
        mode: "Physical Training",
        startPeriod: "",
        message: "",
    });


    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };


    const handleSubmit = async (e) => {

        e.preventDefault();
        setSubmitError("");
        setSubmitting(true);

        try {
            await api.post("/enrollments", {
                full_name:    formData.fullName,
                email:        formData.email,
                phone:        formData.phone,
                education:    formData.education,
                experience:   formData.experience,
                mode:         formData.mode,
                start_period: formData.startPeriod,
                message:      formData.message,
                course:       course?.title,
                courseSlug:   course?.slug,
            });

            setSubmitted(true);

            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            setSubmitError(
                err.response?.data?.error || "Failed to submit application. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };


    if (remote.loading || remote.error) return <main><Navbar /><DataState {...remote} /><Footer /></main>;

    if (!course) {

        return (
            <main className="min-h-screen bg-white text-slate-900">

                <Navbar />

                <section className="flex min-h-[60vh] items-center justify-center px-6">

                    <div className="text-center">

                        <h1 className="text-3xl font-extrabold">
                            Course not found
                        </h1>

                        <p className="mt-3 text-slate-500">
                            The course you are trying to enroll in does not exist.
                        </p>

                        <Link
                            to="/training/courses"
                            className="
                                mt-6
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-purple-700
                                px-6
                                py-3
                                font-bold
                                text-white
                                transition
                                hover:bg-purple-800
                            "
                        >
                            View Courses
                            <ArrowRight size={18} />
                        </Link>

                    </div>

                </section>

                <Footer />

            </main>
        );
    }


    if (submitted) {

        return (
            <main className="min-h-screen bg-white text-slate-900">

                <Navbar />

                <section className="relative overflow-hidden bg-slate-950">

                    <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-10">

                        <div className="mx-auto max-w-2xl text-center">

                            <div
                                className="
                                    mx-auto
                                    flex
                                    h-20
                                    w-20
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-purple-700
                                    text-white
                                "
                            >
                                <CheckCircle2 size={40} />
                            </div>


                            <p
                                className="
                                    mt-7
                                    text-sm
                                    font-bold
                                    uppercase
                                    tracking-[0.2em]
                                    text-purple-400
                                "
                            >
                                Application Received
                            </p>


                            <h1
                                className="
                                    mt-4
                                    text-4xl
                                    font-extrabold
                                    tracking-tight
                                    text-white
                                    sm:text-5xl
                                "
                            >
                                You're one step closer.
                            </h1>


                            <p
                                className="
                                    mt-6
                                    text-base
                                    leading-8
                                    text-slate-400
                                    sm:text-lg
                                "
                            >
                                Thank you for applying for the{" "}
                                <span className="font-bold text-white">
                                    {course.title}
                                </span>{" "}
                                training program.
                            </p>


                            <div
                                className="
                                    mt-8
                                    rounded-2xl
                                    border
                                    border-white/10
                                    bg-white/5
                                    p-6
                                    text-left
                                "
                            >

                                <p className="text-sm font-bold text-white">
                                    What happens next?
                                </p>

                                <div className="mt-5 space-y-4">

                                    {[
                                        "Our training team reviews your application.",
                                        "We contact you using the phone or email you provided.",
                                        "We confirm the training schedule and availability.",
                                        "We provide the enrollment and payment instructions.",
                                    ].map((step, index) => (

                                        <div
                                            key={step}
                                            className="flex gap-3"
                                        >

                                            <div
                                                className="
                                                    flex
                                                    h-7
                                                    w-7
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    bg-purple-700
                                                    text-xs
                                                    font-bold
                                                    text-white
                                                "
                                            >
                                                {index + 1}
                                            </div>

                                            <p className="text-sm leading-6 text-slate-400">
                                                {step}
                                            </p>

                                        </div>

                                    ))}

                                </div>

                            </div>


                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

                                <Link
                                    to="/training/courses"
                                    className="
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-purple-700
                                        px-6
                                        py-3.5
                                        font-bold
                                        text-white
                                        transition
                                        hover:bg-purple-800
                                    "
                                >
                                    Explore More Courses
                                    <ArrowRight size={18} />
                                </Link>


                                <Link
                                    to="/"
                                    className="
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        border
                                        border-white/15
                                        px-6
                                        py-3.5
                                        font-bold
                                        text-white
                                        transition
                                        hover:bg-white/10
                                    "
                                >
                                    Back to Home
                                </Link>

                            </div>

                        </div>

                    </div>

                </section>

                <Footer />

            </main>
        );
    }


    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">

            <Navbar />


            {/* HEADER */}

            <section className="bg-slate-950">

                <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10">

                    <Link
                        to={`/training/courses/${course.slug}`}
                        className="
                            inline-flex
                            items-center
                            gap-2
                            text-sm
                            font-bold
                            text-slate-400
                            transition
                            hover:text-white
                        "
                    >
                        <ArrowLeft size={17} />
                        Back to Course
                    </Link>


                    <div className="mt-8 max-w-3xl">

                        <p
                            className="
                                text-sm
                                font-bold
                                uppercase
                                tracking-[0.2em]
                                text-purple-400
                            "
                        >
                            Course Enrollment
                        </p>


                        <h1
                            className="
                                mt-3
                                text-4xl
                                font-extrabold
                                tracking-tight
                                text-white
                                sm:text-5xl
                            "
                        >
                            Enroll in {course.title}
                        </h1>


                        <p className="mt-5 text-base leading-7 text-slate-400">
                            Complete the form below and our training team
                            will contact you to confirm your enrollment.
                        </p>

                    </div>

                </div>

            </section>


            {/* CONTENT */}

            <section className="py-12 sm:py-16">

                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">

                    <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">


                        {/* COURSE SUMMARY */}

                        <aside>

                            <div
                                className="
                                    overflow-hidden
                                    rounded-3xl
                                    border
                                    border-slate-200
                                    bg-white
                                    shadow-sm
                                "
                            >

                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="h-56 w-full object-cover"
                                />


                                <div className="p-6">

                                    <p
                                        className="
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-[0.15em]
                                            text-purple-600
                                        "
                                    >
                                        Selected Course
                                    </p>


                                    <h2
                                        className="
                                            mt-2
                                            text-2xl
                                            font-extrabold
                                            text-slate-950
                                        "
                                    >
                                        {course.title}
                                    </h2>


                                    <div className="mt-6 space-y-4">

                                        <div className="flex items-center gap-3">

                                            <Clock3
                                                size={18}
                                                className="text-purple-700"
                                            />

                                            <div>
                                                <p className="text-xs text-slate-400">
                                                    Duration
                                                </p>

                                                <p className="text-sm font-bold">
                                                    {course.duration}
                                                </p>
                                            </div>

                                        </div>


                                        <div className="flex items-center gap-3">

                                            <BookOpen
                                                size={18}
                                                className="text-purple-700"
                                            />

                                            <div>
                                                <p className="text-xs text-slate-400">
                                                    Level
                                                </p>

                                                <p className="text-sm font-bold">
                                                    {course.level}
                                                </p>
                                            </div>

                                        </div>


                                        <div className="flex items-center gap-3">

                                            <MapPin
                                                size={18}
                                                className="text-purple-700"
                                            />

                                            <div>
                                                <p className="text-xs text-slate-400">
                                                    Training Location
                                                </p>

                                                <p className="text-sm font-bold">
                                                    Musanze, Rwanda
                                                </p>
                                            </div>

                                        </div>

                                    </div>


                                    <div
                                        className="
                                            mt-7
                                            rounded-2xl
                                            bg-purple-50
                                            p-4
                                        "
                                    >

                                        <p className="text-sm font-bold text-purple-900">
                                            Practical training
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-purple-700">
                                            Learn through projects,
                                            exercises and instructor
                                            guidance.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </aside>


                        {/* FORM */}

                        <div
                            className="
                                rounded-3xl
                                border
                                border-slate-200
                                bg-white
                                p-6
                                shadow-sm
                                sm:p-8
                                lg:p-10
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-sm
                                        font-bold
                                        uppercase
                                        tracking-[0.15em]
                                        text-purple-600
                                    "
                                >
                                    Your Information
                                </p>


                                <h2
                                    className="
                                        mt-2
                                        text-2xl
                                        font-extrabold
                                        text-slate-950
                                    "
                                >
                                    Complete your application
                                </h2>


                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Please provide accurate information so
                                    our team can contact you.
                                </p>

                            </div>


                            <form
                                onSubmit={handleSubmit}
                                className="mt-8 space-y-6"
                            >

                                {/* NAME */}

                                <div>

                                    <label
                                        htmlFor="fullName"
                                        className="mb-2 block text-sm font-bold text-slate-800"
                                    >
                                        Full Name
                                    </label>

                                    <div className="relative">

                                        <User
                                            size={18}
                                            className="
                                                absolute
                                                left-4
                                                top-1/2
                                                -translate-y-1/2
                                                text-slate-400
                                            "
                                        />

                                        <input
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter your full name"
                                            className="
                                                h-12
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
                                                focus:border-purple-600
                                                focus:ring-4
                                                focus:ring-purple-100
                                            "
                                        />

                                    </div>

                                </div>


                                {/* EMAIL + PHONE */}

                                <div className="grid gap-6 sm:grid-cols-2">

                                    <div>

                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-sm font-bold text-slate-800"
                                        >
                                            Email Address
                                        </label>

                                        <div className="relative">

                                            <Mail
                                                size={18}
                                                className="
                                                    absolute
                                                    left-4
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-slate-400
                                                "
                                            />

                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="you@example.com"
                                                className="
                                                    h-12
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    border-slate-200
                                                    pl-11
                                                    pr-4
                                                    text-sm
                                                    outline-none
                                                    transition
                                                    focus:border-purple-600
                                                    focus:ring-4
                                                    focus:ring-purple-100
                                                "
                                            />

                                        </div>

                                    </div>


                                    <div>

                                        <label
                                            htmlFor="phone"
                                            className="mb-2 block text-sm font-bold text-slate-800"
                                        >
                                            Phone Number
                                        </label>

                                        <div className="relative">

                                            <Phone
                                                size={18}
                                                className="
                                                    absolute
                                                    left-4
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-slate-400
                                                "
                                            />

                                            <input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                placeholder="07XX XXX XXX"
                                                className="
                                                    h-12
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    border-slate-200
                                                    pl-11
                                                    pr-4
                                                    text-sm
                                                    outline-none
                                                    transition
                                                    focus:border-purple-600
                                                    focus:ring-4
                                                    focus:ring-purple-100
                                                "
                                            />

                                        </div>

                                    </div>

                                </div>


                                {/* EDUCATION */}

                                <div>

                                    <label
                                        htmlFor="education"
                                        className="mb-2 block text-sm font-bold text-slate-800"
                                    >
                                        Education / Background
                                    </label>

                                    <input
                                        id="education"
                                        name="education"
                                        value={formData.education}
                                        onChange={handleChange}
                                        placeholder="e.g. Secondary school, University, IT professional..."
                                        className="
                                            h-12
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            px-4
                                            text-sm
                                            outline-none
                                            transition
                                            focus:border-purple-600
                                            focus:ring-4
                                            focus:ring-purple-100
                                        "
                                    />

                                </div>


                                {/* EXPERIENCE */}

                                <div className="grid gap-6 sm:grid-cols-2">

                                    <div>

                                        <label
                                            htmlFor="experience"
                                            className="mb-2 block text-sm font-bold text-slate-800"
                                        >
                                            Experience Level
                                        </label>

                                        <select
                                            id="experience"
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleChange}
                                            className="
                                                h-12
                                                w-full
                                                rounded-xl
                                                border
                                                border-slate-200
                                                bg-white
                                                px-4
                                                text-sm
                                                outline-none
                                                focus:border-purple-600
                                                focus:ring-4
                                                focus:ring-purple-100
                                            "
                                        >

                                            <option>Beginner</option>
                                            <option>Intermediate</option>
                                            <option>Advanced</option>

                                        </select>

                                    </div>


                                    <div>

                                        <label
                                            htmlFor="mode"
                                            className="mb-2 block text-sm font-bold text-slate-800"
                                        >
                                            Training Mode
                                        </label>

                                        <select
                                            id="mode"
                                            name="mode"
                                            value={formData.mode}
                                            onChange={handleChange}
                                            className="
                                                h-12
                                                w-full
                                                rounded-xl
                                                border
                                                border-slate-200
                                                bg-white
                                                px-4
                                                text-sm
                                                outline-none
                                                focus:border-purple-600
                                                focus:ring-4
                                                focus:ring-purple-100
                                            "
                                        >

                                            <option>
                                                Physical Training
                                            </option>

                                            <option>
                                                Online Training
                                            </option>

                                        </select>

                                    </div>

                                </div>


                                {/* START PERIOD */}

                                <div>

                                    <label
                                        htmlFor="startPeriod"
                                        className="mb-2 block text-sm font-bold text-slate-800"
                                    >
                                        Preferred Start Period
                                    </label>

                                    <select
                                        id="startPeriod"
                                        name="startPeriod"
                                        value={formData.startPeriod}
                                        onChange={handleChange}
                                        required
                                        className="
                                            h-12
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            px-4
                                            text-sm
                                            outline-none
                                            focus:border-purple-600
                                            focus:ring-4
                                            focus:ring-purple-100
                                        "
                                    >

                                        <option value="">
                                            Select preferred period
                                        </option>

                                        <option>
                                            As soon as possible
                                        </option>

                                        <option>
                                            This month
                                        </option>

                                        <option>
                                            Next month
                                        </option>

                                        <option>
                                            Not sure yet
                                        </option>

                                    </select>

                                </div>


                                {/* MESSAGE */}

                                <div>

                                    <label
                                        htmlFor="message"
                                        className="mb-2 block text-sm font-bold text-slate-800"
                                    >
                                        Additional Message
                                    </label>

                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Tell us anything you would like our training team to know..."
                                        className="
                                            w-full
                                            resize-none
                                            rounded-xl
                                            border
                                            border-slate-200
                                            px-4
                                            py-3
                                            text-sm
                                            outline-none
                                            transition
                                            focus:border-purple-600
                                            focus:ring-4
                                            focus:ring-purple-100
                                        "
                                    />

                                </div>


                                {/* SUBMIT */}

                                {submitError && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                        {submitError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="
                                        group
                                        flex
                                        w-full
                                        items-center
                                        justify-center
                                        gap-3
                                        rounded-xl
                                        bg-purple-700
                                        px-6
                                        py-4
                                        text-sm
                                        font-extrabold
                                        text-white
                                        shadow-lg
                                        shadow-purple-200
                                        transition
                                        duration-300
                                        hover:-translate-y-0.5
                                        hover:bg-purple-800
                                        active:translate-y-0
                                        disabled:opacity-60
                                        disabled:cursor-not-allowed
                                    "
                                >

                                    <Send size={18} />

                                    {submitting ? "Submitting..." : "Submit Enrollment Application"}

                                    <ArrowRight
                                        size={18}
                                        className="transition group-hover:translate-x-1"
                                    />

                                </button>


                                <p className="text-center text-xs leading-5 text-slate-400">
                                    By submitting this application, you agree
                                    that CodeRwanda may contact you regarding
                                    this training program.
                                </p>

                            </form>

                        </div>

                    </div>

                </div>

            </section>


            <Footer />

        </main>
    );
}