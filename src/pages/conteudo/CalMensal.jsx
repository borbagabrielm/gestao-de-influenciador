import { useState } from 'react'
import { MiniCard, isAtrasado } from './shared'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DOWS   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

export default function CnCalMensal({ conteudos, onEdit, onDrop, onNewItem }) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year,  setYear]  = useState(now.getFullYear())
  const [dragId, setDragId] = useState(null)
  const [overCell, setOverCell] = useState(null)

  const prev = () => { if (month===0){setMonth(11);setYear(y=>y-1)}else setMonth(m=>m-1) }
  const next = () => { if (month===11){setMonth(0);setYear(y=>y+1)}else setMonth(m=>m+1) }

  const today    = now.toISOString().split('T')[0]
  const firstDay = new Date(year,month,1).getDay()
  const daysInM  = new Date(year,month+1,0).getDate()
  const daysInP  = new Date(year,month,0).getDate()
  const list     = conteudos.filter(c => c.status !== 'backlog' && c.status !== 'arquivado')

  const cells = []
  for (let i=firstDay-1;i>=0;i--) cells.push({ day:daysInP-i, other:true })
  for (let d=1;d<=daysInM;d++)    cells.push({ day:d, other:false })
  while (cells.length<42)         cells.push({ day:cells.length-firstDay-daysInM+1, other:true })

  const handleDrop = (ds) => {
    if (dragId) { onDrop(dragId, { data_publicacao: ds }); setDragId(null); setOverCell(null) }
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background:'var(--bg2)', border:'1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom:'1px solid var(--border)' }}>
        <div className="flex gap-1.5">
          <button onClick={prev} className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ border:'1px solid var(--border2)', background:'transparent', color:'var(--text2)', cursor:'pointer' }}>‹</button>
          <button onClick={next} className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ border:'1px solid var(--border2)', background:'transparent', color:'var(--text2)', cursor:'pointer' }}>›</button>
        </div>
        <span className="font-title font-bold text-base flex-1 text-center">{MONTHS[month]} {year}</span>
        <button onClick={()=>{setMonth(now.getMonth());setYear(now.getFullYear())}} className="text-xs px-3 py-1.5 rounded-lg" style={{ border:'1px solid var(--border2)', background:'transparent', color:'var(--text2)', cursor:'pointer' }}>Hoje</button>
      </div>

      {/* DOW */}
      <div className="grid grid-cols-7" style={{ borderBottom:'1px solid var(--border)' }}>
        {DOWS.map(d=><div key={d} className="text-center py-2.5 text-[11px] uppercase tracking-wider" style={{ color:'var(--text3)' }}>{d}</div>)}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell,idx) => {
          const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(cell.day).padStart(2,'0')}`
          const isToday   = !cell.other && ds === today
          const dayCards  = cell.other ? [] : list.filter(c=>c.data_publicacao===ds)
          const isOver    = overCell === ds
          const shown     = dayCards.slice(0,3)
          const extra     = dayCards.length-3

          return (
            <div key={idx}
  style={{
    minHeight:96,
    borderRight: idx%7===6?'none':'1px solid var(--border)',
    borderBottom:'1px solid var(--border)',
    padding:'6px',
    opacity: cell.other?0.35:1,
    background: isOver?'var(--accent-dk)':'',
    outline: isOver?'2px dashed var(--accent)':'none',
    transition:'background .15s',
    cursor: cell.other ? 'default' : 'pointer',
  }}
  onClick={() => !cell.other && !dragId && onNewItem?.(ds)}
  onDragOver={e=>{e.preventDefault();if(!cell.other)setOverCell(ds)}}
              onDragLeave={()=>setOverCell(null)}
              onDrop={()=>!cell.other&&handleDrop(ds)}
              onMouseEnter={e=>{if(!cell.other&&!isOver)e.currentTarget.style.background='var(--bg3)'}}
              onMouseLeave={e=>{if(!isOver)e.currentTarget.style.background=''}}
            >
              <div className="text-xs mb-1 inline-flex items-center justify-center"
                style={{
                  color:isToday?'#000':'var(--text2)',
                  background:isToday?'var(--accent)':'transparent',
                  width:isToday?22:'auto', height:isToday?22:'auto',
                  borderRadius:isToday?'50%':0, fontWeight:isToday?700:400,
                }}>{cell.day}</div>
              {shown.map(c=>(
                <MiniCard key={c.id} c={c} onEdit={id => { onEdit(id) }}
                  onDragStart={()=>setDragId(c.id)}
                  onDragEnd={()=>setDragId(null)} />
              ))}
              {extra>0&&<div className="text-[10px] px-1" style={{ color:'var(--text3)' }}>+{extra} mais</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}