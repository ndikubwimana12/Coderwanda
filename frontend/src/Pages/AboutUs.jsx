import { Link } from 'react-router-dom'

// Change these image paths to your actual assets
import aboutHero from '../assets/bgImage.png'
import aboutTeam from '../assets/2.jpg'
import missionImage from '../assets/bgImage.png'
import visionImage from '../assets/vision.png'
import impactImage from '../assets/bgImage.png'
import Footer from '../Components/Footer'
import Navbar from '../Components/Navbar'
import innovationImage from '../assets/innovation.png'
import integrityImage from '../assets/integrity.png'
import excellenceImage from '../assets/excelent.png'
import collaborationImage from '../assets/bgImage.png'
import impactValueImage from '../assets/impact.png'

const coreValues = [
    {
        title: 'Innovation',
        description: 'We embrace creativity and new ideas.',
        image: innovationImage,
    },
    {
        title: 'Integrity',
        description: 'We operate with honesty, transparency and accountability.',
        image: integrityImage,
    },
    {
        title: 'Excellence',
        description: 'We are committed to delivering high-quality results.',
        image: excellenceImage,
    },
    {
        title: 'Collaboration',
        description: 'We believe in teamwork and strong partnerships.',
        image: collaborationImage,
    },
    {
        title: 'Impact',
        description: 'We focus on creating meaningful impact in Rwanda.',
        image: impactValueImage,
    },
]

const stats = [
    {
        icon: 'fa-solid fa-users',
        number: '2+',
        label: 'Years of Expertise',
    },
    {
        icon: 'fa-solid fa-laptop-code',
        number: '100+',
        label: 'Happy Clients',
    },
    {
        icon: 'fa-solid fa-rocket',
        number: '10+',
        label: 'Projects Completed',
    },
    {
        icon: 'fa-solid fa-graduation-cap',
        number: '500+',
        label: 'Students / Trainees',
    },
]

export default function AboutUs() {
    return (
        <main className="bg-white text-slate-900">
            <Navbar />
            {/* =====================================================
          HERO
      ====================================================== */}
            <section className="relative min-h-[360px] overflow-hidden sm:min-h-[400px] lg:h-[430px]">

                {/* Background image */}
                <img
                    src={aboutHero}
                    alt="CodeRwanda team"
                    className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Dark purple overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#170044]/98 via-[#24005d]/95 to-[#6d00a8]/0" />

                {/* Extra overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(168,85,247,0.25),transparent_0%)]" />

                <div className="relative mx-auto flex h-full max-w-7xl items-center px-6 py-20 lg:px-8">

                    <div className="max-w-xl">

                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-300 sm:text-base">
                            About CodeRwanda
                        </p>

                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            About Us
                        </h1>

                        <h2 className="mt-3 text-xl font-bold text-white sm:text-2xl">
                            Rwanda's Code. Rwanda's Future.
                        </h2>

                        <p className="mt-4 max-w-lg text-sm leading-6 text-gray-200 sm:text-base">
                            We are building a digitally empowered Rwanda through
                            technology, innovation, education and opportunity.
                        </p>

                        <Link
                            to="/contact"
                            className="group mt-6 inline-flex items-center gap-2 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-900/40"
                        >
                            Our Journey

                            <i className="fa-solid fa-arrow-right text-xs transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>

                    </div>

                </div>
            </section>


            {/* =====================================================
          PAGE CONTENT
      ====================================================== */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8">

                {/* =================================================
            WHO WE ARE
        ================================================== */}
                <section className="py-8 sm:py-12 lg:py-14">

                    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">

                        {/* Text */}
                        <div>

                            <div className="mb-2 flex items-center gap-3">

                                <span className="h-1 w-8 rounded-full bg-purple-700" />

                                <span className="text-sm font-bold text-purple-700 sm:text-base">
                                    Who We Are
                                </span>

                            </div>

                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                CodeRwanda
                            </h2>

                            <p className="mt-4 text-sm leading-6 text-gray-600 sm:text-base">
                                CodeRwanda is a Rwandan technology company committed
                                to bridging the gap between technology and opportunity.
                                We provide innovative technology solutions,
                                comprehensive training, and expert consulting services
                                that empower individuals and businesses to thrive in
                                the digital age.
                            </p>

                            <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
                                With over 2 years of experience, we've helped
                                <strong className="font-bold text-gray-800">
                                    {' '}100+ clients
                                </strong>{' '}
                                achieve digital transformation and trained
                                <strong className="font-bold text-gray-800">
                                    {' '}500+ young Rwandans
                                </strong>{' '}
                                in modern technology skills.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3">

                                <Link
                                    to="/contact"
                                    className="group inline-flex items-center gap-2 rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-purple-800"
                                >
                                    Learn More
                                    <i className="fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-1" />
                                </Link>

                                <Link
                                    to="/services"
                                    className="inline-flex items-center gap-2 rounded-lg border border-purple-700 px-5 py-2.5 text-sm font-semibold text-purple-700 transition-all duration-300 hover:bg-purple-700 hover:text-white"
                                >
                                    Our Services
                                </Link>

                            </div>

                        </div>


                        {/* Image */}
                        <div className="relative">

                            <div className="absolute -inset-2 rounded-3xl bg-purple-100/70 blur-xl" />

                            <img
                                src={aboutTeam}
                                alt="CodeRwanda team"
                                className="relative h-[280px] w-full rounded-2xl object-cover shadow-sm sm:h-[350px] lg:h-[320px]"
                            />

                        </div>

                    </div>

                </section>


                {/* =================================================
            STATISTICS
        ================================================== */}
                <section className="pb-12">

                    <div className="grid overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 via-fuchsia-50 to-purple-50 sm:grid-cols-2 lg:grid-cols-4">

                        {stats.map((stat, index) => (
                            <div
                                key={stat.label}
                                className={`flex items-center gap-4 px-6 py-6 lg:px-7 ${index !== stats.length - 1
                                    ? 'border-b border-purple-200 sm:border-r lg:border-b-0'
                                    : ''
                                    }`}
                            >

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                                    <i className={`${stat.icon} text-xl`} />
                                </div>

                                <div>

                                    <div className="text-2xl font-extrabold text-slate-900">
                                        {stat.number}
                                    </div>

                                    <div className="text-xs font-medium text-gray-600">
                                        {stat.label}
                                    </div>

                                </div>

                            </div>
                        ))}

                    </div>

                </section>


                {/* =================================================
            MISSION + VISION
        ================================================== */}
                <section className="py-6 sm:py-10">

                    <div className="grid gap-6 lg:grid-cols-2">

                        {/* Mission */}
                        <div className="group relative overflow-hidden rounded-2xl bg-purple-50">

                            <div className="grid min-h-[230px] sm:min-h-[250px] sm:grid-cols-2">

                                <div className="relative min-h-[200px] sm:min-h-full">
                                    <img
                                        src={missionImage}
                                        alt="Our mission"
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />

                                    <div className="absolute inset-0 bg-purple-800/40 transition-all duration-500 group-hover:bg-purple-800/20" />
                                </div>

                                <div className="flex flex-col justify-center p-2 sm:p-7">

                                    <div className="flex items-center gap-3 text-purple-700">

                                        <i className="fa-solid fa-bullseye text-2xl" />

                                        <h3 className="text-xl font-extrabold sm:text-2xl">
                                            Our Mission
                                        </h3>

                                    </div>

                                    <p className="mt-4 text-sm leading-6 text-gray-700">
                                        At CodeRwanda, our mission is to bridge the gap
                                        between technology and opportunity in Rwanda. We
                                        strive to deliver cutting-edge solutions and
                                        empower individuals and businesses with the skills
                                        needed to thrive in the digital age.
                                    </p>

                                    <span className="mt-4 h-1 w-10 rounded-full bg-purple-700" />

                                </div>

                            </div>

                        </div>


                        {/* Vision */}
                        <div className="group relative overflow-hidden rounded-2xl bg-purple-50">

                            <div className="grid min-h-[230px] sm:min-h-[250px] sm:grid-cols-2">

                                <div className="relative order-2 min-h-[200px] sm:order-1 sm:min-h-full">

                                    <img
                                        src={visionImage}
                                        alt="Our vision"
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />

                                    <div className="absolute inset-0 bg-purple-900/25 transition-all duration-500 group-hover:bg-purple-900/10" />

                                </div>

                                <div className="order-1 flex flex-col justify-center p-6 sm:order-2 sm:p-7">

                                    <div className="flex items-center gap-3 text-purple-700">

                                        <i className="fa-solid fa-eye text-2xl" />

                                        <h3 className="text-xl font-extrabold sm:text-2xl">
                                            Our Vision
                                        </h3>

                                    </div>

                                    <p className="mt-4 text-sm leading-6 text-gray-700">
                                        To be Rwanda's leading technology partner,
                                        recognized for excellence, innovation, and impact
                                        in building a digitally empowered nation.
                                    </p>

                                    <span className="mt-4 h-1 w-10 rounded-full bg-purple-700" />

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
            CORE VALUES
        ================================================== */}
                <section className="py-12 sm:py-16">

                    <div className="mb-8 text-center">

                        <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                            Our Core Values
                        </h2>

                        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-purple-700" />

                    </div>


                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

                        {coreValues.map((value) => (
                            <div
                                key={value.title}
                                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100"
                            >

                                <div className="relative h-32 overflow-hidden">

                                    <img
                                        src={value.image}
                                        
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />

                                    <div className="absolute inset-0 bg-purple-900/10" />

                                </div>

                                <div className="px-5 py-5 text-center">

                                    <h3 className="text-base font-bold text-slate-900">
                                        {value.title}
                                    </h3>

                                    <p className="mt-3 text-xs leading-5 text-gray-600">
                                        {value.description}
                                    </p>

                                </div>

                            </div>
                        ))}

                    </div>

                </section>


                {/* =================================================
            IMPACT
        ================================================== */}
                <section className="py-8 pb-16 sm:py-12">

                    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">

                        {/* Image */}
                        <div className="relative overflow-hidden rounded-2xl">

                            <img
                                src={impactImage}
                                alt="CodeRwanda impact"
                                className="h-[280px] w-full object-cover sm:h-[350px] lg:h-[320px]"
                            />

                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 to-transparent" />

                        </div>


                        {/* Content */}
                        <div>

                            <div className="flex items-center gap-3">

                                <div>
                                    <span className="block h-1 w-8 rounded-full bg-purple-700" />

                                    <span className="mt-2 block h-1 w-4 rounded-full bg-purple-300" />
                                </div>

                                <h2 className="text-2xl font-extrabold text-purple-700 sm:text-3xl">
                                    Our Impact
                                </h2>

                            </div>

                            <p className="mt-5 text-sm leading-7 text-gray-600 sm:text-base">
                                Through technology development, training and digital
                                solutions, we are creating meaningful opportunities
                                and contributing to Rwanda's digital transformation.
                            </p>

                            <ul className="mt-6 space-y-4">

                                <li className="flex items-start gap-3">

                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-700 text-white">
                                        <i className="fa-solid fa-check text-[9px]" />
                                    </span>

                                    <span className="text-sm font-medium text-gray-700">
                                        Empowering Rwandan youth with in-demand tech skills
                                    </span>

                                </li>

                                <li className="flex items-start gap-3">

                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white">
                                        <i className="fa-solid fa-check text-[9px]" />
                                    </span>

                                    <span className="text-sm font-medium text-gray-700">
                                        Helping businesses digitize and grow
                                    </span>

                                </li>

                                <li className="flex items-start gap-3">

                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-700 text-white">
                                        <i className="fa-solid fa-check text-[9px]" />
                                    </span>

                                    <span className="text-sm font-medium text-gray-700">
                                        Contributing to a smart and innovative Rwanda
                                    </span>

                                </li>

                            </ul>

                        </div>

                    </div>

                </section>


                {/* =================================================
            FINAL CTA
        ================================================== */}
                <section className="mb-16 overflow-hidden rounded-2xl bg-purple-800">

                    <div className="flex flex-col gap-7 px-7 py-4 sm:px-10 sm:py-9 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex items-center gap-5">

                            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white sm:flex">
                                <i className="fa-solid fa-rocket text-xl" />
                            </div>

                            <div>

                                <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                                    Ready to build something amazing with us?
                                </h2>

                                <p className="mt-1 text-sm text-purple-100 sm:text-base">
                                    Let's turn your idea into reality.
                                </p>

                            </div>

                        </div>


                        <Link
                            to="/contact"
                            className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-lg bg-white px-7 py-3 text-sm font-bold text-purple-700 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                            Get Started

                            <i className="fa-solid fa-arrow-right text-xs transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>

                    </div>

                </section>

            </div>
            <Footer />
        </main>
    )
}