export function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 skeleton rounded w-1/3" />
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-1/2" />
        <div className="h-5 skeleton rounded w-1/3 mt-2" />
      </div>
    </div>
  )
}

export function Spinner({ size = 24, className = '' }) {
  return (
    <div
      className={`border-2 border-surface-200 border-t-brand-600 rounded-full animate-spin ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <Spinner size={36} />
    </div>
  )
}

export function EmptyState({ icon, title, sub, action }) {
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-display text-xl font-bold text-ink-900 mb-2">{title}</h3>
      {sub && <p className="text-ink-500 text-sm mb-6 max-w-sm mx-auto">{sub}</p>}
      {action}
    </div>
  )
}
