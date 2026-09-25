import { Link } from 'react-router-dom'
import logo from '../assets/CODERWANDA.png'

const socials = [
  {
    icon: 'fa-brands fa-facebook-f',
    href: '#',
    label: 'Facebook',
  },
  {
    icon: 'fa-brands fa-twitter',
    href: '#',
    label: 'Twitter',
  },
  {
    icon: 'fa-brands fa-linkedin-in',
    href: '#',
    label: 'LinkedIn',
  },
  {
    icon: 'fa-brands fa-instagram',
    href: '#',
    label: 'Instagram',
  },
]

const quickLinks = [
  ['/', 'Home'],
  ['/services', 'Services'],
  ['/shop', 'E-Commerce'],
  ['/training', 'Training Room'],
  ['/about', 'About Us'],
  ['/contact', 'Contact Us'],
]

const ourServices = [
  'Technology Development',
  'Training Programs',
  'Website Development',
  'Consulting Services',
  'Hosting Services',
  'More Services',
]

const contactInfo = [
  {
    icon: 'fa-solid fa-location-dot',
    text: 'Musanze, Rwanda',
  },
  {
    icon: 'fa-solid fa-phone',
    text: '0781 257 942 / 0792 982 669',
  },
  {
    icon: 'fa-solid fa-envelope',
    text: 'info@coderwanda.rw',
  },
  {
    icon: 'fa-regular fa-clock',
    text: 'Mon - Fri: 8AM - 6PM',
  },
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#090713] text-gray-400">

      {/* Subtle background glow */}
      <div className="pointer-events-none absolute -left-40 top-10 h-72 w-72 rounded-full bg-purple-700/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-8">

        {/* Main footer */}
        <div className="grid gap-12 border-b border-white/[0.08] pb-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">

          {/* ================================
              BRAND
          ================================= */}
          <div className="lg:col-span-4">

            <Link
              to="/"
              className="inline-flex items-center"
            >
              <img
                src={logo}
                alt="CodeRwanda"
                className="h-14 w-auto object-contain"
              />
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-gray-400">
              Empowering Rwanda through technology, innovation,
              training, digital solutions and quality technology
              products.
            </p>

            {/* Social media */}
            <div className="mt-6 flex gap-2.5">

              {socials.map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-gray-400 transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-500/40 hover:bg-fuchsia-500 hover:text-white"
                >
                  <i className={`${icon} text-xs`} />
                </a>
              ))}

            </div>

          </div>


          {/* ================================
              QUICK LINKS
          ================================= */}
          <div className="lg:col-span-2">

            <h4 className="mb-5 text-sm font-semibold text-white">
              Quick Links
            </h4>

            <ul className="space-y-3">

              {quickLinks.map(([to, label]) => (
                <li key={label}>

                  <Link
                    to={to}
                    className="group flex items-center text-sm text-gray-400 transition-colors duration-200 hover:text-fuchsia-400"
                  >
                    <span className="mr-2 h-px w-0 bg-fuchsia-400 transition-all duration-300 group-hover:w-3" />

                    {label}
                  </Link>

                </li>
              ))}

            </ul>

          </div>


          {/* ================================
              SERVICES
          ================================= */}
          <div className="lg:col-span-3">

            <h4 className="mb-5 text-sm font-semibold text-white">
              Our Services
            </h4>

            <ul className="space-y-3">

              {ourServices.map((service) => (
                <li key={service}>

                  <Link
                    to="/services"
                    className="group flex items-center text-sm text-gray-400 transition-colors duration-200 hover:text-fuchsia-400"
                  >
                    <span className="mr-2 h-px w-0 bg-fuchsia-400 transition-all duration-300 group-hover:w-3" />

                    {service}
                  </Link>

                </li>
              ))}

            </ul>

          </div>


          {/* ================================
              CONTACT
          ================================= */}
          <div className="lg:col-span-3">

            <h4 className="mb-5 text-sm font-semibold text-white">
              Contact Info
            </h4>

            <ul className="space-y-4">

              {contactInfo.map(({ icon, text }) => (
                <li
                  key={text}
                  className="group flex items-start gap-3"
                >

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 transition-all duration-300 group-hover:bg-purple-500 group-hover:text-white">
                    <i className={`${icon} text-xs`} />
                  </span>

                  <span className="pt-1 text-sm leading-5 text-gray-400 transition-colors duration-200 group-hover:text-gray-200">
                    {text}
                  </span>

                </li>
              ))}

            </ul>

          </div>

        </div>


        {/* ================================
            BOTTOM
        ================================= */}
        <div className="flex flex-col gap-3 pt-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © {new Date().getFullYear()} CodeRwanda. All rights reserved.
          </p>

          <p className="flex items-center gap-1.5">
            Made with
            <i className="fa-solid fa-heart text-[10px] text-red-500" />
            in Rwanda 🇷🇼
          </p>

        </div>

      </div>
    </footer>
  )
}