import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, ArrowLeft, MapPin, CreditCard, Truck, Check, X, FileText, AlertTriangle } from 'lucide-react'
import { apiFetch } from '../context/AuthContext'
import { fmt, fmtDate, STATUS, PAYMENT_STATUS } from '../utils/data'
import { Spinner, EmptyState } from '../components/Skeleton'
import toast from 'react-hot-toast'

/* ═══════════════════════════════════════════════════════════ Orders List */
export function OrdersPage() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    apiFetch('/orders/my-orders')
      .then(d => setOrders(d.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  if (loading) return <div className="min-h-screen bg-surface-50 pt-16"><Spinner size={36} className="mt-20 mx-auto" /></div>

  return (
    <div className="min-h-screen bg-surface-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-6 flex items-center gap-3">
          <Package size={24} className="text-brand-600" /> My Orders
        </h1>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {['all','pending','processing','shipped','delivered','cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter===s ? 'bg-brand-600 text-white shadow-brand' : 'bg-white text-ink-600 border border-surface-200 hover:border-brand-300'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="📦" title="No orders found"
            sub={filter==='all' ? "You haven't placed any orders yet." : `No ${filter} orders.`}
            action={<Link to="/products" className="btn-primary">Start Shopping</Link>} />
        ) : (
          <div className="space-y-4">
            {filtered.map((o, i) => (
              <motion.div key={o.id} className="card p-5 hover:shadow-card-md transition-shadow cursor-pointer"
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.06 }}
                onClick={() => navigate(`/orders/${o.id}`)}>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="font-semibold text-ink-900">#{o.order_number}</p>
                    <p className="text-ink-400 text-xs mt-0.5">{fmtDate(o.created_at)}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className={STATUS[o.status]?.cls || 'badge-gray'}>{STATUS[o.status]?.label || o.status}</span>
                    <span className={PAYMENT_STATUS[o.payment_status]?.cls || 'badge-gray'}>{PAYMENT_STATUS[o.payment_status]?.label || o.payment_status}</span>
                  </div>
                </div>
                {o.items?.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {o.items.slice(0,5).map((item,j) => (
                      <img key={j} src={item.image||`https://picsum.photos/seed/${j}/48/48`} alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-surface-200"
                        onError={e => { e.target.src=`https://picsum.photos/seed/img${j}/48/48` }} />
                    ))}
                    {o.items.length > 5 && <div className="w-12 h-12 rounded-xl bg-surface-100 border border-surface-200 flex items-center justify-center text-xs font-medium text-ink-500">+{o.items.length-5}</div>}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="font-bold text-ink-900">{fmt(o.total)}</p>
                  <div className="flex gap-3">
                    <Link to={`/invoice/${o.id}`} onClick={e=>e.stopPropagation()} className="text-brand-600 text-xs hover:underline font-medium flex items-center gap-1">
                      <FileText size={12} /> Invoice
                    </Link>
                    <span className="text-brand-600 text-xs font-medium">View Details →</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ Order Detail */
export function OrderDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [order,    setOrder]    = useState(null)
  const [timeline, setTimeline] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const loadOrder = () => {
    setLoading(true)
    Promise.all([apiFetch(`/orders/${id}`), apiFetch(`/orders/${id}/track`)])
      .then(([od, td]) => { setOrder(od.order); setTimeline(td.timeline || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadOrder() }, [id])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await apiFetch(`/orders/${id}/cancel`, { method:'POST' })
      toast.success('Order cancelled successfully')
      setShowConfirm(false)
      loadOrder()
    } catch (e) {
      toast.error(e.message || 'Could not cancel order')
    } finally { setCancelling(false) }
  }

  if (loading) return <div className="min-h-screen bg-surface-50 pt-16"><Spinner size={36} className="mt-20 mx-auto" /></div>
  if (!order)  return (
    <div className="min-h-screen bg-surface-50 pt-16 flex items-center justify-center">
      <EmptyState icon="📦" title="Order not found" action={<Link to="/orders" className="btn-primary">Back to Orders</Link>} />
    </div>
  )

  const canCancel = ['pending','processing'].includes(order.status)
  const STEPS = [Package, CreditCard, Truck, Check]

  return (
    <div className="min-h-screen bg-surface-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-ink-400 hover:text-brand-600 transition-colors text-sm mb-6">
          <ArrowLeft size={14} /> Back to Orders
        </button>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">Order #{order.order_number}</h1>
            <p className="text-ink-500 text-sm mt-1">Placed on {fmtDate(order.created_at)}</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <span className={STATUS[order.status]?.cls||'badge-gray'}>{STATUS[order.status]?.label||order.status}</span>
            <span className={PAYMENT_STATUS[order.payment_status]?.cls||'badge-gray'}>{PAYMENT_STATUS[order.payment_status]?.label||order.payment_status}</span>
            <Link to={`/invoice/${order.id}`} className="btn-secondary text-sm py-1.5 px-3">
              <FileText size={14} /> Invoice
            </Link>
            {canCancel && (
              <button onClick={() => setShowConfirm(true)} className="btn-danger text-sm py-1.5 px-3">
                <X size={14} /> Cancel Order
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Tracking timeline */}
            {timeline.length > 0 && (
              <div className="card p-6">
                <h3 className="font-semibold text-ink-900 mb-6">Order Tracking</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-surface-200" />
                  <div className="space-y-5">
                    {timeline.map((step, i) => {
                      const Icon = STEPS[i] || Package
                      return (
                        <div key={i} className="flex items-start gap-4 relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${step.done?'bg-brand-600 text-white shadow-brand':'bg-white border-2 border-surface-200 text-ink-400'}`}>
                            {step.done ? <Check size={14} /> : <Icon size={13} />}
                          </div>
                          <div className="pt-1.5">
                            <p className={`text-sm font-semibold ${step.done?'text-ink-900':'text-ink-400'}`}>{step.step}</p>
                            {step.date && <p className="text-xs text-ink-400 mt-0.5">{fmtDate(step.date)}</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                {order.tracking_number && (
                  <div className="mt-5 p-3 rounded-xl bg-surface-50 border border-surface-200">
                    <p className="text-xs text-ink-500">Tracking Number</p>
                    <p className="font-mono text-sm font-semibold text-ink-900 mt-0.5">{order.tracking_number}</p>
                  </div>
                )}
              </div>
            )}

            {/* Items */}
            <div className="card p-6">
              <h3 className="font-semibold text-ink-900 mb-4">Items Ordered</h3>
              <div className="space-y-4">
                {(order.items||[]).map((item,i) => (
                  <div key={i} className="flex items-center gap-4">
                    <img src={item.image||`https://picsum.photos/seed/${i}/56/56`} alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover border border-surface-200 shrink-0"
                      onError={e => { e.target.src=`https://picsum.photos/seed/oi${i}/56/56` }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink-900 text-sm line-clamp-1">{item.name}</p>
                      <p className="text-ink-400 text-xs mt-0.5">{item.size?`Size: ${item.size} · `:''}{fmt(item.price)} × {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-ink-900 text-sm shrink-0">{fmt(item.price*item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Price */}
            <div className="card p-5">
              <h3 className="font-semibold text-ink-900 mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                {[['Subtotal', order.subtotal],
                  order.discount>0&&['Discount',  -order.discount],
                  ['Shipping', order.shipping_cost],
                  ['GST',      order.tax],
                ].filter(Boolean).map(([l,v]) => (
                  <div key={l} className={`flex justify-between ${v<0?'text-emerald-600':'text-ink-500'}`}>
                    <span>{l}</span><span>{v<0?'-':''}{fmt(Math.abs(v))}</span>
                  </div>
                ))}
                <div className="border-t border-surface-200 pt-2 flex justify-between font-bold text-ink-900 text-base">
                  <span>Total</span><span>{fmt(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Shipping address */}
            <div className="card p-5">
              <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2"><MapPin size={14} className="text-brand-600" />Shipping To</h3>
              <div className="text-sm text-ink-500 space-y-0.5">
                <p className="font-semibold text-ink-900">{order.ship_name}</p>
                {order.ship_phone && <p>{order.ship_phone}</p>}
                <p>{order.ship_line1}{order.ship_line2?`, ${order.ship_line2}`:''}</p>
                <p>{order.ship_city}, {order.ship_state} – {order.ship_zip}</p>
              </div>
            </div>

            {/* Billing address */}
            {order.bill_name && (
              <div className="card p-5">
                <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2"><CreditCard size={14} className="text-brand-600" />Billing To</h3>
                <div className="text-sm text-ink-500 space-y-0.5">
                  <p className="font-semibold text-ink-900">{order.bill_name}</p>
                  <p>{order.bill_line1}</p>
                  <p>{order.bill_city}, {order.bill_state} – {order.bill_zip}</p>
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="card p-5">
              <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2"><CreditCard size={14} className="text-brand-600" />Payment</h3>
              <p className="text-sm text-ink-500 capitalize">{order.payment_method==='cod'?'Cash on Delivery':'Razorpay'}</p>
              <span className={`mt-1.5 inline-block ${PAYMENT_STATUS[order.payment_status]?.cls||'badge-gray'}`}>
                {PAYMENT_STATUS[order.payment_status]?.label||order.payment_status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <motion.div className="relative card shadow-card-lg p-7 max-w-sm w-full"
            initial={{ scale:.95, opacity:0 }} animate={{ scale:1, opacity:1 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-ink-900">Cancel Order?</h3>
                <p className="text-ink-500 text-xs">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-ink-600 text-sm mb-6">Your order #{order.order_number} will be cancelled and a refund (if applicable) will be processed within 5–7 business days.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1">Keep Order</button>
              <button onClick={handleCancel} disabled={cancelling} className="btn-danger flex-1">
                {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default OrdersPage
