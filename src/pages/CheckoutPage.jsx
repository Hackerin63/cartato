import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, CreditCard, Truck, Check, ShoppingBag, ArrowLeft, AlertCircle, Copy } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../context/AuthContext'
import { fmt } from '../utils/data'
import toast from 'react-hot-toast'

const ADDR_FIELDS = [
  { key:'name',    label:'Full Name',              placeholder:'John Doe',         span:2, req:true  },
  { key:'phone',   label:'Phone Number',           placeholder:'+91 98765 43210',  span:1, req:true  },
  { key:'email',   label:'Email',                  placeholder:'you@example.com',  span:1, req:true  },
  { key:'line1',   label:'Address Line 1',         placeholder:'123, Street Name', span:2, req:true  },
  { key:'line2',   label:'Address Line 2',         placeholder:'Apt, Floor…',      span:2, req:false },
  { key:'city',    label:'City',                   placeholder:'Mumbai',           span:1, req:true  },
  { key:'state',   label:'State',                  placeholder:'Maharashtra',      span:1, req:true  },
  { key:'pincode', label:'PIN Code',               placeholder:'400001',           span:1, req:true  },
]

function AddressForm({ data, setData, errors, title, sameAs, onSameAs }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-ink-900 text-sm">{title}</h3>
        {onSameAs && (
          <label className="flex items-center gap-2 cursor-pointer text-xs text-ink-600">
            <input type="checkbox" checked={sameAs} onChange={onSameAs} className="accent-brand-600 w-3.5 h-3.5" />
            Same as shipping
          </label>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {ADDR_FIELDS.map(({ key, label, placeholder, span, req }) => (
          <div key={key} className={span===2?'col-span-2':'col-span-2 sm:col-span-1'}>
            <label className="block text-xs font-medium text-ink-600 mb-1.5">
              {label} {req && <span className="text-red-500">*</span>}
            </label>
            <input type="text" value={data[key]||''} placeholder={placeholder}
              onChange={e => setData(d => ({ ...d, [key]: e.target.value }))}
              className={`input ${errors?.[key] ? '!border-red-400 !ring-red-400/30' : ''}`} />
            {errors?.[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const { items, subtotal, discAmt, shipping, tax, total, coupon, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const emptyAddr = { name: user?.name||'', phone:'', email: user?.email||'', line1:'', line2:'', city:'', state:'', pincode:'' }
  const [step,     setStep]     = useState(1)
  const [shipAddr, setShipAddr] = useState({ ...emptyAddr })
  const [billAddr, setBillAddr] = useState({ ...emptyAddr })
  const [sameAddr, setSameAddr] = useState(true)
  const [method,   setMethod]   = useState('cod')
  const [loading,  setLoading]  = useState(false)
  const [shipErr,  setShipErr]  = useState({})
  const [billErr,  setBillErr]  = useState({})

  const validate = (addr, setErr) => {
    const e = {}
    ADDR_FIELDS.filter(f => f.req).forEach(({ key, label }) => {
      if (!addr[key]?.trim()) e[key] = `${label} is required`
    })
    if (addr.phone && !/^[6-9]\d{9}$/.test(addr.phone.replace(/\D/g,''))) e.phone = 'Enter valid 10-digit mobile number'
    if (addr.pincode && !/^\d{6}$/.test(addr.pincode)) e.pincode = 'Enter valid 6-digit PIN code'
    if (addr.email && !/\S+@\S+\.\S+/.test(addr.email)) e.email = 'Enter valid email address'
    setErr(e)
    return Object.keys(e).length === 0
  }

  const proceedToPayment = () => {
    if (!validate(shipAddr, setShipErr)) return
    if (!sameAddr && !validate(billAddr, setBillErr)) return
    setStep(2)
  }

  const placeOrder = async (paymentId = null, payStatus = 'pending') => {
    const billing = sameAddr ? shipAddr : billAddr
    const body = {
      items: items.map(i => ({ product_id:i._id, name:i.name, image:i.images?.[0]||'', price:i.price, quantity:i.qty, size:i.size||'' })),
      shipping_address: shipAddr,
      billing_address:  billing,
      payment_method:   method,
      payment_id:       paymentId,
      payment_status:   payStatus,
      coupon_code:      coupon||'',
      subtotal, discount: discAmt, shipping_cost: shipping, tax, total,
    }
    try {
      const data = await apiFetch('/orders', { method:'POST', body: JSON.stringify(body) })
      return data
    } catch {
      // Demo fallback if backend offline
      return { orderNumber: 'VX-' + Math.random().toString(36).slice(2,8).toUpperCase(), orderId: 'demo-' + Date.now() }
    }
  }

  const handleCOD = async () => {
    setLoading(true)
    try {
      const data = await placeOrder(null, 'pending')
      clear()
      navigate('/order-success', { state: { orderNumber: data.orderNumber, orderId: data.orderId, method:'cod' } })
    } catch { toast.error('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  const handleRazorpay = async () => {
    setLoading(true)
    try {
      // Load Razorpay script
      if (!window.Razorpay) {
        await new Promise((res, rej) => {
          const s = document.createElement('script')
          s.src = 'https://checkout.razorpay.com/v1/checkout.js'
          s.onload = res; s.onerror = rej
          document.body.appendChild(s)
        })
      }
      // Create order on backend
      let rpOrderId = null, rpKey = null
      try {
        const d = await apiFetch('/payments/razorpay/create-order', { method:'POST', body: JSON.stringify({ amount: total }) })
        rpOrderId = d.orderId; rpKey = d.key
      } catch {
        toast.error('Razorpay is not configured. Please use Cash on Delivery.')
        setMethod('cod'); setLoading(false); return
      }
      new window.Razorpay({
        key: rpKey,
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'cartato',
        description: 'Order Payment',
        order_id: rpOrderId,
        prefill: { name: user?.name||shipAddr.name, email: user?.email||shipAddr.email, contact: shipAddr.phone },
        theme: { color: '#2563eb' },
        handler: async (response) => {
          setLoading(true)
          const data = await placeOrder(response.razorpay_payment_id, 'paid')
          clear()
          navigate('/order-success', { state: { orderNumber: data.orderNumber, orderId: data.orderId, method:'razorpay' } })
          setLoading(false)
        },
        modal: { ondismiss: () => { setLoading(false); toast('Payment cancelled', { icon:'ℹ️' }) } },
      }).open()
    } catch { toast.error('Could not load payment gateway.'); setLoading(false) }
  }

  const handlePay = () => { method === 'cod' ? handleCOD() : handleRazorpay() }

  return (
    <div className="min-h-screen bg-surface-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-8">Checkout</h1>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {['Addresses','Payment'].map((lbl, i) => {
            const n = i + 1
            return (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step>=n?'bg-brand-600 text-white shadow-brand':'bg-surface-200 text-ink-500'}`}>
                  {step > n ? <Check size={14} /> : n}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step>=n?'text-ink-900':'text-ink-400'}`}>{lbl}</span>
                {n < 2 && <div className="w-8 sm:w-16 h-px bg-surface-200 mx-1" />}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" className="space-y-6" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }}>
                  <div className="card p-6">
                    <h2 className="font-semibold text-ink-900 flex items-center gap-2 mb-5">
                      <MapPin size={16} className="text-brand-600" /> Shipping Address
                    </h2>
                    <AddressForm data={shipAddr} setData={setShipAddr} errors={shipErr} title="Delivery Details" />
                  </div>
                  <div className="card p-6">
                    <AddressForm data={sameAddr ? shipAddr : billAddr}
                      setData={sameAddr ? setShipAddr : setBillAddr}
                      errors={sameAddr ? {} : billErr}
                      title="Billing Address"
                      sameAs={sameAddr}
                      onSameAs={() => { setSameAddr(!sameAddr); if (!sameAddr) setBillAddr({ ...shipAddr }) }}
                    />
                  </div>
                  <button onClick={proceedToPayment} className="btn-primary w-full py-3.5 rounded-2xl text-base">
                    Continue to Payment <Check size={16} />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" className="space-y-4" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                  {/* Address summary */}
                  <div className="card p-4 flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-ink-900 text-sm">{shipAddr.name}</p>
                      <p className="text-ink-500 text-xs mt-0.5">{shipAddr.line1}, {shipAddr.city}, {shipAddr.state} – {shipAddr.pincode}</p>
                      <p className="text-ink-500 text-xs">{shipAddr.phone} · {shipAddr.email}</p>
                    </div>
                    <button onClick={() => setStep(1)} className="btn-ghost text-xs gap-1 py-1.5 px-2">
                      <ArrowLeft size={11} /> Edit
                    </button>
                  </div>

                  {/* Payment method */}
                  <div className="card p-6">
                    <h2 className="font-semibold text-ink-900 flex items-center gap-2 mb-5">
                      <CreditCard size={16} className="text-brand-600" /> Payment Method
                    </h2>
                    <div className="space-y-3">
                      {/* COD */}
                      <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${method==='cod'?'border-brand-500 bg-brand-50':'border-surface-200 hover:border-surface-300'}`}>
                        <input type="radio" name="pm" value="cod" checked={method==='cod'} onChange={() => setMethod('cod')} className="mt-1 accent-brand-600" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Truck size={16} className="text-brand-600" />
                            <span className="font-semibold text-ink-900 text-sm">Cash on Delivery</span>
                            <span className="badge-green text-[10px]">Recommended</span>
                          </div>
                          <p className="text-ink-500 text-xs mt-1">Pay with cash when your order arrives. No card required.</p>
                        </div>
                      </label>
                      {/* Razorpay */}
                      <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${method==='razorpay'?'border-brand-500 bg-brand-50':'border-surface-200 hover:border-surface-300'}`}>
                        <input type="radio" name="pm" value="razorpay" checked={method==='razorpay'} onChange={() => setMethod('razorpay')} className="mt-1 accent-brand-600" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CreditCard size={16} className="text-brand-600" />
                            <span className="font-semibold text-ink-900 text-sm">Razorpay</span>
                          </div>
                          <p className="text-ink-500 text-xs mt-1">UPI, Cards, Net Banking, Wallets — all accepted.</p>
                          {method === 'razorpay' && (
                            <div className="flex items-start gap-2 mt-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                              <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                              <p className="text-amber-700 text-xs">Requires Razorpay API keys in the backend. Use COD if not configured.</p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>

                    <motion.button onClick={handlePay} disabled={loading}
                      className="btn-primary w-full mt-6 py-4 text-base rounded-2xl" whileTap={{ scale:.97 }}>
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Check size={17} />
                          {method==='cod' ? `Place Order — ${fmt(total)}` : `Pay ${fmt(total)}`}
                        </span>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary sidebar */}
          <div className="card p-5 h-fit sticky top-20">
            <h3 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
              <ShoppingBag size={15} className="text-brand-600" /> Order ({items.length} {items.length===1?'item':'items'})
            </h3>
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item._id+item.size} className="flex items-center gap-3">
                  <img src={item.images?.[0]||`https://picsum.photos/seed/${item._id}/40/40`} alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover border border-surface-200 shrink-0"
                    onError={e => { e.target.src=`https://picsum.photos/seed/${item._id}x/40/40` }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-ink-900 text-xs font-medium line-clamp-1">{item.name}</p>
                    <p className="text-ink-400 text-xs">×{item.qty}{item.size?` · ${item.size}`:''}</p>
                  </div>
                  <span className="font-semibold text-ink-900 text-xs shrink-0">{fmt(item.price*item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-surface-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-ink-500"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              {discAmt>0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{fmt(discAmt)}</span></div>}
              <div className="flex justify-between text-ink-500"><span>Shipping</span><span>{shipping===0?<span className="text-emerald-600">FREE</span>:fmt(shipping)}</span></div>
              <div className="flex justify-between text-ink-500"><span>GST</span><span>{fmt(tax)}</span></div>
              <div className="border-t border-surface-200 pt-2 flex justify-between font-bold text-ink-900 text-base">
                <span>Total</span><span>{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
