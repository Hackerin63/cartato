import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, SlidersHorizontal, ChevronDown, Grid3X3, List } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { CardSkeleton } from '../components/Skeleton'
import { PRODUCTS, CATEGORIES, fmt } from '../utils/data'

const SORTS = [
  { v:'newest',     l:'Newest First'       },
  { v:'popular',    l:'Most Popular'       },
  { v:'price-asc',  l:'Price: Low → High'  },
  { v:'price-desc', l:'Price: High → Low'  },
  { v:'rating',     l:'Highest Rated'      },
]

function Filters({ f, setF, onClose }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-5 border-b border-surface-200 shrink-0">
        <h3 className="font-semibold text-ink-900 flex items-center gap-2"><SlidersHorizontal size={15} className="text-brand-600" />Filters</h3>
        <div className="flex items-center gap-3">
          <button onClick={() => setF({ cats:[], maxPrice:'', minRating:0, inStock:false })}
            className="text-xs text-brand-600 hover:underline font-medium">Clear all</button>
          {onClose && <button onClick={onClose} className="text-ink-400 hover:text-ink-700"><X size={16} /></button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-7">
        {/* Categories */}
        <div>
          <h4 className="font-semibold text-ink-900 text-sm mb-3">Category</h4>
          <div className="space-y-2">
            {CATEGORIES.map(c => (
              <label key={c.slug} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={f.cats.includes(c.slug)}
                  onChange={() => setF(p => ({ ...p, cats: p.cats.includes(c.slug) ? p.cats.filter(x=>x!==c.slug) : [...p.cats,c.slug] }))}
                  className="w-4 h-4 rounded accent-brand-600 cursor-pointer" />
                <span className="text-sm text-ink-600 group-hover:text-ink-900 flex-1">{c.label}</span>
                <span className="text-xs text-ink-400">{c.count}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Price */}
        <div>
          <h4 className="font-semibold text-ink-900 text-sm mb-3">Max Price</h4>
          {[25000,50000,75000,100000].map(p => (
            <label key={p} className="flex items-center gap-3 cursor-pointer mb-2">
              <input type="radio" name="price" checked={f.maxPrice===String(p)}
                onChange={() => setF(pv => ({ ...pv, maxPrice: String(p) }))} className="accent-brand-600" />
              <span className="text-sm text-ink-600">Under {fmt(p)}</span>
            </label>
          ))}
          {f.maxPrice && <button onClick={() => setF(p=>({...p,maxPrice:''}))} className="text-xs text-brand-600 hover:underline">Clear</button>}
        </div>
        {/* Rating */}
        <div>
          <h4 className="font-semibold text-ink-900 text-sm mb-3">Min Rating</h4>
          {[4.5,4,3.5].map(r => (
            <label key={r} className="flex items-center gap-3 cursor-pointer mb-2">
              <input type="radio" name="rating" checked={f.minRating===r}
                onChange={() => setF(p=>({...p,minRating:r}))} className="accent-brand-600" />
              <span className="text-amber-500 text-sm">{'★'.repeat(Math.floor(r))}</span>
              <span className="text-sm text-ink-500">&amp; up</span>
            </label>
          ))}
        </div>
        {/* Stock */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => setF(p=>({...p,inStock:!p.inStock}))}
            className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${f.inStock?'bg-brand-600':'bg-surface-300'}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${f.inStock?'translate-x-5':'translate-x-0.5'}`} />
          </div>
          <span className="text-sm font-medium text-ink-900">In Stock Only</span>
        </label>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [sp] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [sort,     setSort]     = useState(sp.get('sort')||'newest')
  const [view,     setView]     = useState('grid')
  const [filters,  setFilters]  = useState({ cats: sp.get('category')?[sp.get('category')]:[], maxPrice:'', minRating:0, inStock:false })
  const [showSide, setShowSide] = useState(false)
  const [page,     setPage]     = useState(1)
  const search = sp.get('search')||''
  const PER    = 12

  useEffect(() => {
    setLoading(true); setPage(1)
    const t = setTimeout(() => {
      let res = [...PRODUCTS]
      if (search)          res = res.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
      if (filters.cats.length) res = res.filter(p => filters.cats.includes(p.category))
      if (filters.maxPrice)    res = res.filter(p => p.price <= Number(filters.maxPrice))
      if (filters.minRating)   res = res.filter(p => (p.rating||0) >= filters.minRating)
      if (filters.inStock)     res = res.filter(p => p.stock > 0)
      if (sort==='price-asc')  res.sort((a,b) => a.price-b.price)
      else if (sort==='price-desc') res.sort((a,b) => b.price-a.price)
      else if (sort==='rating')     res.sort((a,b) => (b.rating||0)-(a.rating||0))
      else if (sort==='popular')    res.sort((a,b) => (b.reviewCount||0)-(a.reviewCount||0))
      setProducts(res); setLoading(false)
    }, 450)
    return () => clearTimeout(t)
  }, [search, sort, filters])

  const shown  = products.slice(0, page * PER)
  const hasMore= shown.length < products.length

  const activeTags = [
    ...filters.cats.map(c => ({ l:c, clear:() => setFilters(f=>({...f,cats:f.cats.filter(x=>x!==c)})) })),
    ...(filters.maxPrice ? [{ l:`Max ${fmt(Number(filters.maxPrice))}`, clear:()=>setFilters(f=>({...f,maxPrice:''})) }] : []),
    ...(filters.minRating ? [{ l:`${filters.minRating}★+`, clear:()=>setFilters(f=>({...f,minRating:0})) }] : []),
    ...(filters.inStock   ? [{ l:'In Stock', clear:()=>setFilters(f=>({...f,inStock:false})) }] : []),
  ]

  return (
    <div className="min-h-screen bg-surface-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-surface-200">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
              {search ? `Results for "${search}"` : 'All Products'}
            </h1>
            <p className="text-ink-500 text-sm mt-1">{loading ? '…' : `${products.length} products found`}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSide(true)} className="btn-secondary text-sm py-2 lg:hidden">
              <Filter size={14} /> Filters
            </button>
            <div className="relative">
              <select value={sort} onChange={e => setSort(e.target.value)} className="input pr-8 appearance-none cursor-pointer text-sm">
                {SORTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
            </div>
            <div className="hidden sm:flex border border-surface-200 rounded-xl overflow-hidden">
              {[[Grid3X3,'grid'],[List,'list']].map(([Icon,v]) => (
                <button key={v} onClick={() => setView(v)}
                  className={`p-2.5 transition-colors ${view===v?'bg-brand-600 text-white':'hover:bg-surface-100 text-ink-500'}`}>
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active tags */}
        {activeTags.length > 0 && (
          <div className="flex flex-wrap gap-2 py-3">
            {activeTags.map(({ l, clear }) => (
              <button key={l} onClick={clear}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                {l} <X size={11} />
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-7 pt-5">
          {/* Sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="card sticky top-20">
              <Filters f={filters} setF={setFilters} />
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
                {Array(6).fill(0).map((_,i) => <CardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-display text-xl font-bold text-ink-900 mb-2">No products found</h3>
                <p className="text-ink-500 text-sm">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
                <div className={`grid gap-4 sm:gap-5 ${view==='grid' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
                  {shown.map((p,i) => <ProductCard key={p._id} product={p} index={i} />)}
                </div>
                {hasMore && (
                  <div className="text-center mt-10">
                    <button onClick={() => setPage(p => p+1)} className="btn-secondary px-8 py-3">Load More</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {showSide && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-ink-900/30 backdrop-blur-sm"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setShowSide(false)} />
            <motion.div className="fixed inset-y-0 right-0 z-50 w-72 card rounded-r-none flex flex-col"
              initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
              transition={{ type:'spring', stiffness:400, damping:40 }}>
              <Filters f={filters} setF={setFilters} onClose={() => setShowSide(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
