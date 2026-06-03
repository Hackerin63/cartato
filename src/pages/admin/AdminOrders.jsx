import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Search, X, Check, Users, ChevronDown, Ban, Mail, Shield } from 'lucide-react'
import { AdminSidebar } from './AdminDashboard'
import { apiFetch } from '../../context/AuthContext'
import { fmt, fmtDate, STATUS, PAYMENT_STATUS } from '../../utils/data'
import toast from 'react-hot-toast'

/* ─── Order update modal ───────────────────────────────────────────────── */
function OrderModal({ order, onClose, onUpdated }) {
  const [status,   setStatus]   = useState(order.status)
  const [payment,  setPayment]  = useState(order.payment_status)
  const [tracking, setTracking] = useState(order.tracking_number||'')
  const [notes,    setNotes]    = useState(order.notes||'')
  const [saving,   setSaving]   = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await apiFetch(`/admin/orders/${order.id}`, {
        method:'PUT',
        body: JSON.stringify({ status, payment_status:payment, tracking_number:tracking, notes }),
      })
      toast.success('Order updated!')
      onUpdated(); onClose()
    } catch (e) { toast.error(e.message||'Update failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} initial={{ opacity:0 }} animate={{ opacity:1 }} />
      <motion.div className="relative w-full max-w-md bg-white rounded-2xl shadow-card-lg"
        initial={{ scale:.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:.95, opacity:0 }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <h3 className="font-semibold text-ink-900">Update Order #{order.order_number}</h3>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-ink-400 text-xs">Customer</p><p className="font-semibold text-ink-900 mt-0.5">{order.user_name||'Guest'}</p></div>
            <div><p className="text-ink-400 text-xs">Total</p><p className="font-bold text-ink-900 mt-0.5">{fmt(order.total)}</p></div>
            <div><p className="text-ink-400 text-xs">Ship to</p><p className="text-ink-600 text-xs mt-0.5">{order.ship_city}, {order.ship_state}</p></div>
            <div><p className="text-ink-400 text-xs">Method</p><p className="text-ink-600 text-xs mt-0.5 capitalize">{order.payment_method}</p></div>
          </div>

          <div>
            <label className="text-xs font-medium text-ink-600 block mb-1.5">Order Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value)} className="input cursor-pointer">
              {['pending','processing','shipped','delivered','cancelled'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-ink-600 block mb-1.5">Payment Status</label>
            <select value={payment} onChange={e=>setPayment(e.target.value)} className="input cursor-pointer">
              {['pending','paid','failed','refunded'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-ink-600 block mb-1.5">Tracking Number</label>
            <input value={tracking} onChange={e=>setTracking(e.target.value)}
              className="input font-mono text-sm" placeholder="e.g. EM123456789IN" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-600 block mb-1.5">Internal Notes</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)}
              className="input resize-none" rows={2} placeholder="Optional notes for this order…" />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-surface-200">
          <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-60">
            {saving ? 'Saving…' : <><Check size={14} />Update Order</>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ Admin Orders */
export function AdminOrdersPage() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [status,  setStatus]  = useState('')
  const [editing, setEditing] = useState(null)
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(0)

  const fetch = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page:String(page) })
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      const d = await apiFetch(`/admin/orders?${params}`)
      setOrders(d.orders||[]); setTotal(d.total||0)
    } catch { setOrders([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [page, search, status])

  return (
    <div className="min-h-screen bg-surface-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-2xl font-bold text-ink-900 mb-8 flex items-center gap-2">
          <ShoppingCart size={22} className="text-brand-600" /> Orders Management
        </h1>
        <div className="flex gap-8">
          <AdminSidebar />
          <div className="flex-1 space-y-5">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48 max-w-xs">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1) }}
                  placeholder="Search order # or name…" className="input pl-9 text-sm" />
              </div>
              <div className="relative">
                <select value={status} onChange={e=>{ setStatus(e.target.value); setPage(1) }} className="input pr-8 text-sm appearance-none cursor-pointer">
                  <option value="">All Statuses</option>
                  {['pending','processing','shipped','delivered','cancelled'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th><th></th></tr></thead>
                  <tbody>
                    {loading ? (
                      Array(6).fill(0).map((_,i) => <tr key={i}>{Array(7).fill(0).map((_,j) => <td key={j}><div className="h-4 skeleton rounded" /></td>)}</tr>)
                    ) : orders.length===0 ? (
                      <tr><td colSpan={7} className="text-center text-ink-400 text-xs py-12">No orders found.</td></tr>
                    ) : orders.map(o => (
                      <tr key={o.id}>
                        <td><span className="font-mono text-xs text-brand-600">#{o.order_number}</span></td>
                        <td>
                          <p className="text-ink-800 text-xs font-medium">{o.user_name||'Guest'}</p>
                          <p className="text-ink-400 text-[11px]">{o.user_email||''}</p>
                        </td>
                        <td className="font-semibold text-ink-900 text-sm">{fmt(o.total)}</td>
                        <td><span className={STATUS[o.status]?.cls||'badge-gray'}>{STATUS[o.status]?.label||o.status}</span></td>
                        <td><span className={PAYMENT_STATUS[o.payment_status]?.cls||'badge-gray'}>{PAYMENT_STATUS[o.payment_status]?.label||o.payment_status}</span></td>
                        <td className="text-ink-400 text-xs whitespace-nowrap">{fmtDate(o.created_at)}</td>
                        <td>
                          <button onClick={() => setEditing(o)}
                            className="text-brand-600 text-xs font-semibold hover:underline whitespace-nowrap">Edit →</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {total > 20 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-surface-200">
                  <p className="text-xs text-ink-500">Showing {(page-1)*20+1}–{Math.min(page*20,total)} of {total}</p>
                  <div className="flex gap-2">
                    <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">← Prev</button>
                    <button disabled={page*20>=total} onClick={() => setPage(p=>p+1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Next →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {editing && <OrderModal order={editing} onClose={() => setEditing(null)} onUpdated={fetch} />}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ Admin Users */
export function AdminUsersPage() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(0)

  const fetch = async () => {
    setLoading(true)
    try {
      const d = await apiFetch(`/admin/users?page=${page}`)
      setUsers(d.users||[]); setTotal(d.total||0)
    } catch { setUsers([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [page])

  const filtered = search
    ? users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    : users

  const toggleBan = async (u) => {
    if (!confirm(`${u.is_banned?'Unban':'Ban'} user "${u.name}"?`)) return
    try {
      await apiFetch(`/admin/users/${u.id}/ban`, { method:'POST' })
      toast.success(`User ${u.is_banned?'unbanned':'banned'}`)
      fetch()
    } catch {
      toast.success('Updated (demo mode)')
      setUsers(us => us.map(x => x.id===u.id ? { ...x, is_banned: !x.is_banned } : x))
    }
  }

  const promoteAdmin = async (u) => {
    if (!confirm(`Make "${u.name}" an admin?`)) return
    try {
      await apiFetch(`/admin/users/${u.id}/promote`, { method:'POST' })
      toast.success(`${u.name} is now an admin`)
      fetch()
    } catch {
      toast.success('Updated (demo mode)')
      setUsers(us => us.map(x => x.id===u.id ? { ...x, role:'admin' } : x))
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-2xl font-bold text-ink-900 mb-8 flex items-center gap-2">
          <Users size={22} className="text-brand-600" /> Users Management
        </h1>
        <div className="flex gap-8">
          <AdminSidebar />
          <div className="flex-1 space-y-5">
            <div className="relative max-w-xs">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search users…" className="input pl-9 text-sm" />
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Orders</th><th>Total Spent</th><th>Joined</th><th>Actions</th></tr></thead>
                  <tbody>
                    {loading ? (
                      Array(6).fill(0).map((_,i) => <tr key={i}>{Array(7).fill(0).map((_,j) => <td key={j}><div className="h-4 skeleton rounded" /></td>)}</tr>)
                    ) : filtered.length===0 ? (
                      <tr><td colSpan={7} className="text-center text-ink-400 text-xs py-12">No users found.</td></tr>
                    ) : filtered.map(u => (
                      <tr key={u.id} className={u.is_banned ? 'opacity-50' : ''}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-ink-900 text-xs">{u.name}</p>
                              {u.is_banned && <span className="badge-red text-[10px]">Banned</span>}
                            </div>
                          </div>
                        </td>
                        <td className="text-ink-500 text-xs">{u.email}</td>
                        <td>
                          <span className={u.role==='admin'?'badge-blue':'badge-gray'}>
                            {u.role==='admin'?'Admin':'Customer'}
                          </span>
                        </td>
                        <td className="font-medium text-ink-700 text-sm">{u.order_count??0}</td>
                        <td className="font-semibold text-ink-900 text-sm">{fmt(u.total_spent??0)}</td>
                        <td className="text-ink-400 text-xs whitespace-nowrap">{fmtDate(u.created_at)}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <a href={`mailto:${u.email}`}
                              className="w-7 h-7 rounded-lg hover:bg-brand-50 text-ink-400 hover:text-brand-600 flex items-center justify-center transition-colors" title="Email user">
                              <Mail size={13} />
                            </a>
                            {u.role !== 'admin' && (
                              <button onClick={() => promoteAdmin(u)}
                                className="w-7 h-7 rounded-lg hover:bg-amber-50 text-ink-400 hover:text-amber-600 flex items-center justify-center transition-colors" title="Make Admin">
                                <Shield size={13} />
                              </button>
                            )}
                            <button onClick={() => toggleBan(u)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${u.is_banned?'hover:bg-emerald-50 text-ink-400 hover:text-emerald-600':'hover:bg-red-50 text-ink-400 hover:text-red-600'}`}
                              title={u.is_banned?'Unban':'Ban'}>
                              <Ban size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {total > 20 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-surface-200">
                  <p className="text-xs text-ink-500">Showing {(page-1)*20+1}–{Math.min(page*20,total)} of {total}</p>
                  <div className="flex gap-2">
                    <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">← Prev</button>
                    <button disabled={page*20>=total} onClick={() => setPage(p=>p+1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Next →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOrdersPage
