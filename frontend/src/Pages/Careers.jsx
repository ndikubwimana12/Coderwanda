import useRemote from '../Utils/useRemote';
import DataState from '../Components/DataState';
import { useEffect, useState } from "react";
import api from "../Utils/api";
import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Code2, GraduationCap, HeartHandshake, Laptop, MapPin, Rocket, Users, ChevronRight, X, Send } from "lucide-react";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

import careersHero from "../assets/7.jpg";
import teamImage from "../assets/2.jpg";
import projectImage from "../assets/3.jpg";


/* =========================================================
   OPEN POSITIONS
========================================================= */



/* =========================================================
   VALUES
========================================================= */

const values = [
    {
        icon: Rocket,
        title: "Build Real Solutions",
        description:
            "We work on technology that solves practical problems for businesses, organizations and communities.",
    },

    {
        icon: Users,
        title: "Grow Together",
        description:
            "We believe great technology is created by people who learn, collaborate and support each other.",
    },

    {
        icon: Laptop,
        title: "Keep Learning",
        description:
            "Technology changes quickly. We encourage continuous learning, experimentation and knowledge sharing.",
    },

    {
        icon: HeartHandshake,
        title: "Create Impact",
        description:
            "Our goal is not only to write code, but to create meaningful opportunities through technology.",
    },
];


/* =========================================================
   QUALITIES
========================================================= */

const qualities = [
    "Strong problem-solving mindset",
    "Passion for technology and innovation",
    "Willingness to learn and improve",
    "Ability to work independently and in a team",
    "Good communication skills",
    "Commitment to delivering quality work",
];


/* =========================================================
   APPLICATION PROCESS
========================================================= */

const process = [
    {
        number: "01",
        title: "Apply",
        description:
            "Submit your application with your CV, portfolio or relevant project experience.",
    },

    {
        number: "02",
        title: "Review",
        description:
            "Our team reviews your experience, skills and potential fit for the opportunity.",
    },

    {
        number: "03",
        title: "Interview",
        description:
            "Shortlisted candidates participate in a conversation with our team.",
    },

    {
        number: "04",
        title: "Join Us",
        description:
            "Successful candidates receive the next steps to start their journey with CodeRwanda.",
    },
];


export default function Careers() {
    const remote = useRemote('/careers');
    const jobs = remote.data.map(job => ({ ...job, icon: BriefcaseBusiness }));
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [selectedJob, setSelectedJob] = useState(null);
    const [showApplication, setShowApplication] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });

    const [submitted, setSubmitted] = useState(false);
    useEffect(() => {
      if (!selectedJob) return;
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const close = event => { if (event.key === 'Escape') setSelectedJob(null); };
      window.addEventListener('keydown', close);
      return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', close); };
    }, [selectedJob]);


    /* =========================================================
       VIEW POSITION
    ========================================================= */

    const handleViewPosition = (job) => {
        setSelectedJob(job);
        setShowApplication(false);
        setSubmitted(false);


    };


    /* =========================================================
       CLOSE MODAL
    ========================================================= */

    const closeModal = () => {
        setSelectedJob(null);
        setShowApplication(false);
        setSubmitted(false);


    };


    /* =========================================================
       FORM
    ========================================================= */

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");
        setSubmitting(true);

        try {
            await api.post("/careers/applications", {
                job_id: selectedJob?.id,
                job_title: selectedJob?.title,
                name:           form.name,
                email:          form.email,
                phone:          form.phone,
                message:        form.message,
                portfolio_link: form.portfolio || "",
            });
            setSubmitted(true);
        } catch (err) {
            setSubmitError(
                err.response?.data?.error || "Failed to submit. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <main className="min-h-screen bg-white text-slate-900">

            <Navbar />
            <DataState {...remote} empty={!remote.data.length} label="job listings" />


            {/* =========================================================
                HERO
            ========================================================= */}

            <section className="bg-slate-950 py-5 sm:py-8">

                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">

                    <div className="grid items-center gap-12 py-6 lg:grid-cols-2 lg:py-10">

                        {/* HERO TEXT */}

                        <div className="max-w-2xl">

                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">

                                <span className="h-2 w-2 rounded-full bg-purple-400" />

                                Careers at CodeRwanda

                            </div>


                            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">

                                Build your career.

                                <br />

                                <span className="text-purple-400">
                                    Build the future.
                                </span>

                            </h1>


                            <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">

                                Join a growing technology company working to create
                                opportunities, build innovative solutions and empower
                                Rwanda through technology.

                            </p>


                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                                <a
                                    href="#open-positions"
                                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3.5 font-bold text-white transition hover:bg-purple-500"
                                >
                                    Explore Opportunities

                                    <ArrowRight
                                        size={18}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                </a>


                                <a
                                    href="#internships"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 font-bold text-white transition hover:bg-white/10"
                                >
                                    Internship Program
                                </a>

                            </div>


                            {/* HERO STATS */}

                            <div className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-7">

                                <div>
                                    <p className="text-2xl font-extrabold text-white">
                                        100+
                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Clients & Learners
                                    </p>
                                </div>


                                <div>
                                    <p className="text-2xl font-extrabold text-white">
                                        10+
                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Projects
                                    </p>
                                </div>


                                <div>
                                    <p className="text-2xl font-extrabold text-white">
                                        2+
                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Years
                                    </p>
                                </div>

                            </div>

                        </div>


                        {/* HERO IMAGE CARD */}

                        <div className="relative lg:pl-8">

                            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl">

                                <img
                                    src={careersHero}
                                    alt="CodeRwanda technology team"
                                    className="h-[420px] w-full rounded-2xl object-cover sm:h-[500px]"
                                />


                                <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/10 bg-slate-950/90 p-5 backdrop-blur">

                                    <div className="flex items-center gap-4">

                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white">

                                            <BriefcaseBusiness size={21} />

                                        </div>


                                        <div>

                                            <p className="font-bold text-white">
                                                Build with CodeRwanda
                                            </p>

                                            <p className="text-sm text-slate-400">
                                                Learn, create and make an impact.
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            <div className="absolute -right-3 -top-5 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block">

                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Our Mission
                                </p>

                                <p className="mt-1 font-bold text-slate-900">
                                    Empower Rwanda Through Technology
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================================================
                INTRO
            ========================================================= */}

            <section className="py-5 sm:py-8">

                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">

                    <div className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-20">

                        <div>

                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
                                Why CodeRwanda?
                            </p>

                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                                Work where technology meets opportunity.
                            </h2>

                            <p className="mt-6 text-base leading-8 text-slate-500">
                                At CodeRwanda, we believe technology should create
                                opportunities for people and businesses. Our team works
                                across software development, digital solutions,
                                technology training and e-commerce.
                            </p>

                            <p className="mt-5 text-base leading-8 text-slate-500">
                                When you join us, you become part of a team that doesn't
                                simply build software. We build solutions, develop skills
                                and contribute to Rwanda's growing technology ecosystem.
                            </p>


                            <div className="mt-8 grid gap-4 sm:grid-cols-2">

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-2xl font-extrabold text-slate-950">
                                        100+
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Clients & learners
                                    </p>
                                </div>


                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-2xl font-extrabold text-slate-950">
                                        10+
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Projects completed
                                    </p>
                                </div>

                            </div>

                        </div>


                        <div className="relative">

                            <div className="overflow-hidden rounded-3xl">

                                <img
                                    src={teamImage}
                                    alt="CodeRwanda team working together"
                                    className="h-[500px] w-full object-cover"
                                />

                            </div>


                            <div className="absolute -bottom-5 -left-4 hidden max-w-xs rounded-2xl bg-white p-6 shadow-2xl sm:block">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">

                                    <Code2 size={21} />

                                </div>

                                <p className="mt-4 font-extrabold text-slate-950">
                                    Technology with purpose
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Build useful technology that creates real impact.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================================================
                VALUES
            ========================================================= */}

            <section className="bg-slate-50 py-5 sm:py-8">

                <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">

                    <div className="max-w-2xl">

                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
                            Our Culture
                        </p>

                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                            What it means to work with us.
                        </h2>

                    </div>


                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                        {values.map((value) => {

                            const Icon = value.icon;

                            return (
                                <article
                                    key={value.title}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl"
                                >

                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                        <Icon size={22} />
                                    </div>

                                    <h3 className="mt-6 text-lg font-extrabold text-slate-950">
                                        {value.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-6 text-slate-500">
                                        {value.description}
                                    </p>

                                </article>
                            );

                        })}

                    </div>

                </div>

            </section>


            {/* =========================================================
                OPEN POSITIONS
            ========================================================= */}

            <section
                id="open-positions"
                className="scroll-mt-20 py-5 sm:py-8"
            >

                <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">

                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

                        <div className="max-w-2xl">

                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
                                Opportunities
                            </p>

                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                                Find your next opportunity.
                            </h2>

                            <p className="mt-5 text-base leading-7 text-slate-500">
                                Explore our current opportunities and find where your
                                skills can make an impact.
                            </p>

                        </div>


                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">

                            <BriefcaseBusiness
                                size={18}
                                className="text-purple-600"
                            />

                            {jobs.length} open positions

                        </div>

                    </div>


                    {/* POSITION GRID */}

                    <div className="mt-10 grid gap-6 md:grid-cols-3">

                        {jobs.map((job) => {

                            const Icon = job.icon;

                            return (
                                <article
                                    key={job.id}
                                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-2xl sm:p-7"
                                >

                                    {/* TOP */}

                                    <div className="flex items-start justify-between gap-4">

                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">

                                            <Icon size={22} />

                                        </div>


                                        <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700">
                                            {job.type}
                                        </span>

                                    </div>


                                    <h3 className="mt-6 text-2xl font-extrabold text-slate-950">
                                        {job.title}
                                    </h3>


                                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

                                        <span className="inline-flex items-center gap-1.5">
                                            <MapPin size={15} />
                                            {job.location}
                                        </span>

                                        <span className="inline-flex items-center gap-1.5">
                                            <Users size={15} />
                                            {job.level}
                                        </span>

                                    </div>


                                    <p className="mt-5 text-sm leading-7 text-slate-500">
                                        {job.description}
                                    </p>


                                    <div className="mt-5 flex flex-wrap gap-2">

                                        {job.skills.map((skill) => (

                                            <span
                                                key={skill}
                                                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
                                            >
                                                {skill}
                                            </span>

                                        ))}

                                    </div>


                                    {/* ACTION */}

                                    <div className="mt-7 border-t border-slate-100 pt-5">

                                        <button
                                            onClick={() => handleViewPosition(job)}
                                            className="group flex w-full items-center justify-between text-sm font-bold text-slate-900"
                                        >

                                            <span className="transition group-hover:text-purple-700">
                                                View Position
                                            </span>

                                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 transition group-hover:bg-purple-600 group-hover:text-white">

                                                <ChevronRight
                                                    size={18}
                                                    className="transition-transform group-hover:translate-x-0.5"
                                                />

                                            </span>

                                        </button>

                                    </div>

                                </article>
                            );

                        })}

                    </div>

                </div>

            </section>


            {/* =========================================================
                WHAT WE LOOK FOR
            ========================================================= */}

            <section className="bg-slate-950 py-5 sm:py-8">

                <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">

                    <div className="grid items-center gap-12 lg:grid-cols-2">

                        <div>

                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400">
                                Who We're Looking For
                            </p>

                            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">

                                Skills matter.

                                <br />

                                <span className="text-slate-400">
                                    Character matters too.
                                </span>

                            </h2>

                            <p className="mt-6 text-base leading-8 text-slate-400">
                                You don't need to know everything before joining
                                CodeRwanda. We value people who are curious,
                                responsible, collaborative and willing to grow.
                            </p>


                            <div className="mt-8 space-y-4">

                                {qualities.map((quality) => (

                                    <div
                                        key={quality}
                                        className="flex items-center gap-3 text-sm font-medium text-slate-200"
                                    >

                                        <CheckCircle2
                                            size={19}
                                            className="shrink-0 text-purple-400"
                                        />

                                        {quality}

                                    </div>

                                ))}

                            </div>

                        </div>


                        <div className="relative">

                            <img
                                src={projectImage}
                                alt="CodeRwanda developers working on a project"
                                className="h-[500px] w-full rounded-3xl object-cover"
                            />


                            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-slate-950/90 p-5 backdrop-blur">

                                <p className="text-sm font-bold text-purple-400">
                                    LEARN → BUILD → GROW
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                    We create an environment where people can develop
                                    their technical skills and professional confidence.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================================================
                APPLICATION PROCESS
            ========================================================= */}

            <section className="py-5 sm:py-8">

                <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">

                    <div className="mx-auto max-w-2xl text-center">

                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
                            Application Process
                        </p>

                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                            Your journey starts here.
                        </h2>

                    </div>


                    <div className="mt-12 grid gap-5 md:grid-cols-4">

                        {process.map((step) => (

                            <div
                                key={step.number}
                                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                            >

                                <span className="text-4xl font-extrabold text-purple-100">
                                    {step.number}
                                </span>

                                <h3 className="mt-4 text-lg font-extrabold text-slate-950">
                                    {step.title}
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    {step.description}
                                </p>

                            </div>

                        ))}

                    </div>

                </div>

            </section>


            {/* =========================================================
                INTERNSHIP
            ========================================================= */}

            <section
                id="internships"
                className="bg-purple-50 py-5 sm:py-8"
            >

                <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">

                    <div className="overflow-hidden rounded-3xl bg-white shadow-xl">

                        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">

                            <div className="min-h-[400px]">

                                <img
                                    src={teamImage}
                                    alt="Students and young developers"
                                    className="h-full min-h-[400px] w-full object-cover"
                                />

                            </div>


                            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                                    <GraduationCap size={24} />
                                </div>

                                <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
                                    Internship Program
                                </p>

                                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                                    Start your technology journey with us.
                                </h2>

                                <p className="mt-5 leading-7 text-slate-500">
                                    Are you a student, recent graduate or aspiring
                                    technology professional looking for practical
                                    experience? Our internship opportunities give you
                                    the chance to learn while working on real projects.
                                </p>


                                <div className="mt-7 space-y-3">

                                    {[
                                        "Practical project experience",
                                        "Mentorship and guidance",
                                        "Professional portfolio development",
                                        "Exposure to real technology projects",
                                    ].map((item) => (

                                        <div
                                            key={item}
                                            className="flex items-center gap-3 text-sm font-semibold text-slate-700"
                                        >

                                            <CheckCircle2
                                                size={18}
                                                className="text-purple-600"
                                            />

                                            {item}

                                        </div>

                                    ))}

                                </div>


                                <a
                                    href="mailto:info@coderwanda.com"
                                    className="group mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-purple-700 px-6 py-3.5 font-bold text-white transition hover:bg-purple-800"
                                >

                                    Ask About Internships

                                    <ArrowRight
                                        size={18}
                                        className="transition-transform group-hover:translate-x-1"
                                    />

                                </a>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================================================
                FINAL CTA
            ========================================================= */}

            <section className="bg-slate-950 py-5 sm:py-8">

                <div className="mx-auto max-w-4xl px-6 py-16 text-center sm:px-8 lg:py-20">

                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400">
                        Your Next Opportunity
                    </p>

                    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                        Ready to build something meaningful?
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">
                        Explore our available opportunities or contact us if you
                        believe you can contribute to the CodeRwanda team.
                    </p>


                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                        <a
                            href="#open-positions"
                            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-7 py-3.5 font-bold text-white transition hover:bg-purple-500"
                        >

                            Explore Opportunities

                            <ArrowRight
                                size={18}
                                className="transition-transform group-hover:translate-x-1"
                            />

                        </a>


                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 font-bold text-white transition hover:bg-white/10"
                        >
                            Contact CodeRwanda
                        </Link>

                    </div>

                </div>

            </section>


            <Footer />


            {/* =========================================================
                POSITION MODAL
            ========================================================= */}

            {selectedJob && (

                <div className="fixed inset-0 z-[100] overflow-y-auto">

                    {/* BACKDROP */}

                    <div
                        onClick={closeModal}
                        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
                    />


                    {/* MODAL */}

                    <div className="relative flex min-h-full items-center justify-center p-4 sm:p-6">

                        <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">

                            {/* HEADER */}

                            <div className="border-b border-slate-200 bg-slate-50 p-6 sm:p-8">

                                <div className="flex items-start justify-between gap-5">

                                    <div>

                                        <div className="flex flex-wrap items-center gap-3">

                                            <h2 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">
                                                {selectedJob.title}
                                            </h2>

                                            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                                                {selectedJob.type}
                                            </span>

                                        </div>


                                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">

                                            <span className="inline-flex items-center gap-1.5">
                                                <MapPin size={15} />
                                                {selectedJob.location}
                                            </span>

                                            <span className="inline-flex items-center gap-1.5">
                                                <Users size={15} />
                                                {selectedJob.level}
                                            </span>

                                        </div>

                                    </div>


                                    <button
                                        onClick={closeModal}
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                    >
                                        <X size={20} />
                                    </button>

                                </div>

                            </div>


                            {!showApplication ? (

                                /* =================================================
                                   JOB DETAILS
                                ================================================= */

                                <div className="p-6 sm:p-8">

                                    <div>

                                        <p className="text-sm font-bold uppercase tracking-wider text-purple-600">
                                            About the position
                                        </p>

                                        <p className="mt-3 leading-7 text-slate-600">
                                            {selectedJob.description}
                                        </p>

                                    </div>


                                    <div className="mt-8">

                                        <h3 className="text-lg font-extrabold text-slate-950">
                                            Responsibilities
                                        </h3>

                                        <div className="mt-4 space-y-3">

                                            {selectedJob.responsibilities.map(
                                                (responsibility) => (

                                                    <div
                                                        key={responsibility}
                                                        className="flex items-start gap-3"
                                                    >

                                                        <CheckCircle2
                                                            size={18}
                                                            className="mt-0.5 shrink-0 text-purple-600"
                                                        />

                                                        <span className="text-sm leading-6 text-slate-600">
                                                            {responsibility}
                                                        </span>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    </div>


                                    <div className="mt-8">

                                        <h3 className="text-lg font-extrabold text-slate-950">
                                            Required skills
                                        </h3>

                                        <div className="mt-4 flex flex-wrap gap-2">

                                            {selectedJob.skills.map((skill) => (

                                                <span
                                                    key={skill}
                                                    className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                                                >
                                                    {skill}
                                                </span>

                                            ))}

                                        </div>

                                    </div>


                                    <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">

                                        <button
                                            onClick={() => setShowApplication(true)}
                                            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-6 py-3.5 font-bold text-white transition hover:bg-purple-800"
                                        >

                                            Apply for this Position

                                            <ArrowRight
                                                size={18}
                                                className="transition-transform group-hover:translate-x-1"
                                            />

                                        </button>


                                        <button
                                            onClick={closeModal}
                                            className="rounded-xl border border-slate-200 px-6 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50"
                                        >
                                            Close
                                        </button>

                                    </div>

                                </div>

                            ) : (

                                /* =================================================
                                   APPLICATION FORM
                                ================================================= */

                                <div className="p-6 sm:p-8">

                                    {!submitted ? (

                                        <form
                                            onSubmit={handleSubmit}
                                            className="space-y-5"
                                        >

                                            <div>

                                                <p className="text-sm font-bold uppercase tracking-wider text-purple-600">
                                                    Apply now
                                                </p>

                                                <h3 className="mt-2 text-2xl font-extrabold text-slate-950">
                                                    Apply for {selectedJob.title}
                                                </h3>

                                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                                    Complete the form below and tell us
                                                    why you would be a good fit for
                                                    this opportunity.
                                                </p>

                                            </div>


                                            {/* NAME */}

                                            <div>

                                                <label className="text-sm font-bold text-slate-700">
                                                    Full Name
                                                </label>

                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={form.name}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Your full name"
                                                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                                />

                                            </div>


                                            {/* EMAIL */}

                                            <div>

                                                <label className="text-sm font-bold text-slate-700">
                                                    Email Address
                                                </label>

                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={form.email}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="you@example.com"
                                                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                                />

                                            </div>


                                            {/* PHONE */}

                                            <div>

                                                <label className="text-sm font-bold text-slate-700">
                                                    Phone Number
                                                </label>

                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={form.phone}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="+250 7XX XXX XXX"
                                                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                                />

                                            </div>


                                            {/* MESSAGE */}

                                            <div>

                                                <label className="text-sm font-bold text-slate-700">
                                                    Why should we consider you?
                                                </label>

                                                <textarea
                                                    name="message"
                                                    value={form.message}
                                                    onChange={handleChange}
                                                    required
                                                    rows="5"
                                                    placeholder="Tell us about your skills, experience and why you are interested..."
                                                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                                />

                                            </div>


                                            {submitError && (
                                                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                                    {submitError}
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">

                                                <button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-6 py-3.5 font-bold text-white transition hover:bg-purple-800 disabled:opacity-60 disabled:cursor-not-allowed"
                                                >

                                                    <Send size={17} />

                                                    {submitting ? "Submitting..." : "Submit Application"}

                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowApplication(false)
                                                    }
                                                    className="rounded-xl border border-slate-200 px-6 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50"
                                                >
                                                    Back to Position
                                                </button>

                                            </div>

                                        </form>

                                    ) : (

                                        /* =================================================
                                           SUCCESS
                                        ================================================= */

                                        <div className="py-10 text-center">

                                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-purple-600">

                                                <CheckCircle2 size={32} />

                                            </div>


                                            <h3 className="mt-6 text-2xl font-extrabold text-slate-950">
                                                Application Submitted
                                            </h3>


                                            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">

                                                Thank you for applying for the{" "}

                                                <span className="font-bold text-slate-700">
                                                    {selectedJob.title}
                                                </span>{" "}

                                                position. Our team will review your
                                                application and contact you if you
                                                are shortlisted.

                                            </p>


                                            <button
                                                onClick={closeModal}
                                                className="mt-7 rounded-xl bg-purple-700 px-6 py-3.5 font-bold text-white transition hover:bg-purple-800"
                                            >
                                                Done
                                            </button>

                                        </div>

                                    )}

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
}