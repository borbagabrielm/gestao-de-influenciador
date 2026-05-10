import { CN_STATUS, CN_TIPOS, RS_META, RESPONSAVEIS } from '@/lib/constants'
import { isAtrasado, RespAvatar } from './shared'

export default function CnDashboard({ conteudos }) {
  const all = conteudos.filter(c=>c.status!=='arquivado')
  const pub = all.filter(c=>c.status==='publicado')

  const byRS={}, byTipo={}, byStatus={}, byResp={}, byDow=[0,0,0,0,0,0,0]
  all.forEach(c=>{
    if(c.rede_social)   byRS[c.rede_social]   =(byRS[c.rede_social]||0)+1
    if(c.tipo_conteudo) byTipo[c.tipo_conteudo]=(byTipo[c.tipo_conteudo]||0)+1
    byStatus[c.status]=(byStatus[c.status]||0)+1
    if(c.responsavel)   byResp[c.responsavel]  =(byResp[c.responsavel]||0)+1
  })
  pub.forEach(c=>{
    if(c.data_publicacao){ const d=new Date(c.data_publicacao+'T12:00:00');byDow[d.getDay()]++  }
  })
  const maxDow=Math.max(...byDow,1)
  const atr  = all.filter(c=>isAtrasado(c)).length
  const taxa = all.length>0?Math.round((pub.length/all.length)*100):0

  const DOW_LABELS=['D','S','T','Q','Q','S','S']

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          {label:'Total',       val:all.length,              color:'var(--text)'},
          {label:'Publicados',  val:pub.length,              color:'var(--green)'},
          {label:'Taxa',        val:taxa+'%',                color:'var(--accent)'},
          {label:'Em produção', val:(byStatus.gravado||0)+(byStatus.editado||0), color:'var(--amber)'},
          {label:'Atrasados',   val:atr,                     color:'var(--coral)'},
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color:'var(--text3)' }}>{s.label}</div>
            <div className="font-title font-bold text-2xl" style={{ color:s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns:'1fr 1fr' }}>
        {/* Por rede social */}
        <div className="rounded-xl p-5" style={{ background:'var(--bg2)',border:'1px solid var(--border)' }}>
          <div className="text-sm font-medium mb-4" style={{ color:'var(--text2)' }}>Por rede social</div>
          {Object.keys(byRS).length ? Object.entries(byRS).map(([rs,cnt])=>{
            const m=RS_META[rs]; if(!m) return null
            const max=Math.max(...Object.values(byRS),1)
            return (
              <div key={rs} className="flex items-center gap-2.5 mb-2.5">
                <span className="text-xs w-20 flex-shrink-0" style={{ color:'var(--text3)' }}>{m.label}</span>
                <div className="flex-1 rounded h-2 overflow-hidden" style={{ background:'var(--bg3)' }}>
                  <div className="h-full rounded" style={{ background:m.color,width:`${(cnt/max*100).toFixed(0)}%` }}/>
                </div>
                <span className="text-xs w-6 text-right" style={{ color:'var(--text2)' }}>{cnt}</span>
              </div>
            )
          }) : <p className="text-xs" style={{ color:'var(--text3)' }}>Sem dados</p>}
        </div>

        {/* Por tipo */}
        <div className="rounded-xl p-5" style={{ background:'var(--bg2)',border:'1px solid var(--border)' }}>
          <div className="text-sm font-medium mb-4" style={{ color:'var(--text2)' }}>Por tipo de conteúdo</div>
          {Object.keys(byTipo).length ? Object.entries(byTipo).map(([tipo,cnt])=>{
            const t=CN_TIPOS[tipo]; if(!t) return null
            const max=Math.max(...Object.values(byTipo),1)
            return (
              <div key={tipo} className="flex items-center gap-2.5 mb-2.5">
                <span className="text-xs w-20 flex-shrink-0" style={{ color:'var(--text3)' }}>{t.label}</span>
                <div className="flex-1 rounded h-2 overflow-hidden" style={{ background:'var(--bg3)' }}>
                  <div className="h-full rounded" style={{ background:t.color,width:`${(cnt/max*100).toFixed(0)}%` }}/>
                </div>
                <span className="text-xs w-6 text-right" style={{ color:'var(--text2)' }}>{cnt}</span>
              </div>
            )
          }) : <p className="text-xs" style={{ color:'var(--text3)' }}>Sem dados</p>}
        </div>

        {/* Heatmap dia da semana */}
        <div className="rounded-xl p-5" style={{ background:'var(--bg2)',border:'1px solid var(--border)' }}>
          <div className="text-sm font-medium mb-4" style={{ color:'var(--text2)' }}>Frequência por dia da semana</div>
          <div className="flex gap-2 items-end h-20">
            {byDow.map((cnt,i)=>(
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full">
                <div className="flex-1 flex items-end w-full">
                  <div className="w-full rounded-t" style={{ background:'var(--accent)',opacity:cnt===0?0.15:0.3+(cnt/maxDow)*0.7, height:`${cnt===0?4:Math.max(8,Math.round((cnt/maxDow)*64))}px` }}/>
                </div>
                <div className="text-[9px]" style={{ color:'var(--text3)' }}>{DOW_LABELS[i]}</div>
                <div className="text-[10px] font-semibold" style={{ color:'var(--accent)' }}>{cnt}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Por responsável */}
        <div className="rounded-xl p-5" style={{ background:'var(--bg2)',border:'1px solid var(--border)' }}>
          <div className="text-sm font-medium mb-4" style={{ color:'var(--text2)' }}>Por responsável</div>
          {Object.keys(byResp).length ? Object.entries(byResp).map(([resp,cnt])=>{
            const r=RESPONSAVEIS[resp]; if(!r) return null
            return (
              <div key={resp} className="flex items-center gap-2.5 mb-3">
                <RespAvatar nome={resp} size={28}/>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{resp}</span>
                    <span style={{ color:'var(--text3)' }}>{cnt}</span>
                  </div>
                  <div className="rounded h-1.5 overflow-hidden" style={{ background:'var(--bg3)' }}>
                    <div className="h-full rounded" style={{ background:r.color,width:`${all.length?Math.round((cnt/all.length)*100):0}%` }}/>
                  </div>
                </div>
              </div>
            )
          }) : <p className="text-xs" style={{ color:'var(--text3)' }}>Sem dados</p>}
        </div>
      </div>

      {/* Funil de produção */}
      <div className="rounded-xl p-5" style={{ background:'var(--bg2)',border:'1px solid var(--border)' }}>
        <div className="text-sm font-medium mb-4" style={{ color:'var(--text2)' }}>Funil de produção</div>
        <div className="flex gap-3">
          {['planejado','gravado','editado','publicado'].map(s=>{
            const si=CN_STATUS[s], cnt=byStatus[s]||0
            return (
              <div key={s} className="flex-1 rounded-xl p-4 text-center" style={{ background:si.bg,border:`1px solid ${si.color}30` }}>
                <div className="text-xl mb-1">{si.emoji}</div>
                <div className="font-title font-bold text-2xl" style={{ color:si.color }}>{cnt}</div>
                <div className="text-[11px] mt-1" style={{ color:si.color,opacity:.7 }}>{si.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}