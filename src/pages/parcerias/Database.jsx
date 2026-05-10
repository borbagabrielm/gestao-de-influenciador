import { useState } from 'react'
import { P_PHASES } from '@/lib/constants'
import { getStatusInfo, tagClass } from './shared'

export default function ParceriasDatabase({ prospects, onEdit }) {
  const [sort, setSort] = useState({ col: 'company', dir: 1 })

  const sorted = [...prospects].sort((a, b) => {
    const av = a[sort.col] || '', bv = b[sort.col] || ''
    return av < bv ? -sort.dir : av > bv ? sort.dir : 0
  })

  const Th = ({ col, children }) => (
    <th className="text-left px-3.5 py-2.5 text-[11px] uppercase tracking-wider cursor-pointer select-none"
      style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}
      onClick={() => setSort(s => ({ col, dir: s.col === col ? -s.dir : 1 }))}>
      {children} {sort.col === col ? (sort.dir === 1 ? '↑' : '↓') : ''}
    </th>
  )

  const exportCSV = () => {
    const rows = [
      ['Empresa','Contato','Tipo','Modo','Status','Fase','Valor','Follow-up'],
      ...prospects.map(p => {
        const m = P_PHASES[p.phase||1]
        const si = getStatusInfo(p)
        return [p.company, p.contact, p.tags.join(';'), p.modo||'', si.label, m.label, p.value||0, p.followup||'']
      })
    ]
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'parcerias.csv'
    a.click()
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={exportCSV} className="btn-ghost text-xs flex items-center gap-1.5">
          ↓ Exportar CSV
        </button>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <Th col="company">Empresa</Th>
              <Th col="contact">Contato</Th>
              <th className="text-left px-3.5 py-2.5 text-[11px] uppercase tracking-wider" style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>Tipo</th>
              <th className="text-left px-3.5 py-2.5 text-[11px] uppercase tracking-wider" style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>Modo</th>
              <th className="text-left px-3.5 py-2.5 text-[11px] uppercase tracking-wider" style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>Status</th>
              <th className="text-left px-3.5 py-2.5 text-[11px] uppercase tracking-wider" style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>Fase</th>
              <Th col="value">Valor</Th>
              <Th col="followup">Follow-up</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-sm" style={{ color: 'var(--text3)' }}>Nenhuma prospecção encontrada</td></tr>
            )}
            {sorted.map(p => {
              const si = getStatusInfo(p)
              const m  = P_PHASES[p.phase||1]
              const fd = p.followup ? p.followup.split('-').slice(1).reverse().join('/') : '—'
              return (
                <tr key={p.id} onClick={() => onEdit(p.id)} className="cursor-pointer transition-colors"
                  style={{ borderTop: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = 'var(--bg3)')}
                  onMouseLeave={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = '')}>
                  <td className="px-3.5 py-3 text-sm font-medium">{p.company}</td>
                  <td className="px-3.5 py-3 text-sm" style={{ color: 'var(--text2)' }}>{p.contact||'—'}</td>
                  <td className="px-3.5 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {p.tags.map(t => <span key={t} className="tag-base text-[10px]" style={{ background: t==='publicidade'?'var(--purple-bg)':t==='permuta'?'var(--teal-bg)':t==='seeding'?'var(--amber-bg)':'var(--bg4)', color: t==='publicidade'?'var(--purple)':t==='permuta'?'var(--teal)':t==='seeding'?'var(--amber)':'var(--text2)' }}>{t}</span>)}
                    </div>
                  </td>
                  <td className="px-3.5 py-3">
                    {p.modo && <span className="tag-base" style={{ background: p.modo==='ativa'?'#0e2010':'#1a0e28', color: p.modo==='ativa'?'#4ade80':'#c084fc' }}>{p.modo}</span>}
                  </td>
                  <td className="px-3.5 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md" style={{ background: si.bg, color: si.color }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: si.color }} />
                      {si.label}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-xs" style={{ color: m.color }}>{m.label}</td>
                  <td className="px-3.5 py-3 text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                    {p.value ? `R$${Number(p.value).toLocaleString('pt-BR')}` : '—'}
                  </td>
                  <td className="px-3.5 py-3 text-xs" style={{ color: 'var(--text3)' }}>{fd}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}