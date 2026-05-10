import { F_STATUS } from '@/lib/constants'

export default function FinTabela({ financeiro, tipo, onEdit }) {
  const list   = financeiro.filter(t => t.tipo === tipo)
  const conf   = list.filter(t => t.statusPgto !== 'cancelado').reduce((s,t)=>s+t.valor,0)
  const pend   = list.filter(t => t.statusPgto === 'pendente').reduce((s,t)=>s+t.valor,0)
  const isE    = tipo === 'entrada'
  const color  = isE ? 'var(--green)' : 'var(--coral)'

  const exportCSV = () => {
    const rows = [
      ['Descrição', isE?'Marca':'Beneficiário', 'Categoria', 'Status', 'Data', 'Valor'],
      ...list.map(t => [t.desc, t.origem, t.categoria, F_STATUS[t.statusPgto]?.label||t.statusPgto, t.data||'', t.valor])
    ]
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `${tipo}s.csv`; a.click()
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="stat-card"><div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>Total</div><div className="font-title font-bold text-2xl">{list.length}</div></div>
        <div className="stat-card"><div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>Confirmado</div><div className="font-title font-bold text-2xl" style={{ color }}>R${(conf/1000).toFixed(1)}k</div></div>
        <div className="stat-card"><div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>Pendente</div><div className="font-title font-bold text-2xl" style={{ color: 'var(--amber)' }}>R${(pend/1000).toFixed(1)}k</div></div>
      </div>

      <div className="flex justify-end mb-2">
        <button onClick={exportCSV} className="btn-ghost text-xs">↓ Exportar CSV</button>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Descrição', isE?'Marca':'Beneficiário', 'Categoria', 'Status', 'Data', 'Valor'].map(h => (
                <th key={h} className="text-left px-3.5 py-2.5 text-[11px] uppercase tracking-wider" style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-sm" style={{ color: 'var(--text3)' }}>Sem {isE?'entradas':'saídas'}</td></tr>}
            {list.map(t => {
              const si = F_STATUS[t.statusPgto]||F_STATUS.confirmado
              const fd = t.data ? t.data.split('-').slice(1).reverse().join('/') : '—'
              return (
                <tr key={t.id} onClick={() => onEdit(t.id)} className="cursor-pointer" style={{ borderTop: '1px solid var(--border)' }}
                  onMouseEnter={e=>e.currentTarget.querySelectorAll('td').forEach(td=>td.style.background='var(--bg3)')}
                  onMouseLeave={e=>e.currentTarget.querySelectorAll('td').forEach(td=>td.style.background='')}>
                  <td className="px-3.5 py-3 text-sm font-medium">{t.desc||'—'}</td>
                  <td className="px-3.5 py-3 text-sm" style={{ color: 'var(--text2)' }}>{t.origem||'—'}</td>
                  <td className="px-3.5 py-3 text-sm" style={{ color: 'var(--text2)' }}>{t.categoria||'—'}</td>
                  <td className="px-3.5 py-3"><span className="text-xs px-2 py-1 rounded-md" style={{ background: si.bg, color: si.color }}>{si.label}</span></td>
                  <td className="px-3.5 py-3 text-xs" style={{ color: 'var(--text3)' }}>{fd}</td>
                  <td className="px-3.5 py-3 text-sm font-semibold" style={{ color }}>{`R$${Number(t.valor).toLocaleString('pt-BR',{minimumFractionDigits:2})}`}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}