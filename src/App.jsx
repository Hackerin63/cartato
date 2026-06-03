import { Suspense, lazy, useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// ── Lazy pages ─────────────────────────────────────────────────────────────
const HomePage        = lazy(() => import('./pages/HomePage'))
const ProductsPage    = lazy(() => import('./pages/ProductsPage'))
const ProductDetail   = lazy(() => import('./pages/ProductDetailPage'))
const CartPage        = lazy(() => import('./pages/CartPage'))
const CheckoutPage    = lazy(() => import('./pages/CheckoutPage'))
const OrderSuccessPage= lazy(() => import('./pages/OrderSuccessPage'))
const InvoicePage     = lazy(() => import('./pages/InvoicePage'))
const OrderDetailPage = lazy(() => import('./pages/OrdersPage').then(m => ({ default: m.OrderDetailPage })))
const OrdersPage      = lazy(() => import('./pages/OrdersPage'))
const WishlistPage    = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.WishlistPage })))
const ProfilePage     = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const LoginPage       = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.LoginPage })))
const RegisterPage    = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.RegisterPage })))
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts   = lazy(() => import('./pages/admin/AdminProducts'))
const AdminOrders     = lazy(() => import('./pages/admin/AdminOrders'))
const AdminUsers      = lazy(() => import('./pages/admin/AdminUsers'))
const NotFoundPage    = lazy(() => import('./pages/NotFoundPage'))

// ── Boot animation ──────────────────────────────────────────────────────────
function BootScreen({ onDone }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400)
    const t2 = setTimeout(() => setPhase(2), 1600)
    const t3 = setTimeout(() => onDone(), 2000)
    return () => [t1,t2,t3].forEach(clearTimeout)
  }, [onDone])

  if (phase >= 2) return null

  return (
    <motion.div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
      exit={{ opacity:0 }} transition={{ duration:.3 }}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-white pointer-events-none" />

      <motion.div className="relative flex flex-col items-center gap-5"
        initial={{ opacity:0, scale:.85 }}
        animate={{ opacity: phase>=1?1:0, scale: phase>=1?1:.85 }}
        transition={{ duration:.5, ease:[.33,1,.68,1] }}>
        {/* Logo */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-brand-600 flex items-center justify-center shadow-brand">
            <span className="font-display font-bold text-white text-4xl">V</span>
          </div>
          {/* Ring */}
          <motion.div className="absolute -inset-3 rounded-[2rem] border-2 border-brand-200"
            initial={{ scale:0.7, opacity:0 }} animate={{ scale:1, opacity:1 }}
            transition={{ delay:.2, duration:.5 }} />
        </div>
        {/* Brand */}
        <div className="text-center">
          <p className="font-display font-bold text-2xl text-ink-900 tracking-tight">cartato</p>
          <p className="text-ink-400 text-xs tracking-widest font-mono mt-0.5">PREMIUM STORE</p>
        </div>
        {/* Progress bar */}
        <div className="w-32 h-1 bg-surface-200 rounded-full overflow-hidden">
          <motion.div className="h-full bg-brand-600 rounded-full"
            initial={{ scaleX:0, originX:0 }} animate={{ scaleX:1 }}
            transition={{ delay:.3, duration:1, ease:'easeInOut' }} />
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Loader ──────────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center pt-16">
      <div className="w-9 h-9 border-2 border-surface-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  )
}

// ── Layout wrappers ─────────────────────────────────────────────────────────
function Main({ children }) {
  return (
    <>
      <Navbar />
      <main className="bg-surface-50 min-h-screen">{children}</main>
      <Footer />
    </>
  )
}

function Bare({ children }) {
  return <main className="min-h-screen bg-surface-50">{children}</main>
}

// ── Route guards ────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { isAuth, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <PageLoader />
  if (!isAuth) return <Navigate to="/login" state={{ from: loc }} replace />
  return children
}

function RequireAdmin({ children }) {
  const { isAuth, loading, user } = useAuth()
  const loc = useLocation()
  if (loading) return <PageLoader />
  if (!isAuth) return <Navigate to="/login" state={{ from: loc }} replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function GuestOnly({ children }) {
  const { isAuth, loading } = useAuth()
  if (loading) return null
  if (isAuth)  return <Navigate to="/" replace />
  return children
}

// ── Page transition ─────────────────────────────────────────────────────────
function Page({ children }) {
  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
      exit={{ opacity:0 }} transition={{ duration:.22, ease:'easeOut' }}>
      {children}
    </motion.div>
  )
}

// ── Routes ──────────────────────────────────────────────────────────────────
function AppRoutes() {
  const loc = useLocation()
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={loc} key={loc.pathname}>
          {/* Public */}
          <Route path="/"            element={<Main><Page><HomePage /></Page></Main>} />
          <Route path="/products"    element={<Main><Page><ProductsPage /></Page></Main>} />
          <Route path="/products/:id"element={<Main><Page><ProductDetail /></Page></Main>} />
          <Route path="/cart"        element={<Main><Page><CartPage /></Page></Main>} />
          <Route path="/wishlist"    element={<Main><Page><WishlistPage /></Page></Main>} />
          <Route path="/order-success" element={<Main><Page><OrderSuccessPage /></Page></Main>} />

          {/* Invoice — full page, no footer */}
          <Route path="/invoice/:id" element={<Bare><Page><InvoicePage /></Page></Bare>} />

          {/* Auth (guest only) */}
          <Route path="/login"    element={<GuestOnly><Page><LoginPage /></Page></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><Page><RegisterPage /></Page></GuestOnly>} />

          {/* Protected */}
          <Route path="/checkout"    element={<RequireAuth><Main><Page><CheckoutPage /></Page></Main></RequireAuth>} />
          <Route path="/profile"     element={<RequireAuth><Main><Page><ProfilePage /></Page></Main></RequireAuth>} />
          <Route path="/orders"      element={<RequireAuth><Main><Page><OrdersPage /></Page></Main></RequireAuth>} />
          <Route path="/orders/:id"  element={<RequireAuth><Main><Page><OrderDetailPage /></Page></Main></RequireAuth>} />

          {/* Admin */}
          <Route path="/admin"           element={<RequireAdmin><Main><Page><AdminDashboard /></Page></Main></RequireAdmin>} />
          <Route path="/admin/products"  element={<RequireAdmin><Main><Page><AdminProducts /></Page></Main></RequireAdmin>} />
          <Route path="/admin/orders"    element={<RequireAdmin><Main><Page><AdminOrders /></Page></Main></RequireAdmin>} />
          <Route path="/admin/users"     element={<RequireAdmin><Main><Page><AdminUsers /></Page></Main></RequireAdmin>} />

          {/* 404 */}
          <Route path="*" element={<Main><Page><NotFoundPage /></Page></Main>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}

// ── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  const [booted, setBooted] = useState(() => sessionStorage.getItem('vx_booted') === '1')
  const done = () => { sessionStorage.setItem('vx_booted','1'); setBooted(true) }

  return (
    <AuthProvider>
      <CartProvider>
        <AnimatePresence>
          {!booted && <BootScreen onDone={done} />}
        </AnimatePresence>
        {booted && <AppRoutes />}
      </CartProvider>
    </AuthProvider>
  )
}
