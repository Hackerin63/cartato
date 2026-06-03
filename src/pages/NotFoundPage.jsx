import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-50 pt-16 flex items-center justify-center px-4">
      <motion.div className="text-center" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
        <p className="font-display text-[8rem] font-bold text-brand-100 leading-none select-none">404</p>
        <h1 className="font-display text-3xl font-bold text-ink-900 -mt-4 mb-3">Page Not Found</h1>
        <p className="text-ink-500 text-sm mb-8 max-w-sm mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary">Back to Home <ArrowRight size={16} /></Link>
      </motion.div>
    </div>
  )
}
