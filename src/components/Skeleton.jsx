export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton rounded h-3" style={{ width: i === 0 ? '60%' : i === lines - 1 ? '40%' : '100%' }} />
      ))}
    </div>
  )
}

export function SkeletonKanban({ cols = 4 }) {
  return (
    <div className="flex gap-3 overflow-x-hidden">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="flex-shrink-0 space-y-2.5" style={{ width: 240 }}>
          <div className="skeleton rounded h-4 w-24" />
          {Array.from({ length: 3 }).map((_, j) => (
            <SkeletonCard key={j} lines={3} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonStats({ count = 5 }) {
  return (
    <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <div className="skeleton rounded h-2.5 w-16" />
          <div className="skeleton rounded h-8 w-12" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <div className="p-3" style={{ background: 'var(--bg3)' }}>
        <div className="skeleton rounded h-3 w-48" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="skeleton rounded h-3 flex-1" />
          <div className="skeleton rounded h-3 w-20" />
          <div className="skeleton rounded h-3 w-16" />
          <div className="skeleton rounded h-3 w-24" />
        </div>
      ))}
    </div>
  )
}