import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Mail, ArrowRight, Instagram, Twitter, Youtube } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')

  const subscribe = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    toast.success('Subscribed! Welcome to cartato.')
    setEmail('')
  }

  const links = {
    Shop:    [['New Arrivals','/products?sort=newest'],['Best Sellers','/products?sort=popular'],['Sale Items','/products?sale=true'],['All Products','/products']],
    Support: [['My Orders','/orders'],['Track Order','/orders'],['Returns & Refunds','#'],['Contact Us','#']],
    Company: [['About cartato','#'],['Careers','#'],['Press','#'],['Blog','#']],
  }

  return (
    <footer className="bg-ink-900 mt-20">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl font-bold text-white mb-1">Join the cartato Circle</h3>
              <p className="text-ink-300 text-sm">Exclusive deals, early access and curated drops in your inbox.</p>
            </div>
            <form onSubmit={subscribe} className="flex gap-2 w-full md:w-auto">
              <div className="flex items-center flex-1 md:w-64 bg-white/10 rounded-xl px-4 gap-2">
                <Mail size={15} className="text-ink-400 shrink-0" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent text-white placeholder-ink-400 text-sm outline-none py-2.5" />
              </div>
              <button type="submit" className="btn-primary shrink-0">
                Subscribe <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <span className="font-display font-bold text-white text-sm">V</span>
              </div>
              <span className="font-display font-bold text-xl text-white">cartato</span>
            </Link>
            <p className="text-ink-400 text-sm leading-relaxed mb-5">Premium products for those who appreciate quality without compromise.</p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-ink-400 hover:text-white hover:bg-brand-600 transition-all">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([title, ls]) => (
            <div key={title}>
              <h4 className="text-white font-semibold text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {ls.map(([lbl, to]) => (
                  <li key={lbl}><Link to={to} className="text-ink-400 text-sm hover:text-white transition-colors">{lbl}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-ink-500 text-xs">© {new Date().getFullYear()} cartato Store. All rights reserved.</p>
          <div className="flex gap-2 items-center">
            {['Razorpay','UPI','COD','Net Banking'].map(p => (
              <span key={p} className="px-2 py-1 border border-white/10 rounded text-[10px] text-ink-500 font-mono">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
