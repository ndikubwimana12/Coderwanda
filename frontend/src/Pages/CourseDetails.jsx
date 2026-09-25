import useRemote from '../Utils/useRemote';
import DataState from '../Components/DataState';
import { Link, useParams } from "react-router-dom";


import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Clock3,
    Users,
    Award,
    BookOpen,
    Code2,
    Laptop,
    MapPin,
} from "lucide-react";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";



import projectImage from "../assets/3.jpg";



export default function CourseDetails() {

    const { courseId } = useParams();
    const remote = useRemote('/courses/' + encodeURIComponent(courseId), null);
    const course = remote.data;
    const loading = remote.loading;
    if (remote.error) return <main><Navbar /><DataState {...remote} /><Footer /></main>;

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <p className="text-slate-500">Loading course...</p>
            </main>
        );
    }


    if (!course) {

        return (
            <main className="min-h-screen bg-white">

                <Navbar />

                <section className="flex min-h-[60vh] items-center justify-center px-6">

                    <div className="text-center">

                        <h1 className="text-3xl font-black text-slate-950">
                            Course not found
                        </h1>

                        <p className="mt-3 text-slate-500">
                            The course you are looking for does not exist.
                        </p>

                        <Link
                            to="/training-room"
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-bold text-white transition hover:bg-purple-700"
                        >
                            <ArrowLeft size={18} />
                            Back to Training Room
                        </Link>

                    </div>

                </section>

                <Footer />

            </main>
        );
    }


    return (

        <main className="min-h-screen bg-white text-slate-900">

            <Navbar />


            {/* =====================================================
                BREADCRUMB
            ===================================================== */}

            <div className="border-b border-slate-100">

                <div className="mx-auto max-w-7xl px-6 py-5 sm:px-8 lg:px-10">

                    <Link
                        to="/training-room"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-purple-600"
                    >
                        <ArrowLeft size={17} />

                        Training Room
                    </Link>

                    <span className="mx-2 text-slate-300">
                        /
                    </span>

                    <span className="text-sm font-semibold text-purple-600">
                        {course.title}
                    </span>

                </div>

            </div>


            {/* =====================================================
                HERO
            ===================================================== */}

            <section className="bg-slate-950">

                <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10 lg:py-16">

                    <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">


                        {/* TEXT */}

                        <div>

                            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-purple-300">

                                <BookOpen size={15} />

                                CodeRwanda Training Program

                            </div>


                            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">

                                {course.title}

                            </h1>


                            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">

                                {course.description}

                            </p>


                            {/* COURSE INFO */}

                            <div className="mt-8 flex flex-wrap gap-3">

                                <CourseInfo
                                    icon={<Clock3 size={16} />}
                                    text={course.duration}
                                />

                                <CourseInfo
                                    icon={<Award size={16} />}
                                    text={course.level}
                                />

                                <CourseInfo
                                    icon={<Users size={16} />}
                                    text={course.students}
                                />

                            </div>


                            {/* BUTTON */}

                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                                <Link
                                    to={`/training-room/enroll/${course.slug || course.id}`}
                                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-7 py-4 font-bold text-white shadow-lg shadow-purple-950/30 transition hover:-translate-y-0.5 hover:bg-purple-500"
                                >

                                    Enroll Now

                                    <ArrowRight
                                        size={19}
                                        className="transition-transform group-hover:translate-x-1"
                                    />

                                </Link>


                                <a
                                    href="#curriculum"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-4 font-bold text-white transition hover:bg-white/10"
                                >

                                    View Curriculum

                                </a>

                            </div>

                        </div>


                        {/* IMAGE */}

                        <div className="relative">

                            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-2 shadow-2xl">

                                <img loading="lazy" decoding="async"
                                    src={course.image}
                                    alt={course.title}
                                    className="h-[350px] w-full rounded-2xl object-cover sm:h-[430px]"
                                />

                            </div>


                            <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-slate-900/95 p-5 shadow-xl backdrop-blur">

                                <div className="flex items-center gap-4">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 text-white">

                                        <Laptop size={20} />

                                    </div>

                                    <div>

                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Training Method
                                        </p>

                                        <p className="mt-1 font-bold text-white">
                                            Practical & Project-Based
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                OVERVIEW
            ===================================================== */}

            <section className="py-20 sm:py-24">

                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">

                    <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">


                        {/* OVERVIEW */}

                        <div>

                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
                                Course Overview
                            </p>


                            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">

                                Build practical skills that you can use.

                            </h2>


                            <p className="mt-6 text-base leading-8 text-slate-600">

                                {course.overview}

                            </p>


                            <div className="mt-8 grid gap-3 sm:grid-cols-2">

                                {[
                                    "Hands-on training",
                                    "Real-world projects",
                                    "Instructor guidance",
                                    "Practical assignments",
                                    "Portfolio development",
                                    "Career-focused learning",
                                ].map((item) => (

                                    <div
                                        key={item}
                                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                                    >

                                        <CheckCircle2
                                            size={18}
                                            className="shrink-0 text-purple-600"
                                        />

                                        <span className="text-sm font-semibold text-slate-700">
                                            {item}
                                        </span>

                                    </div>

                                ))}

                            </div>

                        </div>


                        {/* QUICK SUMMARY */}

                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">

                            <p className="text-sm font-bold uppercase tracking-wider text-purple-600">
                                Course Summary
                            </p>


                            <div className="mt-7 space-y-5">

                                <SummaryItem
                                    icon={<Clock3 size={19} />}
                                    label="Duration"
                                    value={course.duration}
                                />

                                <SummaryItem
                                    icon={<Award size={19} />}
                                    label="Level"
                                    value={course.level}
                                />

                                <SummaryItem
                                    icon={<Users size={19} />}
                                    label="Learners"
                                    value={course.students}
                                />

                                <SummaryItem
                                    icon={<MapPin size={19} />}
                                    label="Training Location"
                                    value="Musanze, Rwanda"
                                />

                            </div>


                            <Link
                                to={`/training-room/enroll/${course.slug || course.id}`}
                                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3.5 font-bold text-white transition hover:bg-purple-700"
                            >

                                Enroll in this course

                                <ArrowRight size={18} />

                            </Link>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                SKILLS
            ===================================================== */}

            <section
                id="curriculum"
                className="border-y border-slate-100 bg-slate-50 py-20 sm:py-24"
            >

                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">

                    <div className="max-w-2xl">

                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
                            What You Will Learn
                        </p>

                        <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
                            Skills you will develop
                        </h2>

                    </div>


                    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                        {course.skills.map((skill, index) => (

                            <div
                                key={skill}
                                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5"
                            >

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">

                                    <Code2 size={18} />

                                </div>

                                <div>

                                    <p className="text-xs font-bold text-purple-600">
                                        0{index + 1}
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-800">
                                        {skill}
                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </section>


            {/* =====================================================
                PROJECTS
            ===================================================== */}

            <section className="py-20 sm:py-24">

                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">

                    <div className="grid items-center gap-12 lg:grid-cols-2">

                        <div>

                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
                                Practical Experience
                            </p>

                            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
                                Projects you can build
                            </h2>

                            <p className="mt-5 max-w-xl leading-8 text-slate-500">
                                During the training, you will work on practical projects
                                that help transform your knowledge into real development
                                experience.
                            </p>


                            <div className="mt-8 space-y-3">

                                {course.projects.map((project) => (

                                    <div
                                        key={project}
                                        className="flex items-center gap-3 rounded-xl border border-slate-200 p-4"
                                    >

                                        <CheckCircle2
                                            size={19}
                                            className="text-purple-600"
                                        />

                                        <span className="text-sm font-semibold text-slate-700">
                                            {project}
                                        </span>

                                    </div>

                                ))}

                            </div>

                        </div>


                        <div className="overflow-hidden rounded-3xl">

                            <img
                                src={projectImage}
                                alt="Students building projects"
                                className="h-[450px] w-full object-cover"
                            />

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                CTA
            ===================================================== */}

            <section className="bg-slate-950 py-20">

                <div className="mx-auto max-w-5xl px-6 text-center">

                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400">
                        Ready to Start?
                    </p>

                    <h2 className="mt-4 text-3xl font-black text-white sm:text-5xl">
                        Start building your technology skills today.
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
                        Join CodeRwanda Training Room and learn through practical
                        projects, instructor guidance and real-world technology.
                    </p>

                    <Link
                        to={`/training-room/enroll/${course.slug}`}
                        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-7 py-4 font-bold text-white transition hover:bg-purple-500"
                    >
                        Enroll Now
                        <ArrowRight size={19} />
                    </Link>

                </div>

            </section>


            <Footer />

        </main>
    );
}


/* =========================================================
   COURSE INFO
========================================================= */

function CourseInfo({ icon, text }) {

    return (

        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200">

            <span className="text-purple-400">
                {icon}
            </span>

            {text}

        </div>

    );
}


/* =========================================================
   SUMMARY ITEM
========================================================= */

function SummaryItem({ icon, label, value }) {

    return (

        <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-purple-600 shadow-sm">

                {icon}

            </div>

            <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {label}
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                    {value}
                </p>

            </div>

        </div>

    );
}