import useRemote from '../Utils/useRemote';
import DataState from '../Components/DataState';
import { useEffect, useMemo, useState } from 'react'
import api from '../Utils/api'
import { Link } from 'react-router-dom'
import Navbar from '../Components/Navbar'
import service from '../assets/service.png'
import Footer from '../Components/Footer'


// ============================================================
// SERVICE DATA
// ============================================================

export default function Services() {
    const remote = useRemote('/services');
    const services = useMemo(() => remote.data.map(item => ({ ...item, shortDescription: item.short_description })), [remote.data]);
    const categories = [{ name: 'All Services', icon: 'fa-solid fa-layer-group' }, ...Array.from(new Set(services.map(item => item.category))).map(name => ({ name, icon: 'fa-solid fa-code' }))];

    const [activeCategory, setActiveCategory] = useState('All Services')

    const [currentPage, setCurrentPage] = useState(1)

    const [selectedService, setSelectedService] = useState(null)

    const servicesPerPage = 6


    // ==========================================================
    // FILTER SERVICES
    // ==========================================================

    const filteredServices = useMemo(() => {

        if (activeCategory === 'All Services') {
            return services
        }

        return services.filter(
            service => service.category === activeCategory
        )

    }, [activeCategory, services])


    // ==========================================================
    // PAGINATION
    // ==========================================================

    const totalPages = Math.ceil(
        filteredServices.length / servicesPerPage
    )

    const startIndex =
        (Math.min(currentPage, Math.max(1, totalPages)) - 1) * servicesPerPage

    const currentServices = filteredServices.slice(
        startIndex,
        startIndex + servicesPerPage
    )


    // ==========================================================
    // CHANGE CATEGORY
    // ==========================================================

    const handleCategoryChange = (category) => {

        setActiveCategory(category)

        setCurrentPage(1)

        window.scrollTo({
            top: 500,
            behavior: 'smooth',
        })
    }


    // ==========================================================
    // CHANGE PAGE
    // ==========================================================

    const changePage = (page) => {

        if (page < 1 || page > totalPages) {
            return
        }

        setCurrentPage(page)

        window.scrollTo({
            top: 650,
            behavior: 'smooth',
        })
    }


    // ==========================================================
    // ESCAPE KEY FOR MODAL
    // ==========================================================

    useEffect(() => {

        const handleKeyDown = (event) => {

            if (event.key === 'Escape') {
                setSelectedService(null)
            }

        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }

    }, [])


    return (

        <main className="min-h-screen bg-white text-slate-900">

            <Navbar />
            <DataState {...remote} empty={!remote.data.length} label="services" />
            {/* ======================================================
            HERO
      ======================================================= */}

            <section className="relative overflow-hidden bg-[#070617]">

                {/* Glow */}
                <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-purple-700/20 blur-[130px]" />

                <div className="absolute right-0 top-10 h-[500px] w-[500px] rounded-full bg-fuchsia-600/20 blur-[130px]" />


                {/* Grid */}
                <div className="absolute inset-0 opacity-20">

                    <div
                        className="
              h-full
              w-full
              bg-[linear-gradient(rgba(139,92,246,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.12)_1px,transparent_1px)]
              bg-[size:50px_50px]
            "
                    />

                </div>


                <div className="relative mx-auto max-w-7xl px-6 py-5 lg:px-8 lg:py-5">

                    <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.95fr]">


                        {/* Hero content */}

                        <div>

                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-fuchsia-400">
                                Our Services
                            </p>


                            <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-3xl lg:text-[46px]">

                                Technology Solutions that

                                <span className="block">
                                    

                                    <span className="text-fuchsia-800">
                                        Move Rwanda Forward
                                    </span>

                                </span>

                            </h1>


                            <p className="mt-6 max-w-xl text-sm leading-7 text-gray-300 sm:text-base">

                                We provide innovative technology solutions, expert
                                consulting, and practical training to empower
                                individuals and businesses in the digital age.

                            </p>


                            <button
                                type='button'
                                onClick={() => {
                                    document
                                        .getElementById('services')
                                        ?.scrollIntoView({
                                            behavior: 'smooth',
                                        })
                                }}
                                className="group mt-7 inline-flex items-center gap-3 rounded-lg bg-purple-800  px-6 py-3 text-sm font-bold  text-white shadow-lg shadow-purple-900/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

                                Explore Our Services

                                <i className="fa-solid fa-arrow-right text-xs transition-transform duration-300 group-hover:translate-x-1" />
                            </button>


                            {/* Hero trust points */}

                            <div className="mt-9 grid gap-5 sm:grid-cols-3">

                                <HeroPoint
                                    icon="fa-solid fa-lightbulb"
                                    title="Innovative Solutions"
                                    text="Cutting-edge technology"
                                />

                                <HeroPoint
                                    icon="fa-solid fa-user-tie"
                                    title="Expert Team"
                                    text="Experienced professionals"
                                />

                                <HeroPoint
                                    icon="fa-solid fa-medal"
                                    title="Quality & Reliability"
                                    text="Delivering excellence"
                                />

                            </div>

                        </div>


                        {/* Hero visual */}

                        <div className="relative hidden h-[420px] lg:block">

                            {/* Image */}

                            <img src={service} className='h-auto w-auto' />

                        </div>

                    </div>

                </div>

            </section>


            {/* ======================================================
          CATEGORIES
      ======================================================= */}

            <section className="py-4">

                <div className="mx-auto max-w-7xl px-6 lg:px-8">

                    <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                        Browse Services by Category
                    </h2>


                    <div className="mt-5 flex gap-3 overflow-x-auto pb-3 scrollbar-hide">

                        {categories.map((category) => {

                            const active =
                                activeCategory === category.name

                            return (

                                <button
                                    key={category.name}
                                    type="button"
                                    onClick={() =>
                                        handleCategoryChange(category.name)
                                    }
                                    className={`
                    flex
                    shrink-0
                    items-center
                    gap-2
                    rounded-lg
                    border
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    transition-all
                    duration-300

                    ${active
                                            ? 'border-purple-700 bg-purple-700 text-white shadow-lg shadow-purple-700/20'
                                            : 'border-gray-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700'
                                        }
                  `}
                                >

                                    <i className={`${category.icon} text-sm`} />

                                    {category.name}

                                </button>

                            )

                        })}

                    </div>

                </div>

            </section>





            {/* ======================================================
          SERVICES
      ======================================================= */}

            <section
                id="services"
                className="scroll-mt-20 pb-14"
            >

                <div className="mx-auto max-w-7xl px-6 lg:px-8">

                    {/* Empty state */}

                    {currentServices.length === 0 && (

                        <div className="rounded-2xl border border-gray-200 py-16 text-center">

                            <i className="fa-solid fa-folder-open text-4xl text-gray-300" />

                            <h3 className="mt-4 text-lg font-bold text-slate-800">
                                No services found
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                                Try selecting another category.
                            </p>

                        </div>

                    )}


                    {/* Service grid */}

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                        {currentServices.map((service) => (

                            <ServiceCard
                                key={service.id}
                                service={service}
                                onExplore={() =>
                                    setSelectedService(service)
                                }
                            />

                        ))}

                    </div>


                    {/* ==================================================
              PAGINATION
          =================================================== */}

                    {totalPages > 1 && (

                        <div className="mt-9 flex items-center justify-center gap-2">

                            {/* Previous */}

                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    changePage(currentPage - 1)
                                }
                                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-gray-200
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  text-gray-600
                  transition
                  hover:border-purple-300
                  hover:text-purple-700
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                            >

                                <i className="fa-solid fa-arrow-left" />

                                <span className="hidden sm:inline">
                                    Previous
                                </span>

                            </button>


                            {/* Page numbers */}

                            <div className="flex items-center gap-2">

                                {Array.from(
                                    { length: totalPages },
                                    (_, index) => index + 1
                                ).map((page) => (

                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => changePage(page)}
                                        className={`
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-lg
                      border
                      text-sm
                      font-bold
                      transition-all
                      duration-200

                      ${currentPage === page
                                                ? 'border-purple-700 bg-purple-700 text-white shadow-md shadow-purple-700/20'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:text-purple-700'
                                            }
                    `}
                                    >

                                        {page}

                                    </button>

                                ))}

                            </div>


                            {/* Next */}

                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    changePage(currentPage + 1)
                                }
                                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-gray-200
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  text-gray-600
                  transition
                  hover:border-purple-300
                  hover:text-purple-700
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                            >

                                <span className="hidden sm:inline">
                                    Next
                                </span>

                                <i className="fa-solid fa-arrow-right" />

                            </button>

                        </div>

                    )}

                </div>

            </section>


            {/* ======================================================
          CTA
      ======================================================= */}

            <section className="py-10">

                <div className="mx-auto max-w-7xl px-6 lg:px-8">

                    <div className="overflow-hidden rounded-2xl bg-purple-900 ">

                        <div className="flex flex-col gap-6 px-7 py-8 sm:px-10 lg:flex-row lg:items-center lg:justify-between">


                            <div className="flex items-center gap-4">

                                <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl text-white sm:flex">

                                    <i className="fa-solid fa-rocket" />

                                </div>


                                <div>

                                    <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                                        Ready to build something amazing?
                                    </h2>

                                    <p className="mt-1 text-sm text-purple-100">
                                        Let's work together to bring your ideas to life with technology.
                                    </p>

                                </div>

                            </div>


                            <Link
                                to="/contact"
                                className="
                  group
                  inline-flex
                  items-center
                  justify-center
                  gap-3
                  rounded-lg
                  bg-white
                  px-7
                  py-3
                  text-sm
                  font-bold
                  text-purple-700
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-xl
                "
                            >

                                Get Started Today

                                <i className="fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-1" />

                            </Link>

                        </div>

                    </div>

                </div>

            </section>


            {/* ======================================================
          SERVICE DETAIL MODAL
      ======================================================= */}

            {selectedService && (

                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    onMouseDown={(e) => {

                        if (e.target === e.currentTarget) {
                            setSelectedService(null)
                        }

                    }}
                >

                    <div
                        className="
              relative
              max-h-[90vh]
              w-full
              max-w-2xl
              overflow-y-auto
              rounded-2xl
              bg-white
              shadow-2xl
            "
                    >

                        {/* Close */}

                        <button
                            type="button"
                            onClick={() => setSelectedService(null)}
                            className="
                absolute
                right-4
                top-4
                z-10
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-black/50
                text-white
                backdrop-blur
                transition
                hover:bg-purple-700
              "
                            aria-label="Close"
                        >

                            <i className="fa-solid fa-xmark" />

                        </button>


                        {/* Image */}

                        <div className="relative h-52 sm:h-64">

                            <img
                                src={selectedService.image}
                                alt={selectedService.title}
                                className="h-full w-full object-cover"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                            <div className="absolute bottom-5 left-6 right-6">

                                <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">
                                    {selectedService.category}
                                </span>

                                <h2 className="mt-1 text-2xl font-extrabold text-white">
                                    {selectedService.title}
                                </h2>

                            </div>

                        </div>


                        {/* Content */}

                        <div className="p-6 sm:p-8">

                            <p className="text-sm leading-7 text-gray-600">
                                {selectedService.description}
                            </p>


                            <h3 className="mt-6 text-sm font-bold uppercase tracking-wider text-slate-900">
                                What we provide
                            </h3>


                            <div className="mt-4 grid gap-3 sm:grid-cols-2">

                                {selectedService.features.map((feature) => (

                                    <div
                                        key={feature}
                                        className="flex items-center gap-3 rounded-lg bg-purple-50 px-4 py-3"
                                    >

                                        <i className="fa-solid fa-check text-xs text-purple-700" />

                                        <span className="text-sm font-medium text-slate-700">
                                            {feature}
                                        </span>

                                    </div>

                                ))}

                            </div>


                            <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                                <Link
                                    to="/contact"
                                    onClick={() => setSelectedService(null)}
                                    className="
                    inline-flex
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-purple-700
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-purple-800
                  "
                                >

                                    Request This Service

                                    <i className="fa-solid fa-arrow-right text-xs" />

                                </Link>


                                <button
                                    type="button"
                                    onClick={() => setSelectedService(null)}
                                    className="
                    rounded-lg
                    border
                    border-gray-200
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-gray-600
                    transition
                    hover:bg-gray-50
                  "
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}
            <Footer />
        </main>
    )
}


// ============================================================
// HERO POINT
// ============================================================

function HeroPoint({ icon, title, text }) {

    return (

        <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-purple-400/40 bg-purple-500/10 text-purple-300">

                <i className={`${icon} text-xs`} />

            </div>


            <div>

                <h3 className="text-xs font-bold text-white">
                    {title}
                </h3>

                <p className="mt-0.5 text-[11px] text-gray-400">
                    {text}
                </p>

            </div>

        </div>

    )
}


// ============================================================
// SERVICE CARD
// ============================================================

function ServiceCard({ service, onExplore }) {

    return (

        <article
            className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-purple-200
        hover:shadow-xl
        hover:shadow-purple-100
      "
        >

            {/* Image */}

            <div className="relative h-48 overflow-hidden">

                <img
                    src={service.image}
                    alt={service.title}
                    loading="lazy"
                    className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-700
            group-hover:scale-105
          "
                />


                {/* Image overlay */}

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />


                {/* Category */}

                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-700 shadow-sm">

                    {service.category}

                </span>


                {/* Icon */}

                <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-700 text-white shadow-lg">

                    <i className={`${service.icon} text-sm`} />

                </div>

            </div>


            {/* Content */}

            <div className="p-5">

                <h3 className="text-lg font-extrabold leading-tight text-slate-900">

                    {service.title}

                </h3>


                <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">

                    {service.shortDescription}

                </p>


                <button
                    type="button"
                    onClick={onExplore}
                    className="
            group/button
            mt-5
            inline-flex
            items-center
            gap-2
            text-sm
            font-bold
            text-purple-700
            transition-colors
            hover:text-purple-900
          "
                >

                    Explore Service

                    <i className="fa-solid fa-arrow-right text-xs transition-transform duration-200 group-hover/button:translate-x-1" />

                </button>

            </div>

        </article>

    )
}


// ============================================================
// WHY CARD
// ============================================================

function WhyCard({ icon, title, text }) {

    return (

        <div className="flex gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700">

                <i className={`${icon} text-sm`} />

            </div>


            <div>

                <h3 className="text-sm font-bold text-purple-800">
                    {title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                    {text}
                </p>

            </div>

        </div>

    )
}