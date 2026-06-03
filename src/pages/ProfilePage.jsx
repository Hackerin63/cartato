import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, Lock, Package, Heart, Check, Edit2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { apiFetch } from '../context/AuthContext'
import { fmt } from '../utils/data'
import toast from 'react-hot-toast'

const TABS = [
  { id:'profile',  label:'Profile',  Icon:User    },
  { id:'orders',   label:'Orders',   Icon:Package },
  { id:'wishlist', label:'Wishlist', Icon:Heart   },
  { id:'security', label:'Security', Icon:Lock    },
]

function ProfileTab() {
  const { user, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name,  setName]  = useState(user?.name||'')
  const [phone, setPhone] = useState(user?.phone||'')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const r = await updateProfile({ name, phone })
    if (r.ok) setEditing(false)
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      <div className="card p-5 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-ink-900 text-lg">{user?.name}</p>
          <p className="text-ink-500 text-sm">{user?.email}</p>
          <span className={`badge mt-1.5 ${user?.role==='admin'?'badge-blue':'badge-green'}`}>
            {user?.role==='admin' ? '✦ Admin' : '✦ Member'}
          </span>
        </div>
      </div>
      <div className="card p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-ink-900">Personal Information</h3>
          <button onClick={() => setEditing(!editing)} className="btn-ghost text-xs gap-1 py-1.5">
            <Edit2 size={12} />{editing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        <div className="space-y-4">
          {[
            { label:'Full Name', value:name, setter:setName, Icon:User, editable:true },
            { label:'Email',     value:user?.email||'', setter:null, Icon:Mail, editable:false },
            { label:'Phone',     value:phone, setter:setPhone, Icon:Phone, editable:true },
          ].map(({ label, value, setter, Icon, editable }) => (
            <div key={label}>
              <label className="text-xs font-medium text-ink-500 block mb-1.5">{label}</label>
              <div className="relative">
                <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input type="text" value={value||''} readOnly={!editable||!editing}
                  onChange={e => setter?.(e.target.value)}
                  className={`input pl-10 ${(!editable||!editing)?'bg-surface-50 cursor-not-allowed opacity-70':''}`} />
              </div>
            </div>
          ))}
        </div>
        <AnimatePresence>
          {editing && (
            <motion.button initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
              exit={{ opacity:0, height:0 }} onClick={save} disabled={saving}
              className="btn-primary w-full mt-4 py-2.5 rounded-xl disabled:opacity-60">
              {saving ? 'Saving…' : <><Check size={14} />Save Changes</>}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function OrdersTab() {
  return (
    <div className="card p-12 text-center">
      <Package size={40} className="mx-auto text-ink-300 mb-3" />
      <p className="font-semibold text-ink-900 mb-1">View your order history</p>
      <p className="text-ink-500 text-sm mb-5">All your orders are tracked on the Orders page.</p>
      <Link to="/orders" className="btn-primary">Go to My Orders</Link>
    </div>
  )
}

function WishlistTab() {
  const { wishlist, toggleWish, addToCart } = useCart()
  if (!wishlist.length) return (
    <div className="card p-12 text-center">
      <Heart size={40} className="mx-auto text-ink-300 mb-3" />
      <p className="font-semibold text-ink-900 mb-1">Wishlist is empty</p>
      <p className="text-ink-500 text-sm mb-5">Save items you love to buy later.</p>
      <Link to="/products" className="btn-primary">Browse Products</Link>
    </div>
  )
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {wishlist.map((p, i) => (
        <motion.div key={p._id} className="card overflow-hidden group"
          initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*.06 }}>
          <Link to={`/products/${p._id}`} className="block aspect-square overflow-hidden bg-surface-100">
            <img src={p.images?.[0]} alt={p.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => { e.target.src=`https://picsum.photos/seed/${p._id}x/200/200` }} />
          </Link>
          <div className="p-3">
            <p className="font-medium text-ink-900 text-xs line-clamp-1 mb-2">{p.name}</p>
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-ink-900 text-sm">{fmt(p.price)}</span>
              <div className="flex gap-1.5">
                <button onClick={() => addToCart(p)} title="Add to cart"
                  className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 flex items-center justify-center transition-colors">
                  <Package size={12} />
                </button>
                <button onClick={() => toggleWish(p)} title="Remove"
                  className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors">
                  <Heart size={12} fill="currentColor" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function SecurityTab() {
  const [cur,   setCur]   = useState('')
  const [next,  setNext]  = useState('')
  const [conf,  setConf]  = useState('')
  const [show,  setShow]  = useState(false)
  const [saving,setSaving]= useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (next !== conf) { toast.error('Passwords do not match'); return }
    if (next.length < 8) { toast.error('Minimum 8 characters'); return }
    setSaving(true)
    try {
      await apiFetch('/auth/change-password', { method:'PUT', body: JSON.stringify({ currentPassword:cur, newPassword:next }) })
      toast.success('Password changed!')
      setCur(''); setNext(''); setConf('')
    } catch (e) { toast.error(e.message||'Failed to change password') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="card p-6 space-y-4 max-w-md">
      <h3 className="font-semibold text-ink-900">Change Password</h3>
      {[['Current Password',cur,setCur],['New Password',next,setNext],['Confirm Password',conf,setConf]].map(([lbl,val,setter]) => (
        <div key={lbl}>
          <label className="text-xs font-medium text-ink-500 block mb-1.5">{lbl}</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input type={show?'text':'password'} value={val} onChange={e=>setter(e.target.value)}
              required className="input pl-10 pr-10" placeholder="••••••••" />
            <button type="button" onClick={()=>setShow(!show)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
              {show ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
          </div>
        </div>
      ))}
      <label className="flex items-center gap-2 text-xs text-ink-600 cursor-pointer">
        <input type="checkbox" checked={show} onChange={()=>setShow(!show)} className="accent-brand-600" />
        Show all passwords
      </label>
      <button type="submit" disabled={saving} className="btn-primary w-full py-3 rounded-xl disabled:opacity-60">
        {saving ? 'Updating…' : 'Update Password'}
      </button>
    </form>
  )
}

export function ProfilePage() {
  const [tab, setTab] = useState('profile')
  return (
    <div className="min-h-screen bg-surface-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-8">My Account</h1>
        <div className="flex flex-col sm:flex-row gap-6">
          <nav className="sm:w-48 shrink-0">
            <div className="card p-2 space-y-1">
              {TABS.map(({ id, label, Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab===id?'bg-brand-50 text-brand-700':'text-ink-600 hover:bg-surface-50 hover:text-ink-900'}`}>
                  <Icon size={15} />{label}
                </button>
              ))}
            </div>
          </nav>
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:.2 }}>
                {tab==='profile'  && <ProfileTab />}
                {tab==='orders'   && <OrdersTab />}
                {tab==='wishlist' && <WishlistTab />}
                {tab==='security' && <SecurityTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export function WishlistPage() {
  const { wishlist } = useCart()
  return (
    <div className="min-h-screen bg-surface-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart size={22} className="text-brand-600" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">My Wishlist</h1>
          <span className="badge-blue">{wishlist.length} items</span>
        </div>
        {wishlist.length === 0 ? (
          <div className="text-center py-24">
            <Heart size={48} className="mx-auto text-ink-300 mb-4" />
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-2">Wishlist is empty</h2>
            <p className="text-ink-500 text-sm mb-8">Save items you love to buy later.</p>
            <Link to="/products" className="btn-primary">Discover Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {wishlist.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.05 }}>
                <Link to={`/products/${p._id}`} className="card card-hover flex flex-col overflow-hidden group">
                  <div className="aspect-square overflow-hidden bg-surface-100">
                    <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.src=`https://picsum.photos/seed/${p._id}w/300/300` }} />
                  </div>
                  <div className="p-4">
                    <p className="text-ink-400 text-xs mb-1">{p.category}</p>
                    <p className="font-semibold text-ink-900 text-sm group-hover:text-brand-600 transition-colors">{p.name}</p>
                    <p className="font-bold text-ink-900 mt-2">{fmt(p.price)}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
