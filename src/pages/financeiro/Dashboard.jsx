export default function FinDashboard({ financeiro: list }) {
  const ent  = list.filter(t => t.tipo==='entrada' && t.statusPgto==='confirmado')
  const sai  = list.filter(t => t.tipo==='saida'   && t.statusPgto!=='cancelado')
  const totalE = ent.reduce((s,t)=>s+t.valor,0)
  const totalS = sai.reduce((s,t)=>s+t.valor,0)
  const saldo  = totalE - totalS
  const pendE  = list.filter(t=>t.tipo==='entrada'&&t.statusPgto==='pendente').reduce((s,t)=>s+t.valor,0)
  const pendS  = list.filter(t=>t.tipo==='saida'  &&t.statusPgto==='pendente').reduce((s,t)=>s+t.valor,0)

  const catE = {}; ent.forEach(t => { catE[t.categoria] = (catE[t.categoria]||0)+t.valor })
  const catS = {}; sai.forEach(t => { catS[t.categoria] = (catS[t.categoria]||0)+t.valor })
  const topE = Object.entries(catE).sort((a,b)=>b[1]-a[1]).slice(0,5)
  const topS = Object.entries(catS).sort((a,b)=>b[1]-a[1]).slice(0,5)
  const maxE = topE[0]?.[1]||1, maxS = topS[0]?.[1]||1

  const BarChart = ({ items, max, color }) => (
    <div className="space-y-2">
      {items.length ? items.map(([cat,val]) => (
        <div key={cat} className="flex items-center gap-2.5">
          <span className="text-xs w-28 truncate flex-shrink-0" style={{ color: 'var(--text3)' }}>{cat||'Outro'}</span>
          <div className="flex-1 rounded h-2 overflow-hidden" style={{ background: 'var(--bg3)' }}>
            <div className="h-full rounded transition-all" style={{ background: color, width: `${(val/max*100).toFixed(0)}%` }} />
          </div>
          <span className="text-xs w-16 text-right flex-shrink-0" style={{ color }}>{`R$${(val/1000).toFixed(1)}k`}</span>
        </div>
      )) : <p className="text-xs" style={{ color: 'var(--text3)' }}>Sem dados</p>}
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Saldo */}
      <div className="rounded-2xl p-7 flex items-center gap-8 flex-wrap" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>Saldo atual</div>
          <div className="font-title font-black text-4xl" style={{ color: saldo>=0?'var(--green)':'var(--coral)' }}>
            {saldo < 0 ? '-' : ''}R$ {Math.abs(saldo).toLocaleString('pt-BR',{minimumFractionDigits:2})}
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          {[
            { label:'Entradas',  val:totalE, color:'var(--green)' },
            { label:'Saídas',    val:totalS, color:'var(--coral)' },
            { label:'A receber', val:pendE,  color:'var(--amber)' },
            { label:'A pagar',   val:pendS,  color:'var(--pink)'  },
          ].map(p => (
            <div key={p.label} className="rounded-xl px-5 py-4 text-center" style={{ background: 'var(--bg3)', minWidth: 120 }}>
              <div className="text-[11px] mb-1" style={{ color: 'var(--text3)' }}>{p.label}</div>
              <div className="font-title font-bold text-lg" style={{ color: p.color }}>R${(p.val/1000).toFixed(1)}k</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <div className="text-sm font-medium mb-4" style={{ color: 'var(--text2)' }}>Receitas por categoria</div>
          <BarChart items={topE} max={maxE} color="var(--green)" />
        </div>
        <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <div className="text-sm font-medium mb-4" style={{ color: 'var(--text2)' }}>Despesas por categoria</div>
          <BarChart items={topS} max={maxS} color="var(--coral)" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label:'Transações',      val: list.length },
          { label:'Ticket médio',    val: ent.length ? `R$${(totalE/ent.length/1000).toFixed(1)}k` : '—', color:'var(--accent)' },
          { label:'Maior receita',   val: ent.length ? `R$${(Math.max(...ent.map(t=>t.valor))/1000).toFixed(1)}k` : '—', color:'var(--green)' },
          { label:'Maior despesa',   val: sai.length ? `R$${(Math.max(...sai.map(t=>t.valor))/1000).toFixed(1)}k` : '—', color:'var(--coral)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>{s.label}</div>
            <div className="font-title font-bold text-2xl" style={{ color: s.color||'var(--text)' }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}