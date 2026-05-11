import { useState } from 'react'
import { CN_STATUS, CN_TIPOS, RS_META, RESPONSAVEIS } from '@/lib/constants'
import { isAtrasado, RespAvatar } from './shared'

export default function CnDashboard({ conteudos }) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')

  const base = conteudos.filter(c => {
    if (c.status === 'arquivado') return false
    if (dateFrom && c.data_publicacao && c.data_publicacao < dateFrom) return false
    if (dateTo   && c.data_publicacao && c.data_publicacao > dateTo)   return false
    return true
  })

  const all = base
  const pub = all.filter(c => c.status === 'publicado')
  const byRS = {}, byTipo = {}, byStatus = {}, byResp = {}, byDow = [0,0,0,0,0,0,0]

  all.forEach(c => {
    if (c.rede_social)   byRS[c.rede_social]    = (byRS[c.rede_social]    || 0) + 1
    if (c.tipo_conteudo) byTipo[c.tipo_conteudo] = (byTipo[c.tipo_conteudo] || 0) + 1
    byStatus[c.status] = (byStatus[c.status] || 0) + 1
    if (c.responsavel)   byResp[c.responsavel]   = (byResp[c.responsavel]   || 0) + 1
  })
  pub.forEach(c => {
    if (c.data_publicacao) { const d = new Date(c.data_publicacao + 'T12:00:00'); byDow[d.getDay()]++ }
  })

  const maxDow = Math.max(...byDow, 1)
  const atr    = all.filter(c => isAtrasado(c)).length
  const taxa   = all.length > 0 ? Math.round((pub.length / all.length) * 100) : 0
  const DOW_LABELS = ['D','S','T','Q','Q','S','S']

  const BarChart = ({ items, getColor }) => (
    <div className="space-y-2">
      {Object.keys(items).length ? Object.entries(items).map(([key, cnt]) => {
        const max = Math.max(...Object.values(items), 1)
        const color = getColor(key)
        return (
          <div key={key} className="flex items-center gap-2.5">
            <span className="text-xs w-20 truncate flex-shrink-0" style={{ color: 'var(--text3)' }}>{key}</span>
            <div className="flex-1 rounded h-2 overflow-hidden" style={{ background: 'var(--bg3)' }}>
              <div className="h-full rounded" style={{ background: color, width: `${(cnt/max*100).toFixed(0)}%` }} />
            </div>
            <span className="text-xs w-6 text-right" style={{ color: 'var(--text2)' }}>{cnt}</span>
          </div>
        )
      }) : <p className="text-xs" style={{ color: 'var(--text3)' }}>Sem dados</p>}
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Filtro de data */}
      <div className="flex items-center gap-2 flex-wrap p-3 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <span className="text-xs font-medium" style={{ color: 'var(--text2)' }}>📅 Filtrar por publicação:</span>
        {['month','quarter','year'].map(p => {
          const labels = { month: 'Este mês', quarter: 'Trimestre', year: 'Este ano' }
          return (
            <button key={p} className="text-xs px-2.5 py-1 rounded-md"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer' }}
              onClick={() => {
                const t = new Date(); const iso = d => d.toISOString().split('T')[0]
                if (p === 'month')   { setDateFrom(`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-01`); setDateTo(iso(new Date(t.getFullYear(),t.getMonth()+1,0))) }
                if (p === 'quarter') { const q=Math.floor(t.getMonth()/3); setDateFrom(iso(new Date(t.getFullYear(),q*3,1))); setDateTo(iso(new Date(t.getFullYear(),q*3+3,0))) }
                if (p === 'year')    { setDateFrom(`${t.getFullYear()}-01-01`); setDateTo(`${t.getFullYear()}-12-31`) }
              }}>
              {labels[p]}
            </button>
          )
        })}
        <span className="text-xs" style={{ color: 'var(--text3)' }}>De</span>
        <input type="date" className="form-input text-xs py-1 px-2" style={{ width: 'auto' }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <span className="text-xs" style={{ color: 'var(--text3)' }}>Até</span>
        <input type="date" className="form-input text-xs py-1 px-2" style={{ width: 'auto' }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
        {(dateFrom || dateTo) && (
          <button className="text-xs px-2.5 py-1 rounded-md"
            style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer' }}
            onClick={() => { setDateFrom(''); setDateTo('') }}>✕</button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total',       val: all.length,                                             color: 'var(--text)'   },
          { label: 'Publicados',  val: pub.length,                                             color: 'var(--green)'  },
          { label: 'Taxa',        val: taxa + '%',                                             color: 'var(--accent)' },
          { label: 'Em produção', val: (byStatus.gravado||0) + (byStatus.editado||0),          color: 'var(--amber)'  },
          { label: 'Atrasados',   val: atr,                                                    color: 'var(--coral)'  },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>{s.label}</div>
            <div className="font-title font-bold text-2xl" style={{ color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <div className="text-sm font-medium mb-4" style={{ color: 'var(--text2)' }}>Por rede social</div>
          <BarChart items={byRS}   getColor={k => RS_META[k]?.color    || 'var(--accent)'} />
        </div>
        <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <div className="text-sm font-medium mb-4" style={{ color: 'var(--text2)' }}>Por tipo de conteúdo</div>
          <BarChart items={byTipo} getColor={k => CN_TIPOS[k]?.color   || 'var(--accent)'} />
        </div>

        {/* Heatmap */}
        <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <div className="text-sm font-medium mb-4" style={{ color: 'var(--text2)' }}>Frequência por dia da semana</div>
          <div className="flex gap-2 items-end h-20">
            {byDow.map((cnt, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full">
                <div className="flex-1 flex items-end w-full">
                  <div className="w-full rounded-t" style={{ background: 'var(--accent)', opacity: cnt===0?0.15:0.3+(cnt/maxDow)*0.7, height: `${cnt===0?4:Math.max(8,Math.round((cnt/maxDow)*64))}px` }} />
                </div>
                <div className="text-[9px]"  style={{ color: 'var(--text3)' }}>{DOW_LABELS[i]}</div>
                <div className="text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>{cnt}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Por responsável */}
        <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <div className="text-sm font-medium mb-4" style={{ color: 'var(--text2)' }}>Por responsável</div>
          {Object.keys(byResp).length ? Object.entries(byResp).map(([resp, cnt]) => {
            const r = RESPONSAVEIS[resp]; if (!r) return null
            return (
              <div key={resp} className="flex items-center gap-2.5 mb-3">
                <RespAvatar nome={resp} size={28} />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1"><span>{resp}</span><span style={{ color: 'var(--text3)' }}>{cnt}</span></div>
                  <div className="rounded h-1.5 overflow-hidden" style={{ background: 'var(--bg3)' }}>
                    <div className="h-full rounded" style={{ background: r.color, width: `${all.length ? Math.round((cnt/all.length)*100) : 0}%` }} />
                  </div>
                </div>
              </div>
            )
          }) : <p className="text-xs" style={{ color: 'var(--text3)' }}>Sem dados</p>}
        </div>
      </div>

      {/* Funil */}
      <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <div className="text-sm font-medium mb-4" style={{ color: 'var(--text2)' }}>Funil de produção</div>
        <div className="flex gap-3">
          {['planejado','gravado','editado','publicado'].map(s => {
            const si = CN_STATUS[s], cnt = byStatus[s] || 0
            return (
              <div key={s} className="flex-1 rounded-xl p-4 text-center" style={{ background: si.bg, border: `1px solid ${si.color}30` }}>
                <div className="text-xl mb-1">{si.emoji}</div>
                <div className="font-title font-bold text-2xl" style={{ color: si.color }}>{cnt}</div>
                <div className="text-[11px] mt-1" style={{ color: si.color, opacity: .7 }}>{si.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}