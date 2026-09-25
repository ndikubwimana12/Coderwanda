import useRemote from '../Utils/useRemote';
import DataState from '../Components/DataState';
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../Utils/api";
import {
    ArrowRight,
    CheckCircle2,
    Clock3,
    MapPin,
    Play,
    Users,
    Award,
    Laptop,
    Code2,
    Smartphone,
    Brain,
    ShieldCheck,
    Database,
    ChevronRight,
} from "lucide-react";

import trainingHero from '../assets/7.jpg';
import codingClass from "../assets/1.png";
import students from "../assets/2.jpg";
import projectImage from "../assets/3.jpg";
import trainingHub from "../assets/7.jpg";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

/* ── Fallback icon mapping by keywords ── */
const ICON_MAP = { mobile: Smartphone, python: Brain, ai: Brain, cyber: ShieldCheck, database: Database, web: Code2, default: Laptop };
const getIcon = (title = "") => {
    const t = title.toLowerCase();
    for (const [key, Icon] of Object.entries(ICON_MAP)) { if (t.includes(key)) return Icon; }
    return ICON_MAP.default;
};

export default function TrainingRoom() {
    const remote = useRemote('/courses');
    const projectData = useRemote('/projects');
    const testimonialData = useRemote('/testimonials');
    const courses = remote.data.map(course => ({ ...course, icon: getIcon(course.title) }));
    const projects = projectData.data;
    const testimonials = testimonialData.data;
    return (

        <main className="min-h-screen bg-white text-slate-900">
            <Navbar />
            <DataState {...remote} empty={!remote.data.length} label="courses" />
            {/* =========================================================
          HERO
      ========================================================= */}
            <section className="relative overflow-hidden bg-slate-950">
                <div className="absolute inset-0">
                    <img
                        src={trainingHero}
                        alt="CodeRwanda technology training"
                        className="h-full w-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-slate-950/75" />
                </div>

                <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-10 lg:py-12">
                    <div className="grid items-center gap-14 lg:grid-cols-2">
                        {/* Hero text */}
                        <div className="max-w-2xl">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                                <span className="h-2 w-2 rounded-full bg-purple-400" />
                                CodeRwanda Training Room
                            </div>

                            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-6xl">
                                Build Skills.
                                <br />
                                <span className="text-purple-400">Build Technology.</span>
                            </h1>

                            <p className="mt-7 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                                Learn practical technology skills, work on real projects,
                                and prepare yourself for the digital opportunities of
                                tomorrow.
                            </p>

                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    to="/training-room/courses"
                                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-purple-500 px-6 py-3.5 font-bold text-white transition hover:bg-purple-400"
                                >
                                    Explore Courses

                                    <ArrowRight
                                        size={19}
                                        className="transition-transform duration-300 group-hover:translate-x-1"
                                    />
                                </Link>

                                <Link
                                    to="/contact"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/15"
                                >
                                    Join Training
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-7">
                                <div>
                                    <p className="text-2xl font-extrabold text-white">100+</p>
                                    <p className="mt-1 text-sm text-slate-400">Learners</p>
                                </div>

                                <div>
                                    <p className="text-2xl font-extrabold text-white">10+</p>
                                    <p className="mt-1 text-sm text-slate-400">Projects</p>
                                </div>

                                <div>
                                    <p className="text-2xl font-extrabold text-white">2+</p>
                                    <p className="mt-1 text-sm text-slate-400">Years</p>
                                </div>
                            </div>
                        </div>

                        {/* Hero image card */}
                        <div className="relative lg:pl-10">
                            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur">
                                <img
                                    src={trainingHero}
                                    alt="Students learning technology"
                                    className="h-[420px] w-full rounded-2xl object-cover sm:h-[500px]"
                                />

                                <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/10 bg-slate-950/85 p-5 backdrop-blur">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500 text-white">
                                            <Play size={20} fill="currentColor" />
                                        </div>

                                        <div>
                                            <p className="font-bold text-white">
                                                Learn by doing
                                            </p>
                                            <p className="text-sm text-slate-400">
                                                Practical, project-based training
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative card */}
                            <div className="absolute -right-3 -top-5 hidden rounded-2xl border border-white/10 bg-white p-4 shadow-xl sm:block">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Training Hub
                                </p>
                                <p className="mt-1 font-bold text-slate-900">
                                    Musanze, Rwanda
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
          COURSES
      ========================================================= */}
            <section className="py-5 sm:py-8">
                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                        <div className="max-w-2xl">
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
                                Training Programs
                            </p>

                            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                                Choose the skill you want to build.
                            </h2>

                            <p className="mt-5 text-base leading-7 text-slate-500">
                                Practical courses designed to help you move from learning
                                concepts to building real technology.
                            </p>
                        </div>
                        <Link
                            to="/training-room/courses"
                            className="group inline-flex items-center gap-2 font-bold text-purple-600 transition hover:text-purple-700"
                        >
                            View all courses

                            <ArrowRight
                                size={18}
                                className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                        </Link>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => {
                            const Icon = course.icon;

                            return (
                                <article
                                    key={course.title}
                                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                                >
                                    <div className="relative h-56 overflow-hidden">
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                                        <div className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-purple-600 shadow-lg">
                                            <Icon size={21} />
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-xl font-extrabold text-slate-950">
                                            {course.title}
                                        </h3>

                                        <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-500">
                                            {course.description}
                                        </p>

                                        <div className="mt-5 flex flex-wrap gap-2">
                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                                <Clock3 size={14} />
                                                {course.duration}
                                            </span>

                                            <span className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                                                {course.level}
                                            </span>
                                        </div>
                                        <Link
                                            to={`/training-room/course/${course.slug}`}
                                            className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 text-sm font-bold text-slate-900 transition hover:text-purple-700"
                                        >
                                            <span>View course</span>

                                            <ChevronRight
                                                size={19}
                                                className="text-purple-600 transition-transform duration-300 group-hover:translate-x-1"
                                            />
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* =========================================================
          EXPERIENCE SECTION
      ========================================================= */}
            <section className="overflow-hidden bg-slate-950 py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
                    <div className="grid items-center gap-14 lg:grid-cols-2">
                        <div className="relative">
                            <div className="overflow-hidden rounded-3xl">
                                <img
                                    src={students}
                                    alt="CodeRwanda students"
                                    className="h-[520px] w-full object-cover"
                                />
                            </div>

                            <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-white p-6 shadow-2xl sm:block">
                                <p className="text-3xl font-extrabold text-slate-950">
                                    100+
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Learners empowered
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400">
                                The Training Experience
                            </p>

                            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                                Learn technology by creating technology.
                            </h2>

                            <p className="mt-6 text-base leading-8 text-slate-400">
                                Our training approach focuses on practical knowledge. You
                                don't just watch tutorials or memorize concepts. You work
                                through challenges, build applications and learn how
                                technology is used to solve real problems.
                            </p>

                            <div className="mt-8 space-y-4">
                                {[
                                    "Hands-on programming sessions",
                                    "Real-world development projects",
                                    "Collaborative problem solving",
                                    "Portfolio development",
                                    "Instructor guidance",
                                ].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-3 text-sm font-medium text-slate-200"
                                    >
                                        <CheckCircle2
                                            size={19}
                                            className="shrink-0 text-purple-400"
                                        />
                                        {item}
                                    </div>
                                ))}
                            </div>

                            <Link
                                to="/contact"
                                className="mt-9 inline-flex items-center gap-2 rounded-xl bg-purple-500 px-6 py-3.5 font-bold text-white transition hover:bg-purple-400"
                            >
                                Start Learning
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
          WHAT YOU BUILD
      ========================================================= */}
            <section className="py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
                    <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
                                Build Real Projects
                            </p>

                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                                Don't just learn.
                                <br />
                                <span className="text-slate-400">Create.</span>
                            </h2>

                            <p className="mt-6 text-base leading-8 text-slate-500">
                                Every strong developer needs practical experience. Our
                                training encourages you to turn what you learn into
                                applications and systems that demonstrate your skills.
                            </p>

                            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                <DataState {...projectData} empty={!projectData.data.length} label="projects" />
{projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                            <CheckCircle2 size={17} />
                                        </div>

                                        <span className="text-sm font-semibold text-slate-700">
                                            {project.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <img
                                src={projectImage}
                                alt="Students working on technology projects"
                                className="h-[520px] w-full rounded-3xl object-cover"
                            />

                            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-slate-950/90 p-5 text-white backdrop-blur">
                                <p className="text-sm font-bold text-purple-400">
                                    LEARN → BUILD → TEST → DEPLOY
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                    A practical workflow that helps turn knowledge into
                                    real-world experience.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
          TRAINING HUB
      ========================================================= */}
            <section className="bg-slate-50 py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
                    <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
                        <div className="grid lg:grid-cols-2">
                            <div className="min-h-[420px]">
                                <img
                                    src={trainingHub}
                                    alt="CodeRwanda Training Hub"
                                    className="h-full min-h-[420px] w-full object-cover"
                                />
                            </div>

                            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
                                    Visit Our Training Hub
                                </p>

                                <h2 className="mt-4 text-3xl font-extrabold text-slate-950 sm:text-4xl">
                                    A place to learn, create and connect.
                                </h2>

                                <p className="mt-5 leading-7 text-slate-500">
                                    Join us at the CodeRwanda training hub in Musanze and
                                    experience a practical environment designed for technology
                                    learning and collaboration.
                                </p>

                                <div className="mt-7 flex items-start gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                        <MapPin size={21} />
                                    </div>

                                    <div>
                                        <p className="font-bold text-slate-900">
                                            Musanze, Rwanda
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Yawunde, near JIBU
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        to="/contact"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-500 px-6 py-3.5 font-bold text-white transition hover:bg-purple-600"
                                    >
                                        Contact Us
                                        <ArrowRight size={18} />
                                    </Link>

                                    <Link
                                        to="/about"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Learn About Us
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
          TESTIMONIALS
      ========================================================= */}
            <section className="py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
                            Student Experience
                        </p>

                        <h2 className="mt-3 text-3xl font-extrabold text-slate-950 sm:text-4xl">
                            What learners say
                        </h2>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        <DataState {...testimonialData} empty={!testimonialData.data.length} label="testimonials" />
{testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="rounded-2xl border border-slate-200 bg-white p-7"
                            >
                                <div className="flex gap-1 text-purple-500">
                                    {Array.from({ length: testimonial.rating || 0 }, (_, i) => i).map((star) => (
                                        <span key={star}>★</span>
                                    ))}
                                </div>

                                <p className="mt-5 text-sm leading-7 text-slate-600">
                                    “{testimonial.content}”
                                </p>

                                <div className="mt-6 border-t border-slate-100 pt-5">
                                    <p className="font-bold text-slate-900">
                                        {testimonial.name}
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-purple-600">
                                        {testimonial.role}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =========================================================
          Footer
      ========================================================= */}
            <Footer />
        </main>
    );
}