import { useState } from 'react'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function initial(name) {
  return name?.trim().toUpperCase()[0] || '#'
}

function lastContact(p) {
  // Pega a data mais recente entre followup, pubdate e pgtoDate
  const dates = [p.followup, p.pubdate, p.pgtoDate].filter(Boolean).sort().reverse()
  return dates[0] || null
}

function fmtDate(d) {
  if (!d) return '—'
  return d.split('-').slice(1).reverse().join('/') + '/' + d.split('-')[0].slice(2)
}

export default function ParceriasAgenda({ prospects }) {
  const [search,   setSearch]   = useState('')
  const [expanded, setExpanded] = useState({})
  const [activeLetters, setActiveLetters] = useState(null)

  // Filtra só marcas com contato cadastrado
  const withContact = prospects.filter(p =>
    p.contact || p.email || p.whatsapp
  )

  // Filtra por busca
  const filtered = withContact.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.company.toLowerCase().includes(q) ||
           p.contact.toLowerCase().includes(q) ||
           p.email.toLowerCase().includes(q)
  })

  // Agrupa por letra inicial da marca
  const grouped = {}
  filtered.forEach(p => {
    const letter = initial(p.company)
    if (!grouped[letter]) grouped[letter] = []
    grouped[letter].push(p)
  })

  // Ordena dentro de cada grupo
  Object.keys(grouped).forEach(k => {
    grouped[k].sort((a, b) => a.company.localeCompare(b.company))
  })

  const letters = Object.keys(grouped).sort()

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  return (
    <div>
      {/* Barra de busca + stats */}
      <div className="flex items-center gap-3 mb-5">
        <input
          className="form-input flex-1"
          placeholder="Buscar marca ou contato..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <span className="text-xs px-2.5 py-1 rounded-md"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text3)' }}>
          {withContact.length} contatos
        </span>
      </div>

      {/* Índice alfabético */}
      <div className="flex flex-wrap gap-1 mb-5">
        {ALPHABET.map(l => {
          const has = !!grouped[l]
          return (
            <button key={l}
              onClick={() => {
                if (!has) return
                const el = document.getElementById(`agenda-${l}`)
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="w-7 h-7 rounded-md text-xs font-bold transition-colors"
              style={{
                background: has ? 'var(--accent-dk)' : 'var(--bg2)',
                color: has ? 'var(--accent)' : 'var(--text3)',
                border: `1px solid ${has ? 'var(--accent)30' : 'var(--border)'}`,
                cursor: has ? 'pointer' : 'default',
              }}>
              {l}
            </button>
          )
        })}
      </div>

      {letters.length === 0 && (
        <div className="text-center py-16 text-sm" style={{ color: 'var(--text3)' }}>
          {search ? 'Nenhum contato encontrado' : 'Nenhum contato cadastrado ainda'}
        </div>
      )}

      {/* Lista por letra */}
      {letters.map(letter => (
        <div key={letter} id={`agenda-${letter}`} className="mb-6">
          {/* Header da letra */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-title font-bold text-sm flex-shrink-0"
              style={{ background: 'var(--accent)', color: '#000' }}>
              {letter}
            </div>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-[10px]" style={{ color: 'var(--text3)' }}>
              {grouped[letter].length} marca{grouped[letter].length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Cards da letra */}
          <div className="flex flex-col gap-2">
            {grouped[letter].map(p => {
              const isOpen = !!expanded[p.id]
              const last   = lastContact(p)
              return (
                <div key={p.id}
                  className="rounded-xl overflow-hidden transition-all"
                  style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                  {/* Header do card */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                    onClick={() => toggle(p.id)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    {/* Avatar da marca */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-title font-bold text-sm flex-shrink-0 text-black"
                      style={{ background: 'var(--accent)' }}>
                      {p.company[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{p.company}</div>
                      <div className="text-[11px]" style={{ color: 'var(--text3)' }}>
                        {p.contact || '—'}
                        {last && <span> · Último contato: {fmtDate(last)}</span>}
                      </div>
                    </div>
                    {/* Tags rápidas */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {p.email && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md"
                          style={{ background: 'var(--teal-bg)', color: 'var(--teal)' }}>✉</span>
                      )}
                      {p.whatsapp && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md"
                          style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>💬</span>
                      )}
                      <span className="text-base transition-transform"
                        style={{ color: 'var(--text3)', transform: isOpen ? 'rotate(90deg)' : '' }}>›</span>
                    </div>
                  </div>

                  {/* Expandido */}
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                      <div className="grid gap-3 mt-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text3)' }}>Contato</div>
                          <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{p.contact || '—'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text3)' }}>E-mail</div>
                          {p.email
                            ? <a href={`mailto:${p.email}`} className="text-sm hover:underline" style={{ color: 'var(--teal)' }}>{p.email}</a>
                            : <div className="text-sm" style={{ color: 'var(--text3)' }}>—</div>
                          }
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text3)' }}>WhatsApp</div>
                          {p.whatsapp
                            ? <a href={`https://wa.me/${p.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                                className="text-sm hover:underline" style={{ color: 'var(--green)' }}>{p.whatsapp}</a>
                            : <div className="text-sm" style={{ color: 'var(--text3)' }}>—</div>
                          }
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text3)' }}>Último contato</div>
                          <div className="text-sm" style={{ color: 'var(--text)' }}>{fmtDate(last)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text3)' }}>Status</div>
                          <div className="text-sm" style={{ color: 'var(--text)' }}>{p.status}</div>
                        </div>
                        {p.campanha && (
                          <div>
                            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text3)' }}>Campanha</div>
                            <div className="text-sm" style={{ color: 'var(--blue)' }}>{p.campanha}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}