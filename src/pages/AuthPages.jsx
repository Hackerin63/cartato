import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 to-brand-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
        <motion.div className="relative z-10 text-center px-12"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 }}>
          <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center mx-auto mb-6">
            <span className="font-display font-bold text-white text-4xl">V</span>
          </div>
          <h2 className="font-display text-4xl font-bold text-white mb-3">Welcome to<br />cartato</h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto mb-8">
            Shop thousands of premium products with fast delivery across India.
          </p>
          <div className="grid grid-cols-3 gap-6 max-w-xs mx-auto">
            {[['50K+','Customers'],['2K+','Products'],['99%','Satisfaction']].map(([v,l]) => (
              <div key={l} className="text-center">
                <p className="font-display font-bold text-white text-xl">{v}</p>
                <p className="text-white/40 text-xs mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div className="w-full max-w-md"
          initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ duration:.4 }}>
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="font-display font-bold text-white text-sm">V</span>
            </div>
            <span className="font-display font-bold text-xl text-ink-900">cartato</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">{title}</h1>
          <p className="text-ink-500 text-sm mb-8">{subtitle}</p>
          {children}
        </motion.div>
      </div>
    </div>
  )
}

function Field({ label, type='text', value, onChange, placeholder, icon: Icon, showToggle, onToggle, error }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-ink-700 mb-1.5">{label}</label>}
      <div className="relative">
        {Icon && <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          className={`input ${Icon?'pl-10':''} ${showToggle!==undefined?'pr-10':''} ${error?'!border-red-400 !ring-red-400/30':''}`} />
        {showToggle !== undefined && (
          <button type="button" onClick={onToggle}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors">
            {type==='password' ? <Eye size={15}/> : <EyeOff size={15}/>}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

/* ── Login ─────────────────────────────────────────────────────────────── */
export function LoginPage() {
  const [email,   setEmail]   = useState('')
  const [pw,      setPw]      = useState('')
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const from       = location.state?.from?.pathname || '/'

  const validate = () => {
    const e = {}
    if (!email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email'
    if (!pw) e.pw = 'Password is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const r = await login(email.trim(), pw)
    setLoading(false)
    if (r.ok) navigate(from, { replace:true })
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your cartato account">
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)}
          placeholder="you@example.com" icon={Mail} error={errors.email} />
        <Field label="Password" type={showPw?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)}
          placeholder="Your password" icon={Lock} showToggle={showPw} onToggle={()=>setShowPw(!showPw)} error={errors.pw} />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-2xl text-base mt-2">
          {loading ? 'Signing in…' : <span className="flex items-center justify-center gap-2">Sign In <ArrowRight size={16}/></span>}
        </button>
      </form>
      <p className="text-center text-ink-500 text-sm mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-600 font-semibold hover:underline">Create one</Link>
      </p>
      {/* <div className="mt-5 p-4 rounded-xl bg-brand-50 border border-brand-100 text-xs text-ink-500">
        <p className="font-semibold text-brand-700 mb-1">Demo credentials</p>
        <p>Admin: <span className="font-mono text-ink-700">admin@cartato.store</span> / <span className="font-mono text-ink-700">Admin@123</span></p>
      </div> */}
    </AuthLayout>
  )
}

/* ── Register ──────────────────────────────────────────────────────────── */
export function RegisterPage() {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [pw,      setPw]      = useState('')
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})
  const { register } = useAuth()
  const navigate = useNavigate()

  const strength = pw.length>=8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email'
    if (!pw) e.pw = 'Password is required'
    else if (pw.length < 8) e.pw = 'Min 8 characters'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const r = await register(name.trim(), email.trim(), pw)
    setLoading(false)
    if (r.ok) navigate('/')
  }

  return (
    <AuthLayout title="Create account" subtitle="Join cartato and start shopping">
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Full name" value={name} onChange={e=>setName(e.target.value)}
          placeholder="Your full name" icon={User} error={errors.name} />
        <Field label="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)}
          placeholder="you@example.com" icon={Mail} error={errors.email} />
        <div>
          <Field label="Password" type={showPw?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)}
            placeholder="Min 8 chars, 1 uppercase, 1 number" icon={Lock}
            showToggle={showPw} onToggle={()=>setShowPw(!showPw)} error={errors.pw} />
          {pw && (
            <div className="mt-2 h-1.5 rounded-full bg-surface-200 overflow-hidden">
              <motion.div className={`h-full rounded-full ${strength?'bg-emerald-500':pw.length>=6?'bg-amber-400':'bg-red-400'}`}
                animate={{ scaleX: strength?1:pw.length>=6?0.6:0.3, originX:0 }} />
            </div>
          )}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-2xl text-base mt-2">
          {loading ? 'Creating account…' : <span className="flex items-center justify-center gap-2">Create Account <ArrowRight size={16}/></span>}
        </button>
      </form>
      <p className="text-center text-ink-500 text-sm mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  )
}

export default LoginPage
