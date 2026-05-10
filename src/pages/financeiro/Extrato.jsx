import { F_STATUS } from '@/lib/constants'

export default function FinExtrato({ financeiro, onEdit }) {
  const sorted = [...financeiro].sort((a,b) => (b.data||'').localeCompare(a.data||''))
  if (!sorted.length) return <p className="text-center py-12 text-sm" style={{ color: 'var(--text3)' }}>Nenhuma transação</p>

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      {sorted.map((t, i) => {
        const si  = F_STATUS[t.statusPgto] || F_STATUS.confirmado
        const isE = t.tipo === 'entrada'
        const fd  = t.data ? t.data.split('-').slice(1).reverse().join('/') : ''
        return (
          <div key={t.id}
            className="flex items-center gap-3.5 px-4 py-3 cursor-pointer transition-colors"
            style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: 'var(--bg2)' }}
            onClick={() => onEdit(t.id)}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: isE ? 'var(--green-bg)' : 'var(--coral-bg)' }}>
              {isE ? '📥' : '📤'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{t.desc||'—'}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                {t.categoria}{t.origem ? ' · '+t.origem : ''}{fd ? ' · '+fd : ''}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-title font-bold text-base" style={{ color: isE ? 'var(--green)' : 'var(--coral)' }}>
                {isE?'+':'-'} R${Number(t.valor).toLocaleString('pt-BR',{minimumFractionDigits:2})}
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md mt-1 inline-block" style={{ background: si.bg, color: si.color }}>{si.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}