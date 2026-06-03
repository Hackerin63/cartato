import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Heart, Search, Menu, X, User, LogOut, LayoutDashboard, ChevronDown, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobile,   setMobile]   = useState(false)
  const [search,   setSearch]   = useState(false)
  const [query,    setQuery]    = useState('')
  const [userMenu, setUserMenu] = useState(false)
  const userRef   = useRef(null)
  const navigate  = useNavigate()
  const { user, isAuth, logout } = useAuth()
  const { count, wishlist }      = useCart()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const fn = (e) => { if (!userRef.current?.contains(e.target)) setUserMenu(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const doSearch = (e) => {
    e.preventDefault()
    if (query.trim()) { navigate(`/products?search=${encodeURIComponent(query.trim())}`); setSearch(false); setQuery('') }
  }

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-surface-200 shadow-sm' : 'bg-white border-b border-surface-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-brand">
              <span className="font-display font-bold text-white text-sm">V</span>
            </div>
            <span className="font-display font-bold text-xl text-ink-900 tracking-tight">cartato</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[['/', 'Home'], ['/products', 'Shop'], ['/products?sort=popular', 'Trending']].map(([to, lbl]) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-brand-600 bg-brand-50' : 'text-ink-600 hover:text-ink-900 hover:bg-surface-100'}`}>
                {lbl}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button onClick={() => setSearch(true)} className="btn-ghost p-2 rounded-lg" aria-label="Search">
              <Search size={18} />
            </button>

            <Link to="/wishlist" className="btn-ghost p-2 rounded-lg relative hidden sm:flex" aria-label="Wishlist">
              <Heart size={18} />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{wishlist.length}</span>
              )}
            </Link>

            <Link to="/cart" className="btn-ghost p-2 rounded-lg relative" aria-label="Cart">
              <ShoppingBag size={18} />
              {count > 0 && (
                <motion.span key={count} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </motion.span>
              )}
            </Link>

            {isAuth ? (
              <div className="relative" ref={userRef}>
                <button onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-surface-200 hover:border-brand-300 hover:bg-brand-50 transition-all ml-1">
                  <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-ink-700 text-sm font-medium hidden md:block">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={13} className="text-ink-400 hidden md:block" />
                </button>
                <AnimatePresence>
                  {userMenu && (
                    <motion.div className="absolute right-0 top-full mt-2 w-48 card shadow-card-lg py-1 z-50"
                      initial={{ opacity:0, y:-6, scale:.96 }} animate={{ opacity:1, y:0, scale:1 }}
                      exit={{ opacity:0, y:-6, scale:.96 }} transition={{ duration:.14 }}>
                      {[
                        { to:'/profile', Icon:User,            lbl:'My Profile'     },
                        { to:'/orders',  Icon:Package,         lbl:'My Orders'      },
                        ...(user?.role==='admin' ? [{ to:'/admin', Icon:LayoutDashboard, lbl:'Admin Panel', cls:'text-brand-600' }] : []),
                      ].map(({ to, Icon, lbl, cls='' }) => (
                        <Link key={to} to={to} onClick={() => setUserMenu(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-50 transition-colors ${cls || 'text-ink-700'}`}>
                          <Icon size={14} /> {lbl}
                        </Link>
                      ))}
                      <div className="my-1 border-t border-surface-100" />
                      <button onClick={() => { logout(); setUserMenu(false); navigate('/') }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-primary ml-1 hidden sm:flex">Sign In</Link>
            )}

            <button onClick={() => setMobile(!mobile)} className="btn-ghost p-2 md:hidden ml-1">
              {mobile ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobile && (
            <motion.div className="md:hidden bg-white border-t border-surface-100 px-4 py-3 space-y-1"
              initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}>
              {[['/', 'Home'], ['/products', 'Shop'], ['/products?sort=popular', 'Trending']].map(([to, lbl]) => (
                <Link key={to} to={to} onClick={() => setMobile(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-ink-700 hover:bg-surface-100">
                  {lbl}
                </Link>
              ))}
              {!isAuth && (
                <Link to="/login" onClick={() => setMobile(false)} className="btn-primary w-full mt-2 justify-center">Sign In</Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search modal */}
      <AnimatePresence>
        {search && (
          <motion.div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setSearch(false)} />
            <motion.form onSubmit={doSearch} className="relative w-full max-w-xl"
              initial={{ y:-16, scale:.97 }} animate={{ y:0, scale:1 }}>
              <div className="flex items-center gap-3 card shadow-card-lg p-2">
                <Search size={18} className="text-ink-400 ml-2 shrink-0" />
                <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search products, brands, categories…"
                  className="flex-1 text-sm text-ink-900 placeholder-ink-400 outline-none bg-transparent py-2" />
                <button type="submit" className="btn-primary px-4 py-2 text-sm rounded-lg">Search</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
