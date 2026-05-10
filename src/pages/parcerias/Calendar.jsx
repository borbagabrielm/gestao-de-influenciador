import { useState } from 'react'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DOWS   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

export default function ParceriasCalendar({ allProspects, onEdit }) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year,  setYear]  = useState(now.getFullYear())

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }

  const today    = now.toISOString().split('T')[0]
  const firstDay = new Date(year, month, 1).getDay()
  const daysInM  = new Date(year, month+1, 0).getDate()
  const daysInP  = new Date(year, month, 0).getDate()

  const cells = []
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInP - i, other: true })
  for (let d = 1; d <= daysInM; d++) cells.push({ day: d, other: false })
  while (cells.length < 42) cells.push({ day: cells.length - firstDay - daysInM + 1, other: true })

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex gap-1.5">
          <button onClick={prev} className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-colors" style={{ border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', cursor: 'pointer' }}>‹</button>
          <button onClick={next} className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-colors" style={{ border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', cursor: 'pointer' }}>›</button>
        </div>
        <span className="font-title font-bold text-base flex-1 text-center">{MONTHS[month]} {year}</span>
        <button onClick={() => { setMonth(now.getMonth()); setYear(now.getFullYear()) }}
          className="text-xs px-3 py-1.5 rounded-lg" style={{ border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', cursor: 'pointer' }}>Hoje</button>
      </div>

      {/* DOW header */}
      <div className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--border)' }}>
        {DOWS.map(d => <div key={d} className="text-center py-2.5 text-[11px] uppercase tracking-wider" style={{ color: 'var(--text3)' }}>{d}</div>)}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(cell.day).padStart(2,'0')}`
          const isToday = !cell.other && ds === today
          const evs = cell.other ? [] : allProspects.filter(p => p.followup === ds || p.pubdate === ds || p.pgtoDate === ds)

          return (
            <div key={idx} className="transition-colors" style={{
              minHeight: 96,
              borderRight: idx % 7 === 6 ? 'none' : '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
              padding: '6px',
              opacity: cell.other ? 0.35 : 1,
            }}
              onMouseEnter={e => !cell.other && (e.currentTarget.style.background = 'var(--bg3)')}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <div className="text-xs mb-1 inline-flex items-center justify-center"
                style={{
                  color: isToday ? '#000' : 'var(--text2)',
                  background: isToday ? 'var(--accent)' : 'transparent',
                  width: isToday ? 22 : 'auto',
                  height: isToday ? 22 : 'auto',
                  borderRadius: isToday ? '50%' : 0,
                  fontWeight: isToday ? 700 : 400,
                }}>
                {cell.day}
              </div>
              {evs.map(p => {
                const c = p.pubdate === ds ? '#4ade80' : p.pgtoDate === ds ? '#fbbf24' : '#60a5fa'
                const l = p.pubdate === ds ? '📢 ' : p.pgtoDate === ds ? '💰 ' : '↩ '
                return (
                  <div key={p.id} onClick={() => onEdit(p.id)} className="text-[10px] px-1.5 py-0.5 rounded mb-0.5 cursor-pointer truncate"
                    style={{ background: c+'22', color: c }}>
                    {l}{p.company}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}