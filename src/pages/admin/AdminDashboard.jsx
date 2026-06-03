import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Package, ShoppingCart, Users, DollarSign, TrendingUp, ArrowUpRight, ArrowRight } from 'lucide-react'
import { apiFetch } from '../../context/AuthContext'
import { fmt, fmtDate, STATUS, PAYMENT_STATUS } from '../../utils/data'

export function AdminSidebar() {
  const { pathname } = useLocation()
  const links = [
    { to:'/admin',          label:'Dashboard', Icon:LayoutDashboard },
    { to:'/admin/products', label:'Products',  Icon:Package         },
    { to:'/admin/orders',   label:'Orders',    Icon:ShoppingCart    },
    { to:'/admin/users',    label:'Users',     Icon:Users           },
  ]
  return (
    <aside className="w-52 shrink-0 hidden lg:block">
      <div className="card p-2 sticky top-20 space-y-0.5">
        {links.map(({ to, label, Icon }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname===to?'bg-brand-50 text-brand-700':'text-ink-600 hover:bg-surface-50 hover:text-ink-900'}`}>
            <Icon size={15} />{label}
          </Link>
        ))}
      </div>
    </aside>
  )
}

function KPI({ icon:Icon, label, value, trend, color, bg, delay }) {
  return (
    <motion.div className="card p-5" initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay }}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon size={20} className={color} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend>=0?'text-emerald-600':'text-red-500'}`}>
            <ArrowUpRight size={12} className={trend<0?'rotate-90':''} />{Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-ink-500 text-xs mb-1">{label}</p>
      <p className="font-display text-2xl font-bold text-ink-900">{value}</p>
    </motion.div>
  )
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.revenue||0), 1)
  return (
    <div className="flex items-end gap-2 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div className="w-full rounded-t bg-brand-500 hover:bg-brand-600 transition-colors cursor-default"
            style={{ height:`${Math.max(6, (d.revenue/max)*100)}%` }}
            initial={{ scaleY:0, originY:1 }} animate={{ scaleY:1 }}
            transition={{ delay: i*0.05 }} title={`${d.month}: ${fmt(d.revenue)}`} />
          <span className="text-ink-400 text-[9px] font-medium">{d.month?.slice(5)}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    apiFetch('/admin/stats').then(setData).catch(() => {})
  }, [])

  const stats   = data?.stats   || { totalOrders:1284, totalRevenue:28419000, totalUsers:8420, totalProducts:347 }
  const recent  = data?.recentOrders || []
  const monthly = data?.monthlyRevenue || [
    { month:'2024-10', revenue:3820000 }, { month:'2024-11', revenue:4480000 },
    { month:'2024-12', revenue:6120000 }, { month:'2025-01', revenue:5240000 },
    { month:'2025-02', revenue:4710000 }, { month:'2025-03', revenue:5830000 },
  ]

  return (
    <div className="min-h-screen bg-surface-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-2xl font-bold text-ink-900 mb-8 flex items-center gap-2">
          <LayoutDashboard size={22} className="text-brand-600" /> Admin Dashboard
        </h1>
        <div className="flex gap-8">
          <AdminSidebar />
          <div className="flex-1 space-y-7">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPI icon={DollarSign}   label="Total Revenue"    value={fmt(stats.totalRevenue)}            trend={12} color="text-brand-600"   bg="bg-brand-50"   delay={0}    />
              <KPI icon={ShoppingCart} label="Total Orders"     value={stats.totalOrders.toLocaleString()} trend={8}  color="text-emerald-600" bg="bg-emerald-50" delay={0.08} />
              <KPI icon={Users}        label="Customers"        value={stats.totalUsers.toLocaleString()}  trend={14} color="text-violet-600"  bg="bg-violet-50"  delay={0.16} />
              <KPI icon={Package}      label="Active Products"  value={stats.totalProducts.toLocaleString()} trend={4} color="text-amber-600"  bg="bg-amber-50"   delay={0.24} />
            </div>

            {/* Revenue chart + top products */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-ink-900">Revenue (Last 6 Months)</h3>
                  <TrendingUp size={16} className="text-ink-400" />
                </div>
                <BarChart data={monthly} />
              </div>
              <div className="card p-6">
                <h3 className="font-semibold text-ink-900 mb-4">Top Products</h3>
                {(data?.topProducts||[]).length === 0
                  ? <p className="text-ink-400 text-xs">No sales data yet.</p>
                  : (data?.topProducts||[]).map((p, i) => (
                    <div key={i} className="flex items-center gap-3 mb-3">
                      <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold flex items-center justify-center shrink-0">{i+1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-ink-800 text-xs font-medium line-clamp-1">{p.name}</p>
                        <p className="text-ink-400 text-[10px]">{p.units_sold} sold</p>
                      </div>
                      <p className="text-brand-600 text-xs font-semibold shrink-0">{fmt(p.revenue)}</p>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Recent orders */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
                <h3 className="font-semibold text-ink-900">Recent Orders</h3>
                <Link to="/admin/orders" className="btn-ghost text-xs gap-1 py-1.5">View All <ArrowRight size={12} /></Link>
              </div>
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {recent.length===0
                      ? <tr><td colSpan={5} className="text-center text-ink-400 text-xs py-10">No orders yet.</td></tr>
                      : recent.map(o => (
                        <tr key={o.id}>
                          <td><span className="font-mono text-xs text-brand-600">#{o.order_number}</span></td>
                          <td className="text-ink-700">{o.user_name||'Guest'}</td>
                          <td className="font-semibold text-ink-900">{fmt(o.total)}</td>
                          <td><span className={STATUS[o.status]?.cls||'badge-gray'}>{STATUS[o.status]?.label||o.status}</span></td>
                          <td className="text-ink-400 text-xs">{fmtDate(o.created_at)}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
