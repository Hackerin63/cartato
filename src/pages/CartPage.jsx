import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Trash2, Plus, Minus, Tag, ArrowRight, X, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { fmt } from '../utils/data'

export default function CartPage() {
  const { items, remove, setQty, subtotal, discAmt, shipping, tax, total, count, coupon, discount, applyCoupon, removeCoupon } = useCart()
  const { isAuth } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')

  const handleCoupon = () => {
    if (applyCoupon(code)) setCode('')
  }

  if (items.length === 0) return (
    <div className="min-h-screen bg-surface-50 pt-16 flex items-center justify-center px-4">
      <motion.div className="text-center" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
        <div className="w-24 h-24 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-6">
          <ShoppingCart size={36} className="text-ink-300" />
        </div>
        <h2 className="font-display text-2xl font-bold text-ink-900 mb-2">Your cart is empty</h2>
        <p className="text-ink-500 text-sm mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary">Start Shopping <ArrowRight size={16} /></Link>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag size={22} className="text-brand-600" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">Shopping Cart</h1>
          <span className="badge-blue">{count} {count===1?'item':'items'}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map(item => {
                const key = item._id + '|' + (item.size||'')
                return (
                  <motion.div key={key} layout initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                    exit={{ opacity:0, x:-20, height:0 }} transition={{ duration:.25 }}
                    className="card p-4 flex gap-4">
                    <Link to={`/products/${item._id}`} className="shrink-0">
                      <img src={item.images?.[0]||`https://picsum.photos/seed/${item._id}/80/80`} alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-surface-200"
                        onError={e => { e.target.src=`https://picsum.photos/seed/${item._id}x/80/80` }} />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <div>
                          <p className="text-ink-400 text-xs">{item.category}</p>
                          <Link to={`/products/${item._id}`} className="font-semibold text-ink-900 text-sm hover:text-brand-600 transition-colors line-clamp-1">{item.name}</Link>
                          {item.size && <p className="text-ink-400 text-xs mt-0.5">Size: <span className="font-medium text-ink-600">{item.size}</span></p>}
                        </div>
                        <button onClick={() => remove(key)} className="p-1.5 text-ink-300 hover:text-red-500 transition-colors shrink-0"><Trash2 size={15} /></button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-surface-200 rounded-xl overflow-hidden">
                          <button onClick={() => setQty(key, item.qty-1)} className="px-2.5 py-1.5 hover:bg-surface-50 text-ink-500 transition-colors"><Minus size={13} /></button>
                          <span className="w-8 text-center text-sm font-semibold text-ink-900">{item.qty}</span>
                          <button onClick={() => setQty(key, item.qty+1)} className="px-2.5 py-1.5 hover:bg-surface-50 text-ink-500 transition-colors"><Plus size={13} /></button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-ink-900">{fmt(item.price * item.qty)}</p>
                          {item.qty > 1 && <p className="text-ink-400 text-xs">{fmt(item.price)} each</p>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            <Link to="/products" className="flex items-center gap-2 text-sm text-ink-400 hover:text-brand-600 transition-colors pt-2">
              <ArrowRight size={13} className="rotate-180" /> Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="card p-6 h-fit sticky top-20">
            <h2 className="font-semibold text-ink-900 text-base mb-5">Order Summary</h2>
            {/* Coupon */}
            <div className="mb-5">
              {coupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-brand-50 border border-brand-200">
                  <div className="flex items-center gap-2">
                    <Tag size={13} className="text-brand-600" />
                    <span className="text-brand-700 text-sm font-semibold">{coupon}</span>
                    <span className="text-brand-500 text-xs">(-{discount}%)</span>
                  </div>
                  <button onClick={removeCoupon} className="text-ink-400 hover:text-red-500 transition-colors"><X size={13} /></button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key==='Enter' && handleCoupon()}
                      placeholder="Coupon code" className="input flex-1 text-sm" />
                    <button onClick={handleCoupon} className="btn-secondary text-sm px-4 py-2 rounded-xl whitespace-nowrap">Apply</button>
                  </div>
                  <p className="text-ink-400 text-xs">Try: cartato10, cartato20, WELCOME15, SAVE25</p>
                </div>
              )}
            </div>
            {/* Breakdown */}
            <div className="space-y-3 text-sm border-t border-surface-100 pt-4">
              <div className="flex justify-between text-ink-500"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              {discAmt > 0 && <div className="flex justify-between text-emerald-600 font-medium"><span>Discount ({discount}%)</span><span>-{fmt(discAmt)}</span></div>}
              <div className="flex justify-between text-ink-500"><span>Shipping</span><span>{shipping===0?<span className="text-emerald-600 font-medium">FREE</span>:fmt(shipping)}</span></div>
              <div className="flex justify-between text-ink-500"><span>GST (5%)</span><span>{fmt(tax)}</span></div>
              {subtotal < 4999 && <p className="text-xs text-brand-600 bg-brand-50 rounded-lg p-2.5 border border-brand-100">Add {fmt(4999-subtotal)} more for free shipping!</p>}
              <div className="border-t border-surface-200 pt-3 flex justify-between font-bold text-ink-900 text-base">
                <span>Total</span><span>{fmt(total)}</span>
              </div>
            </div>
            <motion.button onClick={() => isAuth ? navigate('/checkout') : navigate('/login', { state:{ from:{ pathname:'/checkout' } } })}
              className="btn-primary w-full mt-5 py-3.5 text-base rounded-2xl"
              whileHover={{ scale:1.01 }} whileTap={{ scale:.98 }}>
              {isAuth ? 'Proceed to Checkout' : 'Sign In to Checkout'} <ArrowRight size={17} />
            </motion.button>
            <div className="flex items-center justify-center gap-2 mt-4">
              {['Razorpay','UPI','COD','NetBanking'].map(p => (
                <span key={p} className="px-2 py-0.5 border border-surface-200 rounded text-[10px] text-ink-400 font-mono">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
