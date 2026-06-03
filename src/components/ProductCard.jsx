import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { fmt } from '../utils/data'

const BADGE_CLS = {
  'Best Seller': 'bg-amber-100 text-amber-700',
  'New':         'bg-emerald-100 text-emerald-700',
  'Top Rated':   'bg-purple-100 text-purple-700',
  'Limited':     'bg-red-100 text-red-700',
  'Sale':        'bg-brand-100 text-brand-700',
  'Trending':    'bg-pink-100 text-pink-700',
}

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, toggleWish, inWish } = useCart()
  const [imgErr, setImgErr]   = useState(false)
  const [adding, setAdding]   = useState(false)
  const [hovered, setHovered] = useState(false)
  const liked = inWish(product._id)
  const disc  = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0

  const handleAdd = (e) => {
    e.preventDefault()
    setAdding(true)
    addToCart({ ...product, size: product.sizes?.[0] || '' })
    setTimeout(() => setAdding(false), 900)
  }

  const src = imgErr ? `https://picsum.photos/seed/${product._id}x/600/600` : (product.images?.[0] || `https://picsum.photos/seed/${product._id}/600/600`)

  return (
    <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }} transition={{ duration:.35, delay: index * 0.05 }}>
      <Link to={`/products/${product._id}`}
        className="group card card-hover flex flex-col overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-surface-100">
          <motion.img src={src} alt={product.name}
            className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration:.45, ease:[.33,1,.68,1] }}
            onError={() => setImgErr(true)}
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.badge && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${BADGE_CLS[product.badge] || 'bg-surface-100 text-ink-600'}`}>
                {product.badge}
              </span>
            )}
            {disc > 0 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500 text-white">-{disc}%</span>
            )}
          </div>

          {/* Wishlist */}
          <button onClick={e => { e.preventDefault(); toggleWish(product) }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
              liked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white/90 border-surface-200 text-ink-400 opacity-0 group-hover:opacity-100'
            }`}>
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          </button>

          {/* Add to cart */}
          <motion.div className="absolute inset-x-0 bottom-0 p-3"
            initial={{ y: 60 }} animate={{ y: hovered ? 0 : 60 }}
            transition={{ duration:.25, ease:[.33,1,.68,1] }}>
            <button onClick={handleAdd}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-brand transition-colors">
              <ShoppingBag size={15} />
              {adding ? 'Added ✓' : 'Add to Cart'}
            </button>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-ink-400 text-xs mb-1">{product.category}</p>
          <h3 className="text-ink-900 font-semibold text-sm line-clamp-1 group-hover:text-brand-600 transition-colors mb-2">{product.name}</h3>
          <div className="flex items-center gap-1.5 mb-3">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={11} fill={s<=Math.round(product.rating||0)?'#f59e0b':'none'} stroke={s<=Math.round(product.rating||0)?'#f59e0b':'#cbd5e1'} />
            ))}
            <span className="text-ink-400 text-xs">({product.reviewCount})</span>
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="font-display font-bold text-ink-900 text-base">{fmt(product.price)}</span>
            {product.originalPrice && (
              <span className="text-ink-400 text-xs line-through">{fmt(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
