import { useHistorico } from '@/hooks/useHistorico'

const CAMPO_LABEL = {
  status: 'Status',
  phase:  'Fase',
  company: 'Empresa',
  value:  'Valor',
}

const fmt = (iso) => {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ' ' +
         d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function Historico({ tipo, refId }) {
  const { historico, loading } = useHistorico(tipo, refId)

  if (!refId) return null

  return (
    <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text3)' }}>
        🕐 Histórico de alterações
      </div>

      {loading && (
        <div className="space-y-2">
          {[1,2].map(i => (
            <div key={i} className="rounded-lg p-3" style={{ background: 'var(--bg3)' }}>
              <div className="skeleton rounded h-2.5 w-32 mb-1.5" />
              <div className="skeleton rounded h-2 w-48" />
            </div>
          ))}
        </div>
      )}

      {!loading && historico.length === 0 && (
        <p className="text-xs" style={{ color: 'var(--text3)' }}>Nenhuma alteração registrada ainda.</p>
      )}

      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
        {historico.map(h => (
          <div key={h.id} className="rounded-lg p-3 flex items-start gap-3"
            style={{ background: 'var(--bg3)' }}>
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--accent)' }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs" style={{ color: 'var(--text)' }}>
                <span style={{ color: 'var(--text3)' }}>{CAMPO_LABEL[h.campo] || h.campo}:</span>{' '}
                <span style={{ color: 'var(--coral)', textDecoration: 'line-through' }}>{h.valor_anterior || '—'}</span>
                {' → '}
                <span style={{ color: 'var(--green)' }}>{h.valor_novo}</span>
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text3)' }}>
                {h.user_email?.split('@')[0]} · {fmt(h.created_at)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}