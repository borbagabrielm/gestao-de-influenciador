export default function ParceriasPipeline({ allProspects }) {
  const all     = allProspects
  const seeding = all.filter(p => p.tags?.includes('seeding'))
  const nonSeed = all.filter(p => !p.tags?.includes('seeding'))

  const STAGES = [
    { key: 'lead',       label: 'Lead mapeado',    color: '#26262e', text: '#888'    },
    { key: 'contato',    label: 'Em contato',       color: '#0e1a2e', text: '#60a5fa' },
    { key: 'negociacao', label: 'Em negociação',    color: '#221a0a', text: '#fbbf24' },
    { key: 'proposta',   label: 'Proposta enviada', color: '#1e1530', text: '#c084fc' },
    { key: 'fechado',    label: 'Parceria fechada', color: '#0e2018', text: '#4ade80' },
    { key: 'perdido',    label: 'Perdido',          color: '#220e0e', text: '#f87171' },
  ]

  const counts = STAGES.map(s =>
    nonSeed.filter(p => p.status === s.key || (p.statusHistory || []).includes(s.key)).length
  )
  const maxC  = Math.max(...counts, 1)
  const taxa  = counts[0] > 0 ? Math.round((counts[4] / counts[0]) * 100) : 0
  const perda = counts[0] > 0 ? Math.round((counts[5] / counts[0]) * 100) : 0
  const pot   = nonSeed.reduce((s, p) => s + (p.value || 0), 0)
  const rec   = nonSeed.filter(p => p.status === 'recebido').reduce((s, p) => s + (p.finalValue || 0), 0)
  const tkt   = counts[4] > 0
    ? Math.round(nonSeed.filter(p => p.phase > 1).reduce((s, p) => s + (p.finalValue || 0), 0) / counts[4])
    : 0

  const seedVal = seeding.reduce((s, p) => s + (p.value || 0), 0)

  return (
    <div>
      <div className="text-sm font-semibold mb-4 pb-3" style={{ color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>
        Funil acumulado de prospecções
      </div>

      <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Funil */}
        <div>
          {STAGES.map((s, i) => {
            const cnt = counts[i]
            const pct = counts[0] > 0 ? Math.round((cnt / counts[0]) * 100) : 0
            const w   = Math.max(30, Math.round((cnt / maxC) * 100))
            return (
              <div key={s.key} className="mb-1.5 flex justify-start">
                <div className="h-12 rounded-lg flex items-center px-5 transition-all"
                  style={{ background: s.color, border: `1px solid ${s.text}30`, width: `${w}%`, minWidth: 160 }}>
                  <span className="text-sm font-medium" style={{ color: s.text }}>{s.label}</span>
                  <span className="ml-auto font-title font-bold text-lg" style={{ color: s.text }}>{cnt}</span>
                  <span className="text-xs ml-2 opacity-60" style={{ color: s.text }}>{pct}%</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Métricas + Seeding */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text3)' }}>
            <strong style={{ color: 'var(--text2)' }}>📊 Funil acumulado</strong><br /><br />
            Cada barra mostra quantas prospecções já passaram por aquele estágio — inclusive as que avançaram. Seedins não entram no funil.<br /><br />
            <span style={{ color: 'var(--teal)' }}>Taxa de fechamento: <strong>{taxa}%</strong></span><br />
            <span style={{ color: 'var(--coral)' }}>Taxa de perda: <strong>{perda}%</strong></span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Taxa conversão', value: taxa + '%',                      color: 'var(--accent)' },
              { label: 'Pipeline ativo', value: `R$${(pot/1000).toFixed(0)}k`,   color: 'var(--accent)' },
              { label: 'Total recebido', value: `R$${(rec/1000).toFixed(0)}k`,   color: 'var(--teal)'   },
              { label: 'Ticket médio',   value: `R$${(tkt/1000).toFixed(0)}k`,   color: 'var(--accent)' },
            ].map(m => (
              <div key={m.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                <div className="font-title font-bold text-2xl mb-1" style={{ color: m.color }}>{m.value}</div>
                <div className="text-xs" style={{ color: 'var(--text3)' }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Seeding apartado */}
          <div className="rounded-xl p-4" style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber)30' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold" style={{ color: 'var(--amber)' }}>📦 Seeding</span>
              <span className="text-xs px-2 py-0.5 rounded-md ml-auto" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                não entra no funil
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg p-3 text-center" style={{ background: 'var(--bg2)' }}>
                <div className="font-title font-bold text-xl" style={{ color: 'var(--amber)' }}>{seeding.length}</div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--text3)' }}>recebidos</div>
              </div>
              <div className="rounded-lg p-3 text-center" style={{ background: 'var(--bg2)' }}>
                <div className="font-title font-bold text-xl" style={{ color: 'var(--amber)' }}>
                  {seedVal > 0 ? `R$${(seedVal/1000).toFixed(0)}k` : '—'}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--text3)' }}>valor estimado</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}