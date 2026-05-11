import { useToast } from '@/contexts/ToastContext'
import { StatsRow, KCard } from './shared'

const COLS = [
  { key: 'lead',          label: 'Lead mapeado',    color: '#5a5a6e' },
  { key: 'contato',       label: 'Em contato',       color: '#60a5fa' },
  { key: 'negociacao',    label: 'Em negociação',    color: '#fbbf24' },
  { key: 'proposta',      label: 'Proposta enviada', color: '#c084fc' },
  { key: 'fechado',       label: 'Fechado ★',        color: '#4ade80' },
  { key: 'perdido',       label: 'Perdido ✗',        color: '#f87171' },
  { key: 'producao',      label: 'Produção',          color: '#60a5fa' },
  { key: 'aprovacao',     label: 'Aprovação',         color: '#f472b6' },
  { key: 'publicado',     label: 'Publicado',         color: '#4ade80' },
  { key: 'pgto_pendente', label: 'Pgto. pendente',   color: '#f87171' },
  { key: 'recebido',      label: 'Recebido ✓',       color: '#4ade80' },
]

export default function ParceriasKanban({ prospects, onEdit, onSave }) {
  const toast   = useToast()
  const [dragId,  setDragId]  = [null, () => {}]
  let _dragId = null
  let _overCol = null

  const handleDrop = async (newStatus, prospect) => {
    if (!prospect || prospect.status === newStatus) return
    try {
      await onSave({ ...prospect, status: newStatus }, prospect.id)
    } catch(e) {
      toast.error('Erro ao mover card: ' + e.message)
    }
  }

  return (
    <>
      <StatsRow prospects={prospects} />
      <div className="flex gap-3.5 overflow-x-auto pb-2">
        {COLS.map(col => {
          const cards = prospects.filter(p => p.status === col.key)
          return (
            <div key={col.key} className="flex-shrink-0" style={{ width: 240 }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                const id = e.dataTransfer.getData('prospectId')
                const prospect = prospects.find(p => p.id === id)
                handleDrop(col.key, prospect)
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text2)' }}>{col.label}</span>
                <span className="ml-auto text-[11px] px-1.5 py-0.5 rounded-md" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>{cards.length}</span>
              </div>
              <div className="flex flex-col gap-2.5 min-h-16 rounded-xl p-1 transition-all">
                {cards.length > 0
                  ? cards.map(p => (
                      <div key={p.id} draggable
                        onDragStart={e => e.dataTransfer.setData('prospectId', p.id)}
                        style={{ cursor: 'grab' }}>
                        <KCard prospect={p} onEdit={onEdit} color={col.color} />
                      </div>
                    ))
                  : <div className="text-center py-6 text-xs rounded-xl" style={{ color: 'var(--text3)', border: '1px dashed var(--border)' }}>Vazio</div>
                }
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}