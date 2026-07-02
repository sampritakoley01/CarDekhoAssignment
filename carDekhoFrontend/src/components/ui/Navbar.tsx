import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, MessageSquare, Sparkles, Menu, X } from 'lucide-react'
import { useAppContext } from '@/context/AppContext'

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { recommendationId } = useAppContext()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Home',            href: '/' },
    { label: 'Recommendations', href: '/recommendations', disabled: !recommendationId },
    { label: 'Compare',         href: '/compare',         disabled: !recommendationId },
    { label: 'AI Chat',         href: '/chat',            disabled: !recommendationId },
  ]

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div
        className={`mx-4 md:mx-8 lg:mx-16 rounded-2xl transition-all duration-300 ${
          scrolled
            ? 'glass border border-white/10 shadow-card px-6'
            : 'px-6'
        }`}
      >
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              acr<span className="gradient-text">dekho</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.disabled ? '#' : link.href}
                onClick={(e) => link.disabled && e.preventDefault()}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.href
                    ? 'text-white bg-white/10'
                    : link.disabled
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-400 hover:text-white hover:bg-white/05'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            {recommendationId && (
              <button
                onClick={() => navigate('/chat')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/05 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </button>
            )}
            <button
              onClick={() => navigate('/questionnaire')}
              className="btn-primary text-xs px-4 py-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Find My Car
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/05 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mx-4 mt-2 rounded-2xl glass border border-white/10 p-4 shadow-card"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.disabled ? '#' : link.href}
                onClick={(e) => {
                  if (link.disabled) e.preventDefault()
                  else setMobileOpen(false)
                }}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === link.href
                    ? 'text-white bg-white/10'
                    : link.disabled
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-400 hover:text-white hover:bg-white/05'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-white/08">
              <button
                onClick={() => { navigate('/questionnaire'); setMobileOpen(false) }}
                className="btn-primary w-full justify-center text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Find My Car
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
