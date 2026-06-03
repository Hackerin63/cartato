import { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'
import { COUPONS } from '../utils/data'

const Ctx = createContext(null)
const load = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) || fb } catch { return fb } }

function reducer(s, a) {
  switch (a.type) {
    case 'ADD': {
      const key = a.item._id + '|' + (a.item.size || '')
      const ex  = s.items.find(i => (i._id + '|' + (i.size || '')) === key)
      return { ...s, items: ex
        ? s.items.map(i => (i._id+'|'+(i.size||'')) === key ? { ...i, qty: Math.min(i.qty+1,10) } : i)
        : [...s.items, { ...a.item, qty: 1 }] }
    }
    case 'REMOVE': return { ...s, items: s.items.filter(i => (i._id+'|'+(i.size||'')) !== a.key) }
    case 'QTY':    return { ...s, items: a.qty < 1
        ? s.items.filter(i => (i._id+'|'+(i.size||'')) !== a.key)
        : s.items.map(i => (i._id+'|'+(i.size||'')) === a.key ? { ...i, qty: a.qty } : i) }
    case 'CLEAR':  return { ...s, items: [], coupon: null, discount: 0 }
    case 'COUPON': return { ...s, coupon: a.code, discount: a.pct }
    case 'UNCOUPON': return { ...s, coupon: null, discount: 0 }
    case 'WISH':   return { ...s, wishlist: s.wishlist.find(i=>i._id===a.item._id)
        ? s.wishlist.filter(i=>i._id!==a.item._id)
        : [...s.wishlist, a.item] }
    default: return s
  }
}

export function CartProvider({ children }) {
  const [s, dispatch] = useReducer(reducer, {
    items:    load('vx_cart', []),
    wishlist: load('vx_wish', []),
    coupon: null, discount: 0,
  })

  useEffect(() => { localStorage.setItem('vx_cart', JSON.stringify(s.items))    }, [s.items])
  useEffect(() => { localStorage.setItem('vx_wish', JSON.stringify(s.wishlist)) }, [s.wishlist])

  const addToCart = (item) => { dispatch({ type:'ADD', item }); toast.success('Added to cart') }
  const remove    = (key)  => dispatch({ type:'REMOVE', key })
  const setQty    = (key, qty) => dispatch({ type:'QTY', key, qty })
  const clear     = ()     => dispatch({ type:'CLEAR' })
  const toggleWish= (item) => {
    const has = s.wishlist.find(i=>i._id===item._id)
    dispatch({ type:'WISH', item })
    toast(has ? 'Removed from wishlist' : 'Added to wishlist', { icon: has ? '💔' : '❤️' })
  }
  const inWish = (id) => s.wishlist.some(i=>i._id===id)
  const applyCoupon = (code) => {
    const upper = code.trim().toUpperCase()
    const pct   = COUPONS[upper]
    if (!pct) { toast.error('Invalid coupon code'); return false }
    dispatch({ type:'COUPON', code: upper, pct })
    toast.success(`${upper} applied — ${pct}% off!`)
    return true
  }
  const removeCoupon = () => dispatch({ type:'UNCOUPON' })

  const subtotal = s.items.reduce((acc,i) => acc + i.price * i.qty, 0)
  const discAmt  = Math.round(subtotal * s.discount / 100)
  const shipping = subtotal > 4999 ? 0 : 199
  const tax      = Math.round((subtotal - discAmt) * 0.05)
  const total    = subtotal - discAmt + shipping + tax
  const count    = s.items.reduce((acc,i) => acc + i.qty, 0)

  return (
    <Ctx.Provider value={{ ...s, addToCart, remove, setQty, clear, toggleWish, inWish, applyCoupon, removeCoupon, subtotal, discAmt, shipping, tax, total, count }}>
      {children}
    </Ctx.Provider>
  )
}

export const useCart = () => useContext(Ctx)
