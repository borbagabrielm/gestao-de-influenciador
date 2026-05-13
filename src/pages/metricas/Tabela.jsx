import { fmtN, fmtDate, PLAT_COLOR } from './shared'

export default function MetricasTabela({ sortedTable, sortCol, sortDir, onSort }) {
  const Th = ({ col, children }) => (
    <th className="text-left px-3 py-2.5 text-[10px] uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
      style={{ color: sortCol === col ? 'var(--accent)' : 'var(--text3)', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}
      onClick={() => onSort(col)}>
      {children} {sortCol === col ? (sortDir === -1 ? '↓' : '↑') : ''}
    </th>
  )

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <Th col="data_ref">Data</Th>
            <th className="text-left px-3 py-2.5 text-[10px] uppercase tracking-wider"
              style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>Post</th>
            <th className="text-left px-3 py-2.5 text-[10px] uppercase tracking-wider"
              style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>Plat.</th>
            <Th col="views">Views</Th>
            <Th col="alcance">Alcance</Th>
            <Th col="likes">Likes</Th>
            <Th col="comentarios">Coment.</Th>
            <Th col="salvamentos">Salv.</Th>
            <Th col="compartilhamentos">Compart.</Th>
            <th className="text-left px-3 py-2.5 text-[10px] uppercase tracking-wider"
              style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>Engaj.</th>
          </tr>
        </thead>
        <tbody>
          {sortedTable.length === 0 && (
            <tr><td colSpan={10} className="text-center py-12 text-sm" style={{ color: 'var(--text3)' }}>Nenhuma métrica encontrada</td></tr>
          )}
          {sortedTable.map((m) => {
            const cap = m.raw?.Caption || m.raw?.['Video Caption'] || ''
            const eng = m.alcance > 0
              ? (((m.likes + m.comentarios + m.compartilhamentos) / m.alcance) * 100).toFixed(1) + '%'
              : '—'
            return (
              <tr key={m.id} style={{ borderTop: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = 'var(--bg3)')}
                onMouseLeave={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = '')}>
                <td className="px-3 py-2.5 text-xs whitespace-nowrap" style={{ color: 'var(--text3)' }}>{fmtDate(m.data_ref)}</td>
                <td className="px-3 py-2.5" style={{ maxWidth: 200 }}>
                  <a href={m.raw?.Link || m.raw?.['Video Share URL']} target="_blank" rel="noreferrer"
                    className="text-xs truncate block hover:underline" style={{ color: 'var(--accent)', maxWidth: 180 }}>
                    {cap.slice(0, 40) || m.post_id}
                  </a>
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: (PLAT_COLOR[m.plataforma]||'#888')+'22', color: PLAT_COLOR[m.plataforma]||'#888' }}>
                    {m.plataforma}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-sm font-semibold" style={{ color: 'var(--accent)' }}>{fmtN(m.views)}</td>
                <td className="px-3 py-2.5 text-sm" style={{ color: 'var(--teal)' }}>{fmtN(m.alcance)}</td>
                <td className="px-3 py-2.5 text-sm" style={{ color: 'var(--coral)' }}>{fmtN(m.likes)}</td>
                <td className="px-3 py-2.5 text-sm" style={{ color: 'var(--purple)' }}>{fmtN(m.comentarios)}</td>
                <td className="px-3 py-2.5 text-sm" style={{ color: 'var(--amber)' }}>{fmtN(m.salvamentos)}</td>
                <td className="px-3 py-2.5 text-sm" style={{ color: 'var(--blue)' }}>{fmtN(m.compartilhamentos)}</td>
                <td className="px-3 py-2.5 text-xs font-semibold" style={{ color: 'var(--green)' }}>{eng}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}