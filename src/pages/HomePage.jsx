import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Star, Shield, Truck, RefreshCw, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { CardSkeleton } from '../components/Skeleton'
import { PRODUCTS, CATEGORIES, REVIEWS, fmt } from '../utils/data'

/* ── Hero ─────────────────────────────────────────────────────────────── */
function Hero() {
  const navigate = useNavigate()
  const slides = [
    { tag:'New Collection',  h1:'Discover',      h2:'Premium Quality', sub:'Curated products for those who demand the very best.', cta:'Shop Now', bg:'from-brand-600 to-brand-800', img:'https://picsum.photos/seed/hero1/800/600' },
    { tag:'Limited Drops',   h1:'Exclusive',      h2:'Arrivals',        sub:'Hand-picked items available for a limited time only.',  cta:'View Drops', bg:'from-violet-600 to-violet-800', img:'https://picsum.photos/seed/hero2/800/600' },
    { tag:'Best Sellers',    h1:'Customer',       h2:'Favourites',      sub:'Products loved by thousands of happy shoppers.',        cta:'Shop Popular', bg:'from-emerald-600 to-emerald-800', img:'https://picsum.photos/seed/hero3/800/600' },
  ]
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [paused])
  const s = slides[idx]

  return (
    <section className={`relative bg-gradient-to-br ${s.bg} overflow-hidden min-h-[580px] flex items-center`}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Decorative circles */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
        {/* Text */}
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:30 }} transition={{ duration:.45 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-semibold mb-5">
              <Zap size={11} /> {s.tag}
            </span>
            <h1 className="font-display text-5xl sm:text-6xl font-bold text-white leading-tight mb-4">
              {s.h1}<br />
              <span className="text-white/70">{s.h2}</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">{s.sub}</p>
            <div className="flex flex-wrap gap-3">
              <motion.button onClick={() => navigate('/products')}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-ink-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                whileTap={{ scale:.97 }}>
                {s.cta} <ArrowRight size={17} />
              </motion.button>
              <Link to="/products?sort=popular"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl transition-all">
                Trending Now
              </Link>
            </div>
            {/* Stats */}
            <div className="flex gap-8 mt-10">
              {[['50K+','Happy Customers'],['2K+','Products'],['99%','Satisfaction']].map(([v,l]) => (
                <div key={l}>
                  <p className="font-display text-2xl font-bold text-white">{v}</p>
                  <p className="text-white/50 text-xs mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Image */}
        <AnimatePresence mode="wait">
          <motion.div key={idx + 'img'} initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }}
            exit={{ opacity:0, scale:.9 }} transition={{ duration:.45 }}
            className="hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
              <img src={s.img} alt="Hero" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              {/* Floating card */}
              <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
                className="absolute bottom-6 left-6 bg-white rounded-2xl shadow-card-lg px-5 py-3.5">
                <p className="text-xs text-ink-500 mb-0.5">Today's Top Deal</p>
                <p className="font-display font-bold text-ink-900 text-sm">Up to 40% OFF</p>
                <p className="text-brand-600 text-xs font-semibold mt-0.5">Limited stock</p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_,i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`rounded-full transition-all ${i===idx ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`} />
        ))}
      </div>
    </section>
  )
}

/* ── Marquee ──────────────────────────────────────────────────────────── */
function Marquee() {
  const items = ['Free shipping over ₹4,999','New arrivals every week','30-day easy returns','Secure payments','Exclusive member discounts','COD available nationwide']
  return (
    <div className="bg-brand-600 py-3 overflow-hidden">
      <div className="flex w-max" style={{ animation:'marquee 24s linear infinite' }}>
        {[...items,...items].map((t,i) => (
          <span key={i} className="flex items-center gap-5 px-8 text-white text-sm font-medium whitespace-nowrap">
            <Star size={11} fill="white" stroke="none" />{t}
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  )
}

/* ── Trust ────────────────────────────────────────────────────────────── */
function Trust() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { Icon:Truck,     title:'Free Shipping',  sub:'On all orders above ₹4,999',  color:'text-brand-600',   bg:'bg-brand-50'   },
          { Icon:RefreshCw, title:'Easy Returns',   sub:'30-day hassle-free returns',   color:'text-emerald-600', bg:'bg-emerald-50' },
          { Icon:Shield,    title:'Secure Checkout',sub:'Razorpay & UPI encrypted',     color:'text-violet-600',  bg:'bg-violet-50'  },
        ].map(({ Icon, title, sub, color, bg }, i) => (
          <motion.div key={title} className="card p-5 flex items-center gap-4"
            initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ delay: i * 0.1 }}>
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="font-semibold text-ink-900 text-sm">{title}</p>
              <p className="text-ink-500 text-xs mt-0.5">{sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ── Categories ───────────────────────────────────────────────────────── */
function Categories() {
  const gradients = [
    'from-amber-400 to-orange-500','from-violet-500 to-purple-600',
    'from-cyan-400 to-blue-500','from-pink-400 to-rose-500',
    'from-emerald-400 to-teal-500','from-amber-400 to-yellow-500',
    'from-indigo-400 to-blue-600','from-purple-400 to-indigo-500',
    'from-teal-400 to-emerald-500',
  ]
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-brand-600 font-semibold text-xs tracking-widest uppercase mb-1.5">Browse</p>
          <h2 className="section-title">Shop by Category</h2>
        </div>
        <Link to="/products" className="btn-ghost hidden sm:flex">View all <ArrowRight size={15} /></Link>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
        {CATEGORIES.map((cat, i) => (
          <motion.div key={cat.slug}
            initial={{ opacity:0, scale:.9 }} whileInView={{ opacity:1, scale:1 }}
            viewport={{ once:true }} transition={{ delay: i * 0.04 }}>
            <Link to={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center gap-2.5 p-4 card hover:border-brand-300 hover:shadow-card-md hover:-translate-y-0.5 transition-all text-center cursor-pointer">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <p className="text-ink-700 text-xs font-semibold group-hover:text-brand-600 transition-colors leading-tight">{cat.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ── Featured Products ────────────────────────────────────────────────── */
function FeaturedProducts() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  useEffect(() => {
    const t = setTimeout(() => { setProducts(PRODUCTS.slice(0,8)); setLoading(false) }, 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="bg-surface-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-brand-600 font-semibold text-xs tracking-widest uppercase mb-1.5">Handpicked</p>
            <h2 className="section-title">Featured Products</h2>
          </div>
          <Link to="/products" className="btn-secondary hidden sm:flex">View All <ArrowRight size={15} /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {loading ? Array(8).fill(0).map((_,i) => <CardSkeleton key={i} />) : products.map((p,i) => <ProductCard key={p._id} product={p} index={i} />)}
        </div>
        <div className="text-center mt-8 sm:hidden">
          <Link to="/products" className="btn-primary">View All Products <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  )
}

/* ── Testimonials ─────────────────────────────────────────────────────── */
function Testimonials() {
  const [active, setActive] = useState(0)
  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-brand-600 font-semibold text-xs tracking-widest uppercase mb-1.5">Testimonials</p>
          <h2 className="section-title">What Our Customers Say</h2>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active} className="card p-8 sm:p-12 text-center shadow-card-md"
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
            <div className="flex justify-center gap-1 mb-5">
              {[1,2,3,4,5].map(s => <Star key={s} size={18} fill="#f59e0b" stroke="#f59e0b" />)}
            </div>
            <p className="text-ink-700 text-lg leading-relaxed font-display italic mb-7">"{REVIEWS[active].text}"</p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                {REVIEWS[active].name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="font-semibold text-ink-900 text-sm">{REVIEWS[active].name}</p>
                <p className="text-ink-500 text-xs">{REVIEWS[active].role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setActive(a => (a-1+REVIEWS.length)%REVIEWS.length)}
            className="w-9 h-9 rounded-full card flex items-center justify-center text-ink-500 hover:text-brand-600 hover:border-brand-200 transition-all">
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-2">
            {REVIEWS.map((_,i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`rounded-full transition-all ${i===active ? 'w-5 h-2 bg-brand-600' : 'w-2 h-2 bg-surface-300 hover:bg-brand-300'}`} />
            ))}
          </div>
          <button onClick={() => setActive(a => (a+1)%REVIEWS.length)}
            className="w-9 h-9 rounded-full card flex items-center justify-center text-ink-500 hover:text-brand-600 hover:border-brand-200 transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}

/* ── CTA Banner ───────────────────────────────────────────────────────── */
function CTABanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-10 sm:p-14 text-center overflow-hidden relative">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="relative z-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">Ready to Shop?</h2>
          <p className="text-white/70 text-base mb-8 max-w-xl mx-auto">Discover thousands of premium products with fast India-wide delivery. Your satisfaction, guaranteed.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/products" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-brand-700 font-bold rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Shop Now <ArrowRight size={17} />
            </Link>
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl transition-all">
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Trust />
      <Categories />
      <FeaturedProducts />
      <Testimonials />
      <CTABanner />
    </>
  )
}
