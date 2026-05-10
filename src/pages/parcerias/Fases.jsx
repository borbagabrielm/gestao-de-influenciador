import { useState } from 'react'
import { P_PHASES } from '@/lib/constants'
import { StatsRow, KCard } from './shared'

export default function ParceriasFases({ prospects, onEdit }) {
  const [collapsed, setCollapsed] = useState({})
  const toggle = ph => setCollapsed(c => ({ ...c, [ph]: !c[ph] }))

  return (
    <>
      <StatsRow prospects={prospects} />
      <div className="flex flex-col gap-5">
        {[1,2,3].map(ph => {
          const m     = P_PHASES[ph]
          const plist = prospects.filter(p => p.phase === ph)
          const val   = plist.reduce((s,p) => s+(p.value||0), 0)
          const isCol = !!collapsed[ph]

          return (
            <div key={ph} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {/* Header */}
              <div
                className="flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors"
                style={{ background: 'var(--bg2)', borderBottom: isCol ? 'none' : '1px solid var(--border)' }}
                onClick={() => toggle(ph)}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}
              >
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md" style={{ background: m.bg, color: m.color }}>
                  {m.label}
                </span>
                <span className="text-xs ml-auto" style={{ color: 'var(--text3)' }}>{plist.length} prospecções</span>
                {val > 0 && <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>R${Number(val).toLocaleString('pt-BR')}</span>}
                <span className="text-base transition-transform" style={{ color: 'var(--text3)', transform: isCol ? 'rotate(-90deg)' : '' }}>›</span>
              </div>

              {/* Body */}
              {!isCol && (
                <div className="p-4 overflow-x-auto" style={{ background: 'var(--bg2)' }}>
                  <div className="flex gap-3.5">
                    {Object.entries(m.sm).map(([key, si]) => {
                      const cards = plist.filter(p => p.status === key)
                      return (
                        <div key={key} className="flex-shrink-0" style={{ width: 220 }}>
                          <div className="flex items-center gap-2 mb-2.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: si.color }} />
                            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text2)' }}>{si.label}</span>
                            <span className="ml-auto text-[11px] px-1.5 py-0.5 rounded-md" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>{cards.length}</span>
                          </div>
                          <div className="flex flex-col gap-2">
                            {cards.length > 0
                              ? cards.map(p => <KCard key={p.id} prospect={p} onEdit={onEdit} color={si.color} />)
                              : <div className="text-center py-4 text-[11px] rounded-xl" style={{ color: 'var(--text3)', border: '1px dashed var(--border)' }}>Vazio</div>
                            }
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}