import { P_PHASES } from '@/lib/constants'

export function getStatusInfo(p) {
  const m = P_PHASES[p.phase] || P_PHASES[1]
  return m.sm[p.status] || { label: p.status, color: '#888', bg: '#222' }
}

export function tagClass(t) {
  if (t === 'publicidade') return 'tag-pub'
  if (t === 'permuta')     return 'tag-perm'
  if (t === 'seeding')     return 'tag-seed'
  return 'tag-other'
}

export function StatsRow({ prospects }) {
  const fec  = prospects.filter(p => p.status === 'fechado' || p.phase > 1).length
  const neg  = prospects.filter(p => p.phase === 1 && ['negociacao','proposta'].includes(p.status)).length
  const pot  = prospects.filter(p => p.phase === 1 && p.status !== 'perdido').reduce((s,p) => s+(p.value||0), 0)
  const rec  = prospects.filter(p => p.status === 'recebido').reduce((s,p) => s+(p.finalValue||0), 0)
  const perd = prospects.filter(p => p.status === 'perdido').length

  const items = [
    { label: 'Total',         value: prospects.length, color: 'var(--text)' },
    { label: 'Em negociação', value: neg,               color: 'var(--amber)' },
    { label: 'Fechadas',      value: fec,               color: 'var(--green)' },
    { label: 'Potencial',     value: `R$${(pot/1000).toFixed(0)}k`, color: 'var(--accent)' },
    { label: 'Perdidas',      value: perd,              color: 'var(--coral)' },
  ]

  return (
    <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
      {items.map(i => (
        <div key={i.label} className="stat-card">
          <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>{i.label}</div>
          <div className="font-title font-bold text-2xl" style={{ color: i.color }}>{i.value}</div>
        </div>
      ))}
    </div>
  )
}

export function KCard({ prospect, onEdit, color }) {
  const p = prospect
  const si = getStatusInfo(p)
  const atr = p.followup && p.followup < new Date().toISOString().split('T')[0] && p.status !== 'fechado' && p.phase === 1

  return (
    <div
      className="rounded-xl p-3.5 cursor-pointer transition-all duration-150 relative overflow-hidden"
      style={{ background: 'var(--bg2)', border: `1px solid ${atr ? 'var(--coral)' : 'var(--border)'}` }}
      onClick={() => onEdit(p.id)}
      onMouseEnter={e => { e.currentTarget.style.borderColor = atr ? 'var(--coral)' : 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = atr ? 'var(--coral)' : 'var(--border)'; e.currentTarget.style.transform = '' }}
    >
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: atr ? 'var(--coral)' : (color || si.color) }} />

      <div className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{p.company}</div>
      <div className="text-[11px] mb-2.5" style={{ color: 'var(--text3)' }}>{p.contact || '—'}</div>

      <div className="flex flex-wrap gap-1 mb-2.5">
        {p.tags.map(t => (
          <span key={t} className={`tag-base ${tagClass(t)}`} style={{
            background: t==='publicidade'?'var(--purple-bg)':t==='permuta'?'var(--teal-bg)':t==='seeding'?'var(--amber-bg)':'var(--bg4)',
            color: t==='publicidade'?'var(--purple)':t==='permuta'?'var(--teal)':t==='seeding'?'var(--amber)':'var(--text2)',
          }}>{t}</span>
        ))}
        {p.modo && (
          <span className="tag-base" style={{ background: p.modo==='ativa'?'#0e2010':'#1a0e28', color: p.modo==='ativa'?'#4ade80':'#c084fc' }}>
            {p.modo}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        {p.value ? <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>R${Number(p.value).toLocaleString('pt-BR')}</span> : <span />}
        <span className="text-[10px]" style={{ color: atr ? 'var(--coral)' : 'var(--text3)' }}>
          {p.followup ? `📅 ${p.followup.split('-').slice(1).reverse().join('/')}` : ''}
        </span>
      </div>
    </div>
  )
}