import { getCartCount } from '../Utils/Cart';
import { Link, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import logo from '../assets/CODERWANDA.png'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/ecommerce', label: 'E-Commerce' },
  { to: '/training', label: 'Training Room' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
]

export default function Navbar() {
  const [cartCount, setCartCount] = useState(getCartCount)
  const [mobileOpen, setMobileOpen] = useState(false)

  const updateCartCount = () => setCartCount(getCartCount())

  // -----------------------------------------
  // Listen for cart updates
  // -----------------------------------------
  useEffect(() => {
    window.addEventListener('cartUpdated', updateCartCount)
    window.addEventListener('storage', updateCartCount)

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount)
      window.removeEventListener('storage', updateCartCount)
    }
  }, [])

  const closeMobile = () => {
    setMobileOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="flex min-h-[68px] items-center justify-between">

          {/* =================================================
              LOGO
          ================================================= */}
          <Link
            to="/"
            onClick={closeMobile}
            className="flex shrink-0 items-center"
          >
            <img
              src={logo}
              alt="CodeRwanda Tech"
              className="h-10 w-auto object-contain sm:h-11 md:h-12"
            />
          </Link>


          {/* =================================================
              DESKTOP NAV
          ================================================= */}
          <div className="hidden lg:flex lg:items-center">

            <ul className="flex items-center gap-7 xl:gap-8">

              {navLinks.map(({ to, label }) => (

                <li key={to}>

                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) => `
                      group
                      relative
                      inline-flex
                      items-center
                      py-6
                      text-[13px]
                      font-semibold
                      transition-colors
                      duration-200
                      ${isActive
                        ? 'text-purple-700'
                        : 'text-gray-700 hover:text-purple-700'
                      }
                    `}
                  >

                    {label}

                    <span
                      className="
                        absolute
                        bottom-0
                        left-1/2
                        h-[2px]
                        w-0
                        -translate-x-1/2
                        rounded-full
                        bg-purple-700
                        transition-all
                        duration-300
                        group-hover:w-full
                      "
                    />

                  </NavLink>

                </li>

              ))}

            </ul>

          </div>


          {/* =================================================
              DESKTOP ACTIONS
          ================================================= */}
          <div className="hidden items-center gap-3 lg:flex">

            {/* Search */}
            <Link
              to="/ecommerce"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-gray-200
                text-gray-700
                transition
                hover:border-purple-200
                hover:bg-purple-50
                hover:text-purple-700
              "
              aria-label="Search products"
            >
              <i className="fa-solid fa-magnifying-glass text-sm" />
            </Link>


            {/* Cart */}
            <Link
              to="/cart"
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-gray-200
                text-gray-700
                transition
                hover:border-purple-200
                hover:bg-purple-50
                hover:text-purple-700
              "
              aria-label="Shopping cart"
            >

              <i className="fa-solid fa-cart-shopping text-sm" />

              {cartCount > 0 && (
                <span
                  className="
                    absolute
                    -right-1
                    -top-1
                    flex
                    h-[18px]
                    min-w-[18px]
                    items-center
                    justify-center
                    rounded-full
                    bg-purple-700
                    px-1
                    text-[10px]
                    font-bold
                    text-white
                    ring-2
                    ring-white
                  "
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}

            </Link>


            {/* Join Our Team */}
            <Link
              to="/careers"
              className="
                ml-2
                rounded-lg
                bg-purple-700
                px-5
                py-2.5
                text-[13px]
                font-bold
                text-white
                transition
                hover:bg-purple-800
                active:scale-95
              "
            >
              Join Our Team
            </Link>

          </div>


          {/* =================================================
              MOBILE
          ================================================= */}
          <div className="flex items-center gap-2 lg:hidden">

            {/* Cart */}
            <Link
              to="/cart"
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-lg
                border
                border-gray-200
                text-gray-700
              "
            >
              <i className="fa-solid fa-cart-shopping" />

              {cartCount > 0 && (
                <span
                  className="
                    absolute
                    -right-1
                    -top-1
                    flex
                    h-[18px]
                    min-w-[18px]
                    items-center
                    justify-center
                    rounded-full
                    bg-purple-700
                    px-1
                    text-[10px]
                    font-bold
                    text-white
                  "
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>


            {/* Menu */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-lg
                border
                border-gray-200
                text-gray-700
                hover:border-purple-200
                hover:bg-purple-50
                hover:text-purple-700
              "
            >
              <i
                className={
                  mobileOpen
                    ? 'fa-solid fa-xmark'
                    : 'fa-solid fa-bars'
                }
              />
            </button>

          </div>

        </div>

      </div>


      {/* =================================================
          MOBILE MENU
      ================================================= */}
      {mobileOpen && (

        <div className="border-t border-gray-100 bg-white shadow-lg lg:hidden">

          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

            <ul className="space-y-1">

              {navLinks.map(({ to, label }) => (

                <li key={to}>

                  <NavLink
                    to={to}
                    end={to === '/'}
                    onClick={closeMobile}
                    className={({ isActive }) => `
                      block
                      rounded-lg
                      px-4
                      py-3
                      text-sm
                      font-semibold
                      ${isActive
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                      }
                    `}
                  >
                    {label}
                  </NavLink>

                </li>

              ))}

            </ul>

            <Link
              to="/careers"
              onClick={closeMobile}
              className="
                mt-4
                flex
                w-full
                justify-center
                rounded-lg
                bg-purple-700
                px-5
                py-3
                text-sm
                font-bold
                text-white
                hover:bg-purple-800
              "
            >
              Join Our Team
            </Link>

          </div>

        </div>

      )}

    </nav>
  )
}