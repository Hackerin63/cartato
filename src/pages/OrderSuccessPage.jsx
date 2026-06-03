import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Package, ArrowRight, Truck, FileText } from 'lucide-react'

export default function OrderSuccessPage() {
  const { state } = useLocation()
  const orderNumber = state?.orderNumber || ('VX-' + Math.random().toString(36).slice(2,8).toUpperCase())
  const isCOD = state?.method === 'cod'

  return (
    <div className="min-h-screen bg-surface-50 pt-16 flex items-center justify-center px-4">
      <div className="relative max-w-lg w-full">
        {/* Confetti */}
        {Array.from({ length: 14 }, (_, i) => (
          <motion.div key={i} className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{ backgroundColor: ['#2563eb','#10b981','#f59e0b','#8b5cf6','#ef4444'][i%5], left:'50%', top:'30%' }}
            initial={{ x:0, y:0, opacity:1, scale:1 }}
            animate={{ x: Math.cos((i/14)*Math.PI*2)*130, y: Math.sin((i/14)*Math.PI*2)*110-50, opacity:0, scale:0 }}
            transition={{ delay:.1, duration:1, ease:'easeOut' }} />
        ))}

        <motion.div className="card shadow-card-lg p-8 sm:p-12 text-center"
          initial={{ opacity:0, scale:.92 }} animate={{ opacity:1, scale:1 }}
          transition={{ type:'spring', stiffness:300, damping:24 }}>
          <motion.div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
            initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:.15, type:'spring', stiffness:400, damping:18 }}>
            <CheckCircle size={40} className="text-emerald-600" />
          </motion.div>
          <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:.25 }}>
            <h1 className="font-display text-3xl font-bold text-ink-900 mb-3">
              {isCOD ? 'Order Placed! 🎉' : 'Payment Successful! 🎉'}
            </h1>
            <p className="text-ink-500 text-sm leading-relaxed mb-5">
              {isCOD ? 'Your order is confirmed. Pay cash when it arrives at your doorstep.' : 'Payment received and your order is being processed.'}
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-50 border border-brand-200 mb-4">
              <Package size={14} className="text-brand-600" />
              <span className="text-brand-700 font-semibold text-sm">Order #{orderNumber}</span>
            </div>
            {isCOD && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-5 text-left">
                <Truck size={14} className="text-amber-600 shrink-0" />
                <p className="text-amber-700 text-xs">Keep exact change ready. Delivery in 3–5 business days.</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <Link to="/orders" className="btn-primary">
                Track Order <ArrowRight size={16} />
              </Link>
              <Link to={`/invoice/${state?.orderId || 'demo'}`} className="btn-secondary">
                <FileText size={16} /> View Invoice
              </Link>
              <Link to="/products" className="btn-ghost">Continue Shopping</Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
