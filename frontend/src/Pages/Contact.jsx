import useRemote from '../Utils/useRemote';
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import api from '../Utils/api'





const faqs = [
    'How long does it take to get a response?',
    'What services do you offer?',
    'Do you work with startups?',
    'How can we get started?',
]

export default function Contact() {
    const settings = useRemote('/settings', null);
    const contactInfo = settings.data ? [
      { icon: 'fa-solid fa-location-dot', title: 'Our Location', value: settings.data.address },
      { icon: 'fa-solid fa-phone', title: 'Call Us', value: settings.data.phone },
      { icon: 'fa-solid fa-envelope', title: 'Email Us', value: settings.data.contact_email },
      { icon: 'fa-regular fa-clock', title: 'Working Hours', value: settings.data.hours },
    ] : [];
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    })

    const [openFaq, setOpenFaq]       = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [submitMsg, setSubmitMsg]   = useState('')
    const [submitErr, setSubmitErr]   = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitMsg('')
        setSubmitErr('')
        setSubmitting(true)

        try {
            const { data } = await api.post('/contact', formData)
            setSubmitMsg(data.message)
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
        } catch (err) {
            setSubmitErr(err.response?.data?.error || 'Failed to send message. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main className="bg-white text-slate-900">
            <Navbar />
            {/* =====================================================
          HERO
      ====================================================== */}
            <section className="relative overflow-hidden bg-[#09071c]">

                {/* Background effects */}
                <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-purple-700/20 blur-[120px]" />

                <div className="absolute right-0 top-10 h-[500px] w-[500px] rounded-full bg-fuchsia-600/15 blur-[140px]" />

                {/* Network pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.8)_1px,transparent_1px)] [background-size:45px_45px]" />
                </div>

                <div className="relative mx-auto max-w-7xl px-6 py-5 lg:px-8 lg:py-5">

                    <div className="grid items-center gap-2 lg:grid-cols-2">

                        {/* Hero text */}
                        <div>

                            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-400">
                                Get In Touch
                            </span>

                            <h1 className="mt-4 max-w-2xl text-3xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-3xl lg:text-5xl">

                                Let's Build Something

                                <span className="block bg-purple-700 bg-clip-text text-transparent">
                                    Amazing Together
                                </span>

                            </h1>

                            <p className="mt-6 max-w-xl text-sm leading-7 text-gray-300 sm:text-base">
                                Have a project in mind, need consultation, or want to
                                learn more about our services? We'd love to hear from you.
                            </p>


                            {/* Trust points */}
                            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">

                                <div className="flex items-start gap-3">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/10 text-purple-300">
                                        <i className="fa-solid fa-bolt" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-white">
                                            Fast Response
                                        </h3>

                                        <p className="mt-1 text-xs leading-5 text-gray-400">
                                            We respond within 24 hours.
                                        </p>
                                    </div>

                                </div>


                                <div className="flex items-start gap-3">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/10 text-purple-300">
                                        <i className="fa-solid fa-handshake" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-white">
                                            Trusted Partner
                                        </h3>

                                        <p className="mt-1 text-xs leading-5 text-gray-400">
                                            100+ businesses trust us.
                                        </p>
                                    </div>

                                </div>


                                <div className="flex items-start gap-3">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/10 text-purple-300">
                                        <i className="fa-solid fa-headset" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-white">
                                            Expert Support
                                        </h3>

                                        <p className="mt-1 text-xs leading-5 text-gray-400">
                                            Our team is ready to help.
                                        </p>
                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* Hero visual */}
                        <div className="relative hidden min-h-[360px] lg:block">

                            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/20 blur-3xl" />

                            {/* Orbit */}
                            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-400/20" />

                            <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-400/10" />


                            {/* Email center */}
                            <div className="absolute left-1/2 top-1/2 flex h-28 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-fuchsia-300/40 bg-gradient-to-br from-purple-500/40 to-fuchsia-500/20 shadow-2xl shadow-purple-900/50 backdrop-blur-md">

                                <i className="fa-regular fa-envelope text-6xl text-white" />

                            </div>


                            {/* Phone */}
                            <div className="absolute left-[10%] top-[15%] flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-300/30 bg-purple-500/20 text-2xl text-white shadow-lg backdrop-blur-md">
                                <i className="fa-solid fa-phone" />
                            </div>


                            {/* Chat */}
                            <div className="absolute right-[8%] top-[12%] flex h-16 w-16 items-center justify-center rounded-2xl border border-fuchsia-300/30 bg-fuchsia-500/20 text-2xl text-white shadow-lg backdrop-blur-md">
                                <i className="fa-solid fa-comments" />
                            </div>


                            {/* Location */}
                            <div className="absolute right-[10%] bottom-[15%] flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-300/30 bg-purple-500/20 text-2xl text-white shadow-lg backdrop-blur-md">
                                <i className="fa-solid fa-location-dot" />
                            </div>

                        </div>

                    </div>

                </div>
            </section>


            {/* =====================================================
          CONTACT + FORM
      ====================================================== */}
            <section className="relative py-3 sm:py-6">

                <div className="mx-auto max-w-7xl px-6 lg:px-8">

                    <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">


                        {/* ================================================
                LEFT CONTACT INFORMATION
            ================================================= */}
                        <div>

                            <span className="text-sm font-bold uppercase tracking-wider text-purple-700">
                                Send Us A Message
                            </span>

                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">

                                We're Here to{' '}

                                <span className="text-purple-700">
                                    Help
                                </span>

                            </h2>

                            <p className="mt-4 max-w-md text-sm leading-6 text-gray-600">
                                Fill out the form and our team will get back to you
                                as soon as possible.
                            </p>


                            {/* Contact cards */}
                            <div className="mt-7 space-y-3">

                                {contactInfo.map((item) => (
                                    <div
                                        key={item.title}
                                        className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:border-purple-200 hover:shadow-md hover:shadow-purple-100"
                                    >

                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 transition-colors duration-300 group-hover:bg-purple-700 group-hover:text-white">
                                            <i className={`${item.icon} text-sm`} />
                                        </div>

                                        <div className="min-w-0">

                                            <h3 className="text-sm font-bold text-slate-900">
                                                {item.title}
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {item.value}
                                            </p>

                                            {item.extra && (
                                                <p className="mt-0.5 text-xs text-gray-400">
                                                    {item.extra}
                                                </p>
                                            )}

                                        </div>

                                    </div>
                                ))}

                            </div>


                            {/* Talk card */}
                            <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#180044] to-purple-800 p-6 text-white">

                                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-fuchsia-500/20 blur-2xl" />

                                <div className="relative">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                                            <i className="fa-solid fa-headset" />
                                        </div>

                                        <h3 className="font-bold">
                                            Prefer to talk?
                                        </h3>

                                    </div>

                                    <p className="mt-3 text-sm leading-6 text-purple-100">
                                        Let's discuss your project directly with our experts.
                                    </p>

                                    <a
                                        href="tel:+250781257942"
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-50"
                                    >
                                        <i className="fa-solid fa-phone" />
                                        Schedule a Call
                                    </a>

                                </div>

                            </div>

                        </div>


                        {/* ================================================
                FORM
            ================================================= */}
                        <div className="relative">

                            {/* subtle background */}
                            <div className="absolute -inset-3 rounded-3xl bg-purple-100/40 blur-xl" />

                            <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-purple-100/40 sm:p-8 lg:p-10">

                                {/* Form header */}
                                <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-center sm:justify-between">

                                    <div>

                                        <h2 className="text-2xl font-bold text-slate-900">
                                            Send us a message
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Tell us about your project or inquiry.
                                        </p>

                                    </div>

                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">

                                        <i className="fa-solid fa-shield-halved text-purple-600" />

                                        Your information is safe with us

                                    </div>

                                </div>


                                {/* Form */}
                                <form
                                    onSubmit={handleSubmit}
                                    className="mt-2 space-y-5 shadow-lg shadow-purple-950 p-8 rounded-lg"
                                >

                                    {submitMsg && (
                                        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                                            {submitMsg}
                                        </div>
                                    )}

                                    {submitErr && (
                                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                            {submitErr}
                                        </div>
                                    )}

                                    {/* Name + Email */}
                                    <div className="grid gap-5 sm:grid-cols-2">

                                        <div>
                                            <label
                                                htmlFor="name"
                                                className="mb-2 block text-sm font-semibold text-slate-700"
                                            >
                                                Full Name
                                                <span className="ml-1 text-red-500">*</span>
                                            </label>

                                            <div className="relative">

                                                <i className="fa-regular fa-user pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400" />

                                                <input
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Enter your full name"
                                                    className="w-full rounded-xl border border-purple-400 bg-gray-50/50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                                                />

                                            </div>
                                        </div>


                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="mb-2 block text-sm font-semibold text-slate-700"
                                            >
                                                Email Address
                                                <span className="ml-1 text-red-500">*</span>
                                            </label>

                                            <div className="relative">

                                                <i className="fa-regular fa-envelope pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400" />

                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="you@example.com"
                                                    className="w-full rounded-xl border border-purple-400 bg-gray-50/50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                                                />

                                            </div>
                                        </div>

                                    </div>


                                    {/* Phone + Subject */}
                                    <div className="grid gap-5 sm:grid-cols-2">

                                        <div>

                                            <label
                                                htmlFor="phone"
                                                className="mb-2 block text-sm font-semibold text-slate-700"
                                            >
                                                Phone Number
                                            </label>

                                            <div className="relative">

                                                <i className="fa-solid fa-phone pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400" />

                                                <input
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+250 7XX XXX XXX"
                                                    className="w-full rounded-xl border border-purple-400 bg-gray-50/50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                                                />

                                            </div>

                                        </div>


                                        <div>

                                            <label
                                                htmlFor="subject"
                                                className="mb-2 block text-sm font-semibold text-slate-700"
                                            >
                                                Subject
                                                <span className="ml-1 text-red-500">*</span>
                                            </label>

                                            <div className="relative">

                                                <i className="fa-solid fa-tag pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400" />

                                                <input
                                                    id="subject"
                                                    name="subject"
                                                    type="text"
                                                    required
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    placeholder="How can we help?"
                                                    className="w-full rounded-xl border border-purple-400 bg-gray-50/50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                                                />

                                            </div>

                                        </div>

                                    </div>


                                    {/* Message */}
                                    <div>

                                        <label
                                            htmlFor="message"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Your Message
                                            <span className="ml-1 text-red-500">*</span>
                                        </label>

                                        <div className="relative">

                                            <i className="fa-regular fa-pen-to-square pointer-events-none absolute left-4 top-4 text-sm text-gray-400" />

                                            <textarea
                                                id="message"
                                                name="message"
                                                rows="7"
                                                required
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="Tell us about your project, requirements, budget, timeline, or any questions you have..."
                                                className="w-full resize-none rounded-xl border border-purple-400 bg-gray-50/50 py-3.5 pl-11 pr-4 text-sm leading-6 text-slate-900 outline-none transition-all placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
                                            />

                                        </div>

                                        <p className="mt-2 text-xs text-gray-400">
                                            Please provide as much detail as possible so we
                                            can better understand your request.
                                        </p>

                                    </div>


                                    {/* Submit */}
                                    <div className="flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                                        <p className="flex items-center gap-2 text-xs text-gray-500">

                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                                <i className="fa-solid fa-check text-[8px]" />
                                            </span>

                                            We typically respond within 24 hours.

                                        </p>

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="group inline-flex items-center justify-center gap-3 rounded-xl bg-purple-700 hover:bg-fuchsia-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-700/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-700/30 disabled:opacity-60"
                                        >
                                            {submitting ? 'Sending...' : 'Send Message'}

                                            {!submitting && (
                                                <i className="fa-regular fa-paper-plane text-xs transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                                            )}
                                        </button>

                                    </div>

                                </form>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
          FAQ + OFFICE
      ====================================================== */}
            <section className="py-3 sm:py-6">

                <div className="mx-auto max-w-7xl px-6 lg:px-8">

                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">


                        {/* FAQ */}
                        <div>

                            <span className="text-sm font-bold uppercase tracking-wider text-purple-700">
                                Quick Answers
                            </span>

                            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
                                Frequently Asked
                                <span className="block text-purple-700">
                                    Questions
                                </span>
                            </h2>


                            <div className="mt-7 space-y-3">

                                {faqs.map((question, index) => (
                                    <div
                                        key={question}
                                        className="overflow-hidden rounded-xl border border-gray-200"
                                    >

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenFaq(openFaq === index ? null : index)
                                            }
                                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-slate-800 transition-colors hover:bg-purple-50"
                                        >

                                            <span>
                                                {question}
                                            </span>

                                            <i
                                                className={`fa-solid fa-chevron-down shrink-0 text-xs text-purple-600 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''
                                                    }`}
                                            />

                                        </button>

                                        <div
                                            className={`grid transition-all duration-300 ${openFaq === index
                                                ? 'grid-rows-[1fr]'
                                                : 'grid-rows-[0fr]'
                                                }`}
                                        >

                                            <div className="overflow-hidden">

                                                <p className="border-t border-gray-100 px-5 py-4 text-sm leading-6 text-gray-500">
                                                    Our team will be happy to discuss this with you.
                                                    Contact us and we will provide the information
                                                    specific to your needs.
                                                </p>

                                            </div>

                                        </div>

                                    </div>
                                ))}

                            </div>

                        </div>


                        {/* Office / Map */}
                        <div>

                            <div className="relative h-full min-h-[400px] overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">

                                {/* Map-like background */}
                                <div className="absolute inset-0 bg-[#eef4ef]">

                                    <div className="absolute left-[10%] top-[20%] h-px w-[80%] rotate-12 bg-white shadow-sm" />

                                    <div className="absolute left-[5%] top-[45%] h-px w-[90%] -rotate-6 bg-white shadow-sm" />

                                    <div className="absolute left-[20%] top-[70%] h-px w-[75%] rotate-12 bg-white shadow-sm" />

                                    <div className="absolute left-[35%] top-[0%] h-full w-px rotate-[12deg] bg-white shadow-sm" />

                                    <div className="absolute left-[65%] top-[0%] h-full w-px -rotate-[8deg] bg-white shadow-sm" />

                                    <div className="absolute left-[45%] top-[40%] h-28 w-28 rounded-full bg-green-200/40" />

                                    <div className="absolute left-[10%] top-[65%] h-32 w-32 rounded-full bg-green-200/30" />

                                    <div className="absolute right-[5%] top-[10%] h-40 w-40 rounded-full bg-green-200/30" />

                                </div>


                                {/* Office card */}
                                <div className="absolute left-5 top-5 max-w-xs rounded-xl border border-white/80 bg-white/95 p-5 shadow-xl backdrop-blur-sm sm:left-7 sm:top-7">

                                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                                        Visit Our Office
                                    </span>

                                    <h3 className="mt-2 text-lg font-bold text-slate-900">
                                        CodeRwanda
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-gray-500">
                                        We'd love to meet you in person and discuss how we
                                        can help bring your ideas to life.
                                    </p>

                                    <a
                                        href="https://maps.google.com/?q=Musanze,Rwanda"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-purple-600 px-4 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-700 hover:text-white"
                                    >
                                        Get Directions
                                        <i className="fa-solid fa-arrow-right" />
                                    </a>

                                </div>


                                {/* Location marker */}
                                <div className="absolute left-[65%] top-[52%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-700 text-white shadow-xl shadow-purple-700/40">
                                        <i className="fa-solid fa-location-dot" />
                                    </div>

                                    <span className="mt-2 rounded-md bg-white px-3 py-1 text-xs font-bold text-slate-800 shadow-md">
                                        Musanze
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
          FINAL CTA
      ====================================================== */}
            <section className="pb-16">

                <div className="mx-auto max-w-7xl px-6 lg:px-8">

                    <div className="overflow-hidden rounded-2xl bg-purple-900">

                        <div className="flex flex-col gap-6 px-7 py-8 sm:px-10 lg:flex-row lg:items-center lg:justify-between">

                            <div className="flex items-center gap-4">

                                <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white sm:flex">
                                    <i className="fa-regular fa-paper-plane text-xl" />
                                </div>

                                <div>

                                    <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                                        Ready to start your project?
                                    </h2>

                                    <p className="mt-1 text-sm text-purple-100">
                                        Let's turn your ideas into reality. Get in touch today.
                                    </p>

                                </div>

                            </div>

                            <Link
                                to="/services"
                                className="group inline-flex items-center justify-center gap-3 rounded-lg bg-white px-7 py-3 text-sm font-bold text-purple-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                Start Your Project

                                <i className="fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-1" />
                            </Link>

                        </div>

                    </div>

                </div>

            </section>
            <Footer />
        </main>
    )
}