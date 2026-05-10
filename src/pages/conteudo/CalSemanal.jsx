import { useState } from 'react'
import { MiniCard } from './shared'

const DOWS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

export default function CnCalSemanal({ conteudos, onEdit, onDrop }) {
  const [offset, setOffset] = useState(0)
  const [dragId, setDragId] = useState(null)
  const [overDay, setOverDay] = useState(null)

  const today = new Date(); today.setHours(0,0,0,0)
  const todayStr = today.toISOString().split('T')[0]
  const start = new Date(today); start.setDate(today.getDate()-today.getDay()+(offset*7))
  const days  = Array.from({length:7},(_,i)=>{ const d=new Date(start);d.setDate(start.getDate()+i);return d })
  const list  = conteudos.filter(c=>c.status!=='backlog'&&c.status!=='arquivado')

  return (
    <div>
      {/* Nav */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={()=>setOffset(o=>o-1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ border:'1px solid var(--border2)',background:'transparent',color:'var(--text2)',cursor:'pointer' }}>‹</button>
        <button onClick={()=>setOffset(o=>o+1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ border:'1px solid var(--border2)',background:'transparent',color:'var(--text2)',cursor:'pointer' }}>›</button>
        <span className="text-sm font-medium" style={{ color:'var(--text2)' }}>
          {days[0].toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})} — {days[6].toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}
        </span>
        <button onClick={()=>setOffset(0)} className="text-xs px-3 py-1.5 rounded-lg ml-auto" style={{ border:'1px solid var(--border2)',background:'transparent',color:'var(--text2)',cursor:'pointer' }}>Hoje</button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(day=>{
          const ds = day.toISOString().split('T')[0]
          const isT = ds===todayStr
          const cards = list.filter(c=>c.data_publicacao===ds)
          const isOver = overDay===ds

          return (
            <div key={ds} className="rounded-xl p-3 transition-all"
              style={{
                minHeight:180,
                background: isOver?'var(--accent-dk)':'var(--bg2)',
                border: `1px solid ${isT?'var(--accent)':isOver?'var(--accent)':'var(--border)'}`,
                outline: isOver?'2px dashed var(--accent)':'none',
              }}
              onDragOver={e=>{e.preventDefault();setOverDay(ds)}}
              onDragLeave={()=>setOverDay(null)}
              onDrop={()=>{if(dragId){onDrop(dragId,{data_publicacao:ds});setDragId(null);setOverDay(null)}}}
            >
              <div className="text-[11px] uppercase tracking-wider mb-1" style={{ color:'var(--text3)' }}>{DOWS[day.getDay()]}</div>
              <div className="font-title font-bold text-xl mb-2.5" style={{ color:isT?'var(--accent)':'var(--text2)' }}>{day.getDate()}</div>
              {cards.map(c=>(
                <MiniCard key={c.id} c={c} onEdit={onEdit}
                  onDragStart={()=>setDragId(c.id)}
                  onDragEnd={()=>setDragId(null)} />
              ))}
              {cards.length===0&&<div className="text-[10px] text-center py-3" style={{ color:'var(--text3)' }}>–</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}