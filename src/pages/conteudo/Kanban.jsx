import { useState } from 'react'
import { CN_STATUS } from '@/lib/constants'
import { KCard } from './shared'

const COLS = ['backlog', 'planejado', 'gravado', 'editado', 'publicado']

export default function CnKanban({ conteudos, onEdit, onDrop }) {
  const [dragId,  setDragId]  = useState(null)
  const [overCol, setOverCol] = useState(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')

  const list = conteudos.filter(c => {
    if (c.status === 'arquivado') return false
    if (dateFrom && c.data_publicacao && c.data_publicacao < dateFrom) return false
    if (dateTo   && c.data_publicacao && c.data_publicacao > dateTo)   return false
    return true
  })

  return (
    <div>
      {/* Filtro de data */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs" style={{ color: 'var(--text3)' }}>📅 Publicação:</span>
        <span className="text-xs" style={{ color: 'var(--text3)' }}>De</span>
        <input type="date" className="form-input text-xs py-1 px-2" style={{ width: 'auto' }}
          value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <span className="text-xs" style={{ color: 'var(--text3)' }}>Até</span>
        <input type="date" className="form-input text-xs py-1 px-2" style={{ width: 'auto' }}
          value={dateTo} onChange={e => setDateTo(e.target.value)} />
        {(dateFrom || dateTo) && (
          <button className="text-xs px-2.5 py-1 rounded-md"
            style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer' }}
            onClick={() => { setDateFrom(''); setDateTo('') }}>✕</button>
        )}
      </div>

      <div className="flex gap-3.5 overflow-x-auto pb-2">
        {COLS.map(col => {
          const si    = CN_STATUS[col]
          const cards = list.filter(c => c.status === col)
          const isOver = overCol === col
          return (
            <div key={col} className="flex-shrink-0" style={{ width: 240 }}
              onDragOver={e => { e.preventDefault(); setOverCol(col) }}
              onDragLeave={() => setOverCol(null)}
              onDrop={() => {
                if (dragId && dragId.status !== col) {
                  onDrop(dragId.id, { status: col })
                  setDragId(null)
                  setOverCol(null)
                }
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: si.color }} />
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text2)' }}>{si.emoji} {si.label}</span>
                <span className="ml-auto text-[11px] px-1.5 py-0.5 rounded-md" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>{cards.length}</span>
              </div>
              <div className="flex flex-col gap-2.5 min-h-16 rounded-xl transition-all p-1"
                style={{
                  background: isOver ? 'var(--accent-dk)' : 'transparent',
                  outline: isOver ? '2px dashed var(--accent)' : 'none',
                }}>
                {cards.length > 0
                  ? cards.map(c => (
                      <div key={c.id} draggable
                        onDragStart={() => setDragId({ id: c.id, status: c.status })}
                        onDragEnd={() => setDragId(null)}>
                        <KCard c={c} onEdit={onEdit} />
                      </div>
                    ))
                  : <div className="text-center py-6 text-xs rounded-xl" style={{ color: 'var(--text3)', border: '1px dashed var(--border)' }}>
                      {isOver ? 'Solte aqui' : 'Vazio'}
                    </div>
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}