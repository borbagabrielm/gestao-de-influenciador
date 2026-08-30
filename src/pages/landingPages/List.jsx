import { useNavigate } from 'react-router-dom'

const PUBLIC_PATH = { 'midia-kit': '/midia-kit' }

export default function LandingPagesList({ pages }) {
  const nav = useNavigate()

  if (!pages.length) return (
    <div className="text-center py-16">
      <div className="text-4xl mb-4">🖼️</div>
      <div className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Nenhuma landing page ainda</div>
      <p className="text-xs" style={{ color: 'var(--text3)' }}>Rode a migration do banco para criar a primeira (Mídia Kit).</p>
    </div>
  )

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
      {pages.map(p => (
        <div key={p.id} onClick={() => nav(`/painel/landing-pages/${p.slug}`)}
          className="rounded-2xl p-5 cursor-pointer transition-all duration-200"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = '' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'var(--blue-bg)' }}>🖼️</div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: p.published ? 'var(--green-bg)' : 'var(--bg3)', color: p.published ? 'var(--green)' : 'var(--text3)' }}>
              {p.published ? 'Publicada' : 'Rascunho'}
            </span>
          </div>
          <div className="font-title font-bold text-base mb-1" style={{ color: 'var(--text)' }}>{p.name}</div>
          <div className="text-xs mb-3" style={{ color: 'var(--text3)' }}>/{p.slug}</div>
          {PUBLIC_PATH[p.slug] && (
            <a href={PUBLIC_PATH[p.slug]} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
              className="text-xs" style={{ color: 'var(--accent)' }}>
              Ver página pública ↗
            </a>
          )}
        </div>
      ))}
    </div>
  )
}
