import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Printer, Download, ArrowLeft, CheckCircle } from 'lucide-react'
import { apiFetch } from '../context/AuthContext'
import { fmt, fmtDate, fmtTime } from '../utils/data'
import { Spinner } from '../components/Skeleton'

export default function InvoicePage() {
  const { id }   = useParams()
  const [order,  setOrder]  = useState(null)
  const [loading,setLoading]= useState(true)

  useEffect(() => {
    apiFetch(`/orders/${id}`)
      .then(d => setOrder(d.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen bg-surface-50 pt-16"><Spinner size={36} className="mt-20 mx-auto" /></div>

  // Demo invoice when backend offline
  const o = order || {
    id, order_number: id.startsWith('demo') ? 'VX-DEMO01' : id,
    created_at: new Date().toISOString(),
    status: 'processing', payment_status: 'paid', payment_method: 'cod',
    ship_name:'John Doe', ship_phone:'+91 98765 43210', ship_line1:'123 Main Street',
    ship_city:'Mumbai', ship_state:'Maharashtra', ship_zip:'400001',
    bill_name:'John Doe', bill_line1:'123 Main Street', bill_city:'Mumbai', bill_state:'Maharashtra', bill_zip:'400001',
    items: [
      { name:'Swiss Chronograph Pro', price:74999, quantity:1, size:'', image:'' },
      { name:'Linen Silk Blazer',     price:28999, quantity:1, size:'M', image:'' },
    ],
    subtotal:103998, discount:10400, shipping_cost:0, tax:4680, total:98278, coupon_code:'cartato10',
  }

  const handlePrint = () => window.print()

  const handleDownload = () => {
    const el = document.getElementById('invoice-print')
    if (!el) return
    const w = window.open('', '_blank')
    w.document.write(`<html><head><title>Invoice ${o.order_number}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet"/>
      <style>*{box-sizing:border-box;-webkit-font-smoothing:antialiased}body{font-family:Inter,sans-serif;margin:0;padding:32px;color:#0f172a;background:#fff;font-size:13px}table{width:100%;border-collapse:collapse}th,td{padding:8px 12px;text-align:left}th{font-weight:600;border-bottom:1px solid #e2e8f0}td{border-bottom:1px solid #f1f5f9}</style>
    </head><body>${el.innerHTML}</body></html>`)
    w.document.close()
    w.focus()
    w.print()
    w.close()
  }

  return (
    <div className="min-h-screen bg-surface-100 pt-16">
      {/* Action bar */}
      <div className="no-print bg-white border-b border-surface-200 sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to={`/orders/${id}`} className="btn-ghost text-sm gap-1.5 py-1.5">
            <ArrowLeft size={14} /> Back to Order
          </Link>
          <div className="flex gap-2">
            <button onClick={handleDownload} className="btn-secondary text-sm py-1.5 px-4">
              <Download size={14} /> Download
            </button>
            <button onClick={handlePrint} className="btn-primary text-sm py-1.5 px-4">
              <Printer size={14} /> Print Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Invoice document */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div id="invoice-print" className="bg-white rounded-2xl shadow-card-lg overflow-hidden"
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>

          {/* Header band */}
          <div className="bg-gradient-to-r from-brand-700 to-brand-600 px-8 py-7 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="font-display font-bold text-white text-base">V</span>
                </div>
                <span className="font-display font-bold text-white text-xl tracking-tight">cartato</span>
              </div>
              <p className="text-white/70 text-xs">support@cartato.store</p>
              <p className="text-white/70 text-xs">www.cartato.store</p>
              <p className="text-white/70 text-xs mt-1">GSTIN: 27AAACV1234F1Z5</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Invoice</p>
              <p className="font-display font-bold text-white text-2xl">#{o.order_number}</p>
              <p className="text-white/70 text-xs mt-2">Date: {fmtDate(o.created_at)}</p>
              <p className="text-white/70 text-xs">Time: {fmtTime(o.created_at)}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                <CheckCircle size={12} />
                {o.payment_status === 'paid' ? 'PAID' : o.payment_method === 'cod' ? 'PAY ON DELIVERY' : 'PAYMENT PENDING'}
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-b border-surface-200">
            {/* Billed by */}
            <div className="p-6 border-r border-surface-200">
              <p className="text-xs font-semibold text-ink-400 uppercase tracking-widest mb-3">Billed By</p>
              <p className="font-bold text-ink-900 text-sm">cartato Store Pvt. Ltd.</p>
              <p className="text-ink-500 text-xs mt-1">123 Commerce Tower,</p>
              <p className="text-ink-500 text-xs">Bandra Kurla Complex,</p>
              <p className="text-ink-500 text-xs">Mumbai – 400051</p>
              <p className="text-ink-500 text-xs mt-1">Maharashtra, India</p>
            </div>

            {/* Shipping address */}
            <div className="p-6 border-r border-surface-200">
              <p className="text-xs font-semibold text-ink-400 uppercase tracking-widest mb-3">Ship To</p>
              <p className="font-bold text-ink-900 text-sm">{o.ship_name}</p>
              {o.ship_phone && <p className="text-ink-500 text-xs mt-0.5">{o.ship_phone}</p>}
              <p className="text-ink-500 text-xs mt-1">{o.ship_line1}</p>
              {o.ship_line2 && <p className="text-ink-500 text-xs">{o.ship_line2}</p>}
              <p className="text-ink-500 text-xs">{o.ship_city}, {o.ship_state}</p>
              <p className="text-ink-500 text-xs">{o.ship_zip}, India</p>
            </div>

            {/* Billing address */}
            <div className="p-6">
              <p className="text-xs font-semibold text-ink-400 uppercase tracking-widest mb-3">Bill To</p>
              <p className="font-bold text-ink-900 text-sm">{o.bill_name || o.ship_name}</p>
              <p className="text-ink-500 text-xs mt-1">{o.bill_line1 || o.ship_line1}</p>
              {(o.bill_line2 || o.ship_line2) && <p className="text-ink-500 text-xs">{o.bill_line2 || o.ship_line2}</p>}
              <p className="text-ink-500 text-xs">{o.bill_city||o.ship_city}, {o.bill_state||o.ship_state}</p>
              <p className="text-ink-500 text-xs">{o.bill_zip||o.ship_zip}, India</p>
            </div>
          </div>

          {/* Order info strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 bg-surface-50 border-b border-surface-200">
            {[
              ['Order Number',   `#${o.order_number}`],
              ['Order Date',     fmtDate(o.created_at)],
              ['Payment Method', o.payment_method==='cod'?'Cash on Delivery':'Razorpay'],
              ['Order Status',   (o.status||'').charAt(0).toUpperCase()+(o.status||'').slice(1)],
            ].map(([l, v]) => (
              <div key={l} className="p-4 border-r last:border-r-0 border-surface-200">
                <p className="text-ink-400 text-xs">{l}</p>
                <p className="font-semibold text-ink-900 text-sm mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          {/* Line items */}
          <div className="px-6 py-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-surface-200">
                  <th className="py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider w-8">#</th>
                  <th className="py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Product</th>
                  <th className="py-3 text-center text-xs font-semibold text-ink-500 uppercase tracking-wider w-20">Qty</th>
                  <th className="py-3 text-right text-xs font-semibold text-ink-500 uppercase tracking-wider w-32">Unit Price</th>
                  <th className="py-3 text-right text-xs font-semibold text-ink-500 uppercase tracking-wider w-32">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(o.items||[]).map((item, i) => (
                  <tr key={i} className="border-b border-surface-100">
                    <td className="py-4 text-ink-400 text-xs">{i+1}</td>
                    <td className="py-4">
                      <p className="font-medium text-ink-900">{item.name}</p>
                      {item.size && <p className="text-ink-400 text-xs mt-0.5">Size: {item.size}</p>}
                    </td>
                    <td className="py-4 text-center font-medium text-ink-700">{item.quantity}</td>
                    <td className="py-4 text-right text-ink-700">{fmt(item.price)}</td>
                    <td className="py-4 text-right font-semibold text-ink-900">{fmt(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end px-6 pb-6">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-ink-500">
                <span>Subtotal</span><span>{fmt(o.subtotal)}</span>
              </div>
              {o.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount {o.coupon_code ? `(${o.coupon_code})` : ''}</span>
                  <span>-{fmt(o.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-ink-500">
                <span>Shipping</span>
                <span>{o.shipping_cost===0 ? 'FREE' : fmt(o.shipping_cost)}</span>
              </div>
              <div className="flex justify-between text-ink-500">
                <span>GST (5%)</span><span>{fmt(o.tax)}</span>
              </div>
              <div className="border-t-2 border-ink-900 pt-2 flex justify-between font-bold text-ink-900 text-base">
                <span>Total Amount</span><span>{fmt(o.total)}</span>
              </div>
              {o.payment_method === 'cod' && (
                <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-amber-700 text-xs font-semibold">Cash on Delivery</p>
                  <p className="text-amber-600 text-xs mt-0.5">Amount to be paid on delivery: <strong>{fmt(o.total)}</strong></p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-surface-50 border-t border-surface-200 px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-ink-500 text-xs">Thank you for shopping with <strong className="text-ink-700">cartato</strong>!</p>
              <p className="text-ink-400 text-xs mt-0.5">For support: support@cartato.store · +91 80000 00000</p>
            </div>
            <div className="text-right">
              <p className="text-ink-400 text-[10px]">This is a computer-generated invoice.</p>
              <p className="text-ink-400 text-[10px]">No signature required.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
