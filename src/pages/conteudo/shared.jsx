import { RESPONSAVEIS, CN_STATUS, CN_TIPOS, RS_META, FMT_ICONS } from '@/lib/constants'

export function isAtrasado(c) {
  if (!c.data_publicacao || c.status==='publicado' || c.status==='arquivado') return false
  return c.data_publicacao < new Date().toISOString().split('T')[0]
}

export function RsTag({ rs }) {
  if (!rs) return null
  const m = RS_META[rs]
  if (!m) return null
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: m.color+'22', color: m.color, border: `1px solid ${m.color}40` }}>
      {m.label}
    </span>
  )
}

export function TipoTag({ tipo }) {
  if (!tipo) return null
  const t = CN_TIPOS[tipo]
  if (!t) return null
  return <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: t.bg, color: t.color }}>{t.label}</span>
}

export function RespAvatar({ nome, size = 24 }) {
  if (!nome) return null
  const r = RESPONSAVEIS[nome]
  if (!r) return null
  return (
    <img
      src={r.photo}
      alt={nome}
      title={nome}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size, border: `2px solid ${r.color}60` }}
      onError={e => {
        e.target.style.display = 'none'
        const div = document.createElement('div')
        div.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${r.color};display:inline-flex;align-items:center;justify-content:center;font-size:${Math.round(size*.45)}px;font-weight:700;color:#000;flex-shrink:0`
        div.textContent = nome[0]
        e.target.parentNode.insertBefore(div, e.target)
      }}
    />
  )
}

export function RsIcon({ rs, size = 12 }) {
  if (rs === 'instagram') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ig" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497"/>
          <stop offset="5%" stopColor="#fdf497"/>
          <stop offset="45%" stopColor="#fd5949"/>
          <stop offset="60%" stopColor="#d6249f"/>
          <stop offset="90%" stopColor="#285AEB"/>
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig)"/>
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
    </svg>
  )
  if (rs === 'tiktok') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#010101"/>
      <path d="M17 8.5a4 4 0 01-4-4v8.5a3 3 0 11-3-3" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M13 4.5a4 4 0 004 4" stroke="#69C9D0" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  )
  if (rs === 'youtube') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#FF0000"/>
      <path d="M10 9l6 3-6 3V9z" fill="white"/>
    </svg>
  )
  return null
}

export function MiniCard({ c, onEdit, onDragStart, onDragEnd }) {
  const si  = CN_STATUS[c.status] || CN_STATUS.planejado
  const atr = isAtrasado(c)
  const m   = c.rede_social ? RS_META[c.rede_social] : null

  

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onEdit(c.id)}
      className="text-[10px] px-1.5 py-1 rounded-md mb-1 cursor-grab flex items-center gap-1 overflow-hidden"
      style={{
        background: si.bg,
        borderLeft: `3px solid ${atr?'var(--coral)':si.color}`,
      }}
    >
      {c.rede_social && <RsIcon rs={c.rede_social} size={10} />}
      <span className="truncate flex-1" style={{ color: atr?'var(--coral)':si.color }}>{c.titulo||'Sem título'}</span>
    </div>
  )
}

export function KCard({ c, onEdit, onDuplicate, dragRef }) {
  const si  = CN_STATUS[c.status] || CN_STATUS.planejado
  const atr = isAtrasado(c)
  const fmt = c.formato ? FMT_ICONS[c.formato] : null

  return (
    <div
      ref={dragRef}
      draggable
      className="rounded-xl p-3.5 cursor-pointer relative overflow-hidden transition-all"
      style={{
        background: 'var(--bg2)',
        border: `1px solid ${atr?'var(--coral)':'var(--border)'}`,
      }}
      onClick={() => onEdit(c.id)}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor=atr?'var(--coral)':'var(--border2)'; e.currentTarget.style.transform='translateY(-1px)' }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor=atr?'var(--coral)':'var(--border)';  e.currentTarget.style.transform='' }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: atr?'var(--coral)':si.color }} />
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{c.titulo||'Sem título'}</span>
        {atr && <span className="text-[10px] flex-shrink-0" style={{ color:'var(--coral)' }}>⚠</span>}
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        <RsTag rs={c.rede_social} />
        <TipoTag tipo={c.tipo_conteudo} />
        {fmt && <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background:'var(--bg3)', color:'var(--text3)' }}>{fmt} {c.formato}</span>}
      </div>
      {(c.tags||[]).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {c.tags.map(t => <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ background:'var(--bg3)', color:'var(--text3)' }}>{t}</span>)}
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color:'var(--text3)' }}>
          {c.data_publicacao ? `📅 ${c.data_publicacao.split('-').slice(1).reverse().join('/')}` : ''}
        </span>
        <RespAvatar nome={c.responsavel} size={22} />
      </div>
    </div>
  )
}