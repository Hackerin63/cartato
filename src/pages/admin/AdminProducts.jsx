import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, X, Check, Package, Eye, EyeOff } from 'lucide-react'
import { AdminSidebar } from './AdminDashboard'
import { apiFetch } from '../../context/AuthContext'
import { PRODUCTS } from '../../utils/data'
import { fmt } from '../../utils/data'
import toast from 'react-hot-toast'

const CATEGORIES = ['Watches','Fashion','Electronics','Beauty','Footwear','Bags','Accessories','Tech','Home']
const BADGES     = ['','New','Best Seller','Top Rated','Limited','Sale','Trending']

function Modal({ product, onClose, onSaved }) {
  const isEdit = !!product
  const [form, setForm] = useState(isEdit ? {
    name:          product.name,
    description:   product.description||'',
    price:         String(product.price),
    originalPrice: product.originalPrice ? String(product.originalPrice) : '',
    category:      product.category,
    stock:         String(product.stock),
    badge:         product.badge||'',
    isFeatured:    !!(product.isFeatured || product.is_featured),
    images:        product.images||[],
    sizes:         product.sizes||[],
  } : { name:'', description:'', price:'', originalPrice:'', category:'', stock:'0', badge:'', isFeatured:false, images:[], sizes:[] })
  const [saving,    setSaving]    = useState(false)
  const [sizeInput, setSizeInput] = useState('')
  const [imgUrl,    setImgUrl]    = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]:v }))

  const addSize = () => {
    const s = sizeInput.trim()
    if (s && !form.sizes.includes(s)) { set('sizes', [...form.sizes, s]); setSizeInput('') }
  }
  const addImg = () => {
    const u = imgUrl.trim()
    if (u) { set('images', [...form.images, u]); setImgUrl('') }
  }

  const save = async () => {
    if (!form.name || !form.price || !form.category) { toast.error('Name, price and category are required'); return }
    setSaving(true)
    try {
      const payload = {
        name: form.name, description: form.description,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
        category: form.category, stock: parseInt(form.stock)||0,
        badge: form.badge||null, isFeatured: form.isFeatured,
        images: form.images.length ? form.images : [`https://picsum.photos/seed/${form.name.replace(/\s/g,'')}/600/600`],
        sizes: form.sizes,
      }
      if (isEdit) await apiFetch(`/admin/products/${product._id||product.id}`, { method:'PUT', body: JSON.stringify(payload) })
      else        await apiFetch('/admin/products', { method:'POST', body: JSON.stringify(payload) })
      toast.success(isEdit ? 'Product updated!' : 'Product created!')
      onSaved()
    } catch (e) { toast.error(e.message||'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} initial={{ opacity:0 }} animate={{ opacity:1 }} />
      <motion.div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-card-lg flex flex-col max-h-[90vh]"
        initial={{ scale:.95, opacity:0, y:20 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:.95, opacity:0 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 shrink-0">
          <h3 className="font-semibold text-ink-900 flex items-center gap-2"><Package size={15} className="text-brand-600" />{isEdit?'Edit Product':'New Product'}</h3>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700"><X size={18} /></button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-medium text-ink-600 block mb-1.5">Product Name <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={e=>set('name',e.target.value)} className="input" placeholder="e.g. Swiss Chronograph Pro" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-ink-600 block mb-1.5">Description</label>
              <textarea value={form.description} onChange={e=>set('description',e.target.value)}
                className="input resize-none" rows={3} placeholder="Product description…" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-600 block mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
              <input type="number" min="0" value={form.price} onChange={e=>set('price',e.target.value)} className="input" placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-600 block mb-1.5">Original Price (₹)</label>
              <input type="number" min="0" value={form.originalPrice} onChange={e=>set('originalPrice',e.target.value)} className="input" placeholder="Leave blank if no discount" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-600 block mb-1.5">Category <span className="text-red-500">*</span></label>
              <select value={form.category} onChange={e=>set('category',e.target.value)} className="input cursor-pointer">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-600 block mb-1.5">Stock</label>
              <input type="number" min="0" value={form.stock} onChange={e=>set('stock',e.target.value)} className="input" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-600 block mb-1.5">Badge</label>
              <select value={form.badge} onChange={e=>set('badge',e.target.value)} className="input cursor-pointer">
                {BADGES.map(b => <option key={b} value={b}>{b||'— None —'}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <button type="button" onClick={() => set('isFeatured', !form.isFeatured)}
                className={`w-10 h-5 rounded-full transition-colors relative ${form.isFeatured?'bg-brand-600':'bg-surface-300'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isFeatured?'translate-x-5':'translate-x-0.5'}`} />
              </button>
              <span className="text-sm font-medium text-ink-900">Featured Product</span>
            </div>

            {/* Images */}
            <div className="col-span-2">
              <label className="text-xs font-medium text-ink-600 block mb-2">Product Images</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className="w-14 h-14 rounded-xl object-cover border border-surface-200"
                      onError={e => { e.target.src=`https://picsum.photos/seed/${i}/56/56` }} />
                    <button type="button" onClick={() => set('images', form.images.filter((_,j)=>j!==i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={imgUrl} onChange={e=>setImgUrl(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); addImg() } }}
                  placeholder="Paste image URL (or https://picsum.photos/seed/any/600/600)"
                  className="input flex-1 text-xs" />
                <button type="button" onClick={addImg} className="btn-secondary text-xs px-3 py-2">Add</button>
              </div>
            </div>

            {/* Sizes */}
            <div className="col-span-2">
              <label className="text-xs font-medium text-ink-600 block mb-2">Sizes (optional)</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.sizes.map(s => (
                  <span key={s} className="flex items-center gap-1 badge-blue text-xs">
                    {s}<button type="button" onClick={() => set('sizes', form.sizes.filter(x=>x!==s))}><X size={10} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={sizeInput} onChange={e=>setSizeInput(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); addSize() } }}
                  placeholder="e.g. S, M, L or UK 8" className="input flex-1 text-sm" />
                <button type="button" onClick={addSize} className="btn-secondary text-sm px-3 py-2">Add</button>
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-surface-200 shrink-0">
          <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-60">
            {saving ? 'Saving…' : <><Check size={14} />{isEdit?'Update':'Create'} Product</>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminProducts() {
  const [products,  setProducts]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [page,      setPage]      = useState(1)
  const [total,     setTotal]     = useState(0)

  const fetch = async () => {
    setLoading(true)
    try {
      const data = await apiFetch(`/admin/products?page=${page}${search?`&search=${encodeURIComponent(search)}`:''}`)
      setProducts(data.products||[])
      setTotal(data.total||0)
    } catch {
      // Fallback to sample data
      const filtered = PRODUCTS.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
      setProducts(filtered)
      setTotal(filtered.length)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [page, search])

  const toggleActive = async (p) => {
    try {
      await apiFetch(`/admin/products/${p._id||p.id}/toggle-active`, { method:'POST' })
      toast.success(`Product ${p.is_active?'deactivated':'activated'}`)
      fetch()
    } catch {
      toast.success('Updated (demo mode)')
      setProducts(ps => ps.map(x => (x._id||x.id)===(p._id||p.id) ? { ...x, is_active: x.is_active?0:1 } : x))
    }
  }

  const deleteProduct = async (p) => {
    if (!confirm(`Deactivate "${p.name}"?`)) return
    try {
      await apiFetch(`/admin/products/${p._id||p.id}`, { method:'DELETE' })
      toast.success('Product deactivated')
      fetch()
    } catch {
      setProducts(ps => ps.filter(x => (x._id||x.id) !== (p._id||p.id)))
      toast.success('Removed (demo mode)')
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-2xl font-bold text-ink-900 mb-8 flex items-center gap-2">
          <Package size={22} className="text-brand-600" /> Products Management
        </h1>
        <div className="flex gap-8">
          <AdminSidebar />
          <div className="flex-1 space-y-5">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="relative flex-1 min-w-48 max-w-xs">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1) }}
                  placeholder="Search products…" className="input pl-9 text-sm" />
              </div>
              <button onClick={() => { setEditing(null); setShowModal(true) }} className="btn-primary text-sm px-4 py-2.5">
                <Plus size={15} /> Add Product
              </button>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead>
                    <tr>
                      {['Product','Category','Price','Stock','Status','Featured','Actions'].map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array(5).fill(0).map((_,i) => (
                        <tr key={i}>{Array(7).fill(0).map((_,j) => <td key={j}><div className="h-4 skeleton rounded" /></td>)}</tr>
                      ))
                    ) : products.length===0 ? (
                      <tr><td colSpan={7} className="text-center text-ink-400 text-xs py-12">No products found.</td></tr>
                    ) : products.map(p => (
                      <tr key={p._id||p.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <img src={p.images?.[0]||`https://picsum.photos/seed/${p._id||p.id}/40/40`} alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-surface-200 shrink-0"
                              onError={e => { e.target.src=`https://picsum.photos/seed/${p._id||p.id}x/40/40` }} />
                            <div>
                              <p className="font-medium text-ink-900 text-xs max-w-[160px] truncate">{p.name}</p>
                              {p.badge && <span className="text-amber-600 text-[10px]">{p.badge}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="text-ink-500 text-xs">{p.category||p.category_name}</td>
                        <td className="font-semibold text-ink-900 text-xs">{fmt(p.price)}</td>
                        <td>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.stock>10?'badge-green':p.stock>0?'badge-yellow':'badge-red'}`}>
                            {p.stock===0?'Out of Stock':p.stock}
                          </span>
                        </td>
                        <td>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${(p.is_active===undefined||p.is_active)?'badge-green':'badge-gray'}`}>
                            {(p.is_active===undefined||p.is_active)?'Active':'Inactive'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={(p.isFeatured||p.is_featured)?'text-amber-500 text-lg':'text-surface-300 text-lg'}>★</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setEditing(p); setShowModal(true) }}
                              className="w-7 h-7 rounded-lg hover:bg-brand-50 text-ink-400 hover:text-brand-600 flex items-center justify-center transition-colors">
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => toggleActive(p)}
                              className="w-7 h-7 rounded-lg hover:bg-amber-50 text-ink-400 hover:text-amber-600 flex items-center justify-center transition-colors"
                              title={(p.is_active===undefined||p.is_active)?'Deactivate':'Activate'}>
                              {(p.is_active===undefined||p.is_active)?<EyeOff size={13}/>:<Eye size={13}/>}
                            </button>
                            <button onClick={() => deleteProduct(p)}
                              className="w-7 h-7 rounded-lg hover:bg-red-50 text-ink-400 hover:text-red-600 flex items-center justify-center transition-colors">
                              <Trash2 size={13} />
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

      <AnimatePresence>
        {showModal && <Modal product={editing} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetch() }} />}
      </AnimatePresence>
    </div>
  )
}
