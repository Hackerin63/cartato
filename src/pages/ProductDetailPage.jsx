import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Heart, ShoppingBag, Truck, RefreshCw, Shield, Plus, Minus, Check, ChevronLeft, ChevronRight, Share2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import { Spinner } from '../components/Skeleton'
import { PRODUCTS, fmt, fmtDate } from '../utils/data'

const MOCK_REVIEWS = [
  { id:1, user:'Priya S.',  rating:5, date:'2025-02-10', text:'Absolutely stunning. Worth every rupee — the quality is unlike anything else I own.' },
  { id:2, user:'Arjun M.', rating:4, date:'2025-01-28', text:'Great product, arrived perfectly packaged. The team resolved a sizing query immediately.' },
  { id:3, user:'Kavya R.', rating:5, date:'2025-01-15', text:'Gifted this to my partner — they were completely blown away. Packaging is luxurious.' },
]

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart, toggleWish, inWish } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx,  setImgIdx]  = useState(0)
  const [size,    setSize]    = useState('')
  const [qty,     setQty]     = useState(1)
  const [tab,     setTab]     = useState('desc')
  const [added,   setAdded]   = useState(false)
  const [related, setRelated] = useState([])

  useEffect(() => {
    window.scrollTo(0,0); setLoading(true); setImgIdx(0); setQty(1); setSize(''); setTab('desc')
    const t = setTimeout(() => {
      const p = PRODUCTS.find(x => x._id===id) || PRODUCTS[0]
      setProduct(p)
      setSize(p.sizes?.[0]||'')
      setRelated(PRODUCTS.filter(x => x._id!==p._id && x.category===p.category).slice(0,4))
      setLoading(false)
    }, 400)
    return () => clearTimeout(t)
  }, [id])

  if (loading) return <div className="min-h-screen bg-surface-50 pt-16 flex items-center justify-center"><Spinner size={36} /></div>
  if (!product) return null

  const disc  = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
  const liked = inWish(product._id)
  const imgs  = product.images?.length ? product.images : [`https://picsum.photos/seed/${id}/600/600`]

  const handleAdd = () => {
    if (product.sizes?.length && !size) { alert('Please select a size'); return }
    addToCart({ ...product, size: size||'' })
    setAdded(true); setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="min-h-screen bg-surface-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-ink-400 mb-8">
          <Link to="/" className="hover:text-brand-600">Home</Link><span>/</span>
          <Link to="/products" className="hover:text-brand-600">Products</Link><span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-brand-600">{product.category}</Link><span>/</span>
          <span className="text-ink-700 line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-100 shadow-card-md mb-3 group">
              <AnimatePresence mode="wait">
                <motion.img key={imgIdx} src={imgs[imgIdx]} alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  initial={{ opacity:0 }} animate={{ opacity:1 }}
                  onError={e => { e.target.src = `https://picsum.photos/seed/${product._id}${imgIdx}/600/600` }} />
              </AnimatePresence>
              {imgs.length > 1 && <>
                <button onClick={() => setImgIdx(i => (i-1+imgs.length)%imgs.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-card text-ink-700 flex items-center justify-center hover:bg-white transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setImgIdx(i => (i+1)%imgs.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-card text-ink-700 flex items-center justify-center hover:bg-white transition-colors">
                  <ChevronRight size={16} />
                </button>
              </>}
              {disc > 0 && <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">-{disc}%</span>}
            </div>
            {imgs.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {imgs.map((img,i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${i===imgIdx?'border-brand-500':'border-transparent hover:border-surface-300'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" onError={e=>{ e.target.src=`https://picsum.photos/seed/${product._id}t${i}/120/120` }} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="py-1">
            <div className="flex items-start justify-between gap-3 mb-1">
              <span className="text-brand-600 text-xs font-semibold tracking-widest uppercase">{product.category}</span>
              <button onClick={() => navigator.share?.({ title: product.name, url: window.location.href }).catch(()=>{})}
                className="btn-ghost p-1.5 rounded-lg"><Share2 size={16} /></button>
            </div>
            {product.badge && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3 bg-amber-100 text-amber-700`}>{product.badge}</span>
            )}
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 leading-tight mb-4">{product.name}</h1>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={15} fill={s<=Math.round(product.rating||0)?'#f59e0b':'none'} stroke={s<=Math.round(product.rating||0)?'#f59e0b':'#e2e8f0'} />)}</div>
              <span className="font-semibold text-ink-900 text-sm">{product.rating}</span>
              <span className="text-ink-400 text-sm">({product.reviewCount} reviews)</span>
            </div>
            <div className="flex items-baseline gap-3 mb-5">
              <span className="font-display text-4xl font-bold text-ink-900">{fmt(product.price)}</span>
              {product.originalPrice && <span className="text-ink-400 text-xl line-through">{fmt(product.originalPrice)}</span>}
              {disc > 0 && <span className="badge-red text-xs">Save {disc}%</span>}
            </div>
            <p className="text-ink-600 text-sm leading-relaxed mb-6">{product.description}</p>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-ink-900 mb-2">Size: <span className="text-brand-600">{size}</span></p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <button key={s} onClick={() => setSize(s)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${size===s?'border-brand-600 bg-brand-50 text-brand-700':'border-surface-200 text-ink-600 hover:border-surface-300'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-surface-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q=>Math.max(1,q-1))} className="px-3 py-2.5 hover:bg-surface-50 text-ink-600 transition-colors"><Minus size={14} /></button>
                <span className="w-10 text-center font-semibold text-ink-900 text-sm">{qty}</span>
                <button onClick={() => setQty(q=>Math.min(10,q+1))} className="px-3 py-2.5 hover:bg-surface-50 text-ink-600 transition-colors"><Plus size={14} /></button>
              </div>
              <span className={`text-sm font-medium ${product.stock>5?'text-emerald-600':product.stock>0?'text-amber-600':'text-red-600'}`}>
                {product.stock>5?`In Stock (${product.stock})`:product.stock>0?`Only ${product.stock} left!`:'Out of Stock'}
              </span>
            </div>

            {/* CTAs */}
            <div className="flex gap-3 mb-8">
              <motion.button onClick={handleAdd} disabled={product.stock===0}
                className="flex-1 btn-primary py-4 text-base rounded-2xl" whileTap={{ scale:.97 }}>
                <AnimatePresence mode="wait">
                  {added
                    ? <motion.span key="ok" className="flex items-center gap-2" initial={{ opacity:0 }} animate={{ opacity:1 }}><Check size={18} />Added!</motion.span>
                    : <motion.span key="add" className="flex items-center gap-2" initial={{ opacity:0 }} animate={{ opacity:1 }}><ShoppingBag size={18} />Add to Cart</motion.span>
                  }
                </AnimatePresence>
              </motion.button>
              <button onClick={() => toggleWish(product)}
                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${liked?'border-red-300 bg-red-50 text-red-500':'border-surface-200 text-ink-400 hover:border-red-300 hover:text-red-400'}`}>
                <Heart size={20} fill={liked?'currentColor':'none'} />
              </button>
            </div>

            {/* Trust */}
            <div className="grid grid-cols-3 gap-3 py-5 border-t border-surface-200">
              {[[Truck,'Free delivery over ₹4,999'],[RefreshCw,'30-day returns'],[Shield,'Secure checkout']].map(([Icon,text]) => (
                <div key={text} className="flex flex-col items-center gap-2 text-center">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center"><Icon size={16} className="text-brand-600" /></div>
                  <span className="text-ink-500 text-xs leading-tight">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mt-14">
          <div className="flex gap-0 border-b border-surface-200 mb-8">
            {[['desc','Description'],['reviews',`Reviews (${MOCK_REVIEWS.length})`],['shipping','Shipping']].map(([k,l]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`relative px-6 py-3.5 text-sm font-semibold transition-colors ${tab===k?'text-brand-600':'text-ink-500 hover:text-ink-900'}`}>
                {l}
                {tab===k && <motion.div layoutId="tab-bar" className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-600 rounded-full" />}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {tab==='desc' && (
              <motion.div key="desc" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="max-w-2xl text-ink-600 text-sm leading-relaxed space-y-4">
                <p>{product.description}</p>
                <p>Each item is quality-controlled before dispatch and arrives in premium gift-ready packaging.</p>
                <ul className="space-y-2 mt-3">
                  {['Premium quality materials','Expert craftsmanship','Sustainably sourced','Gift packaging included','Lifetime quality guarantee'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-ink-700"><Check size={14} className="text-brand-600 shrink-0" />{f}</li>
                  ))}
                </ul>
              </motion.div>
            )}
            {tab==='reviews' && (
              <motion.div key="reviews" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="max-w-2xl space-y-4">
                {/* Summary */}
                <div className="card p-5 flex flex-col sm:flex-row items-start gap-6 mb-6">
                  <div className="text-center shrink-0">
                    <p className="font-display text-5xl font-bold text-ink-900">{product.rating}</p>
                    <div className="flex gap-0.5 justify-center mt-1">{[1,2,3,4,5].map(s=><Star key={s} size={14} fill={s<=Math.round(product.rating||0)?'#f59e0b':'none'} stroke="#f59e0b" />)}</div>
                    <p className="text-ink-500 text-xs mt-1">{product.reviewCount} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5 w-full">
                    {[5,4,3,2,1].map(stars => {
                      const pct = stars===5?72:stars===4?18:stars===3?6:stars===2?3:1
                      return (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="text-xs text-ink-500 w-3">{stars}</span>
                          <Star size={11} fill="#f59e0b" stroke="#f59e0b" />
                          <div className="flex-1 h-2 bg-surface-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width:`${pct}%` }} />
                          </div>
                          <span className="text-xs text-ink-400 w-8 text-right">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                {MOCK_REVIEWS.map((r,i) => (
                  <motion.div key={r.id} className="card p-5" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-bold">{r.user.charAt(0)}</div>
                        <div><p className="font-semibold text-ink-900 text-sm">{r.user}</p><p className="text-ink-400 text-xs">{fmtDate(r.date)}</p></div>
                      </div>
                      <div className="flex gap-0.5">{[1,2,3,4,5].map(s=><Star key={s} size={13} fill={s<=r.rating?'#f59e0b':'none'} stroke={s<=r.rating?'#f59e0b':'#e2e8f0'} />)}</div>
                    </div>
                    <p className="text-ink-600 text-sm">{r.text}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
            {tab==='shipping' && (
              <motion.div key="ship" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="max-w-2xl space-y-4">
                {[[Truck,'Shipping','Free shipping on orders above ₹4,999. Standard 3–5 business days (₹199). Express 1–2 days (₹399). Same-day available in select cities.'],
                  [RefreshCw,'Returns','30-day hassle-free returns. Items must be in original condition with tags intact. Refund processed within 5–7 business days to original payment method.']
                ].map(([Icon,title,body]) => (
                  <div key={title} className="card p-5">
                    <h4 className="font-semibold text-ink-900 flex items-center gap-2 mb-2"><Icon size={15} className="text-brand-600" />{title}</h4>
                    <p className="text-ink-600 text-sm">{body}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
              {related.map((p,i) => <ProductCard key={p._id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
