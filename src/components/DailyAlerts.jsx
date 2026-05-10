import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DailyAlerts() {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const load = async () => {
      const [p, c, f] = await Promise.all([
        supabase.from('prospects').select('id,company,status').eq('followup', today),
        supabase.from('conteudos').select('id,titulo,rede_social').eq('data_publicacao', today).neq('status','arquivado'),
        supabase.from('financeiro').select('id,descricao,valor,tipo').eq('data', today).eq('status_pgto','pendente'),
      ])
      const all = [
        ...(p.data||[]).map(r => ({ id:r.id, icon:'↩', color:'var(--blue)',  label: r.company,   sub: 'Follow-up de parceria' })),
        ...(c.data||[]).map(r => ({ id:r.id, icon:'📢', color:'var(--green)', label: r.titulo,    sub: 'Publicação prevista hoje' })),
        ...(f.data||[]).map(r => ({ id:r.id, icon:'💰', color:'var(--amber)', label: r.descricao, sub: r.tipo === 'entrada' ? 'A receber hoje' : 'A pagar hoje' })),
      ]
      setAlerts(all)
    }
    load()
  }, [])

  if (!alerts.length) return null

  return (
    <div className="rounded-xl overflow-hidden mb-6" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <span>🔔</span>
        <span className="text-sm font-medium">Hoje</span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--coral-bg)', color: 'var(--coral)' }}>{alerts.length}</span>
      </div>
      {alerts.map((a, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < alerts.length - 1 ? '1px solid var(--border)' : 'none' }}>
          <span style={{ fontSize: 18 }}>{a.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{a.label}</div>
            <div className="text-xs" style={{ color: 'var(--text3)' }}>{a.sub}</div>
          </div>
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.color }} />
        </div>
      ))}
    </div>
  )
}