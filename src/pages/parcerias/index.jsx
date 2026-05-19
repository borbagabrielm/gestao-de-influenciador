import { useState, useEffect } from 'react'
import { useProspects } from '@/hooks/useProspects'
import { useToast } from '@/contexts/ToastContext'
import Sidebar, { SidebarSection, SidebarItem } from '@/components/Sidebar'
import GlobalSearch from '@/components/GlobalSearch'
import { SkeletonKanban, SkeletonStats } from '@/components/Skeleton'
import ParceriasKanban   from './Kanban'
import ParceriasFases    from './Fases'
import ParceriasPipeline from './Pipeline'
import ParceriasCalendar from './Calendar'
import ParceriasDatabase from './Database'
import ParceriasModal    from './Modal'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { P_PHASES } from '@/lib/constants'

const VIEWS = [
  { id: 'kanban',    label: 'Kanban · Status' },
  { id: 'phases',   label: 'Kanban · Fases'  },
  { id: 'pipeline', label: 'Pipeline'         },
  { id: 'calendar', label: 'Calendário'       },
  { id: 'database', label: 'Banco de dados'   },
]

export default function ParceriasPage() {
  const { prospects, loading, save, remove } = useProspects()
  const toast = useToast()

  const [view,    setView]    = useState('kanban')
  const [filters, setFilters] = useState({ tipo: 'all', modo: 'all' })
  const [dateF,   setDateF]   = useState({ field: 'followup', from: null, to: null })
  const [search,  setSearch]  = useState('')
  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [datePreset, setDatePreset] = useState(null)

  useKeyboardShortcuts([
  { key: 'n', action: () => openNew() },
])

  // ── filtros ──
  const filtered = prospects.filter(p => {
    if (filters.tipo !== 'all' && !p.tags.includes(filters.tipo)) return false
    if (filters.modo !== 'all' && p.modo !== filters.modo) return false
    if (search && !p.company.toLowerCase().includes(search.toLowerCase()) &&
        !p.contact.toLowerCase().includes(search.toLowerCase())) return false
    if (dateF.from || dateF.to) {
      const fm = { followup: 'followup', pubdate: 'pubdate', pgto_date: 'pgtoDate' }
      const v  = p[fm[dateF.field] || 'followup']
      if (!v) return false
      if (dateF.from && v < dateF.from) return false
      if (dateF.to   && v > dateF.to)   return false
    }
    return true
  })

  const openNew  = () => { setEditing(null); setModal(true) }
  const openEdit = id => { setEditing(prospects.find(p => p.id === id) || null); setModal(true) }

  const handleSave = async payload => {
    try {
      await save(payload, editing?.id)
      toast.success(editing ? '✓ Prospecção atualizada' : '✓ Prospecção criada')
      setModal(false)
    } catch(e) { toast.error('Erro: ' + e.message) }
  }
  const handleDelete = async id => {
    try {
      await remove(id)
      toast.success('Prospecção excluída')
      setModal(false)
    } catch(e) { toast.error('Erro: ' + e.message) }
  }

const viewProps = { prospects: filtered, allProspects: prospects, onEdit: openEdit, onSave: save }

useEffect(() => {
  if (loading) return // aguarda carregar
  const handler = (e) => {
    if (e.detail?.type === 'parceria') {
      const prospect = prospects.find(p => p.id === e.detail.id)
      if (prospect) { setEditing(prospect); setModal(true) }
    }
  }
  // Verifica se já tem item pendente para abrir
  if (window.__openItem?.type === 'parceria') {
    const prospect = prospects.find(p => p.id === window.__openItem.id)
    if (prospect) { setEditing(prospect); setModal(true); window.__openItem = null }
  }
  window.addEventListener('open-item', handler)
  return () => window.removeEventListener('open-item', handler)
}, [prospects, loading])

const isMobile = useIsMobile()

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      <Sidebar title="Parcerias" subtitle="P">
        <SidebarSection label="Visões">
          {VIEWS.map(v => (
            <SidebarItem key={v.id} active={view === v.id} onClick={() => setView(v.id)}>
              {v.label}
            </SidebarItem>
          ))}
        </SidebarSection>
        <SidebarSection label="Tipo">
          {['all','publicidade','permuta','seeding'].map(t => (
            <SidebarItem key={t} active={filters.tipo === t} onClick={() => setFilters(f => ({ ...f, tipo: t }))}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{
                background: t === 'all' ? 'var(--text3)' : t === 'publicidade' ? 'var(--purple)' : t === 'permuta' ? 'var(--teal)' : 'var(--amber)'
              }} />
              {t === 'all' ? 'Todas' : t.charAt(0).toUpperCase() + t.slice(1)}
            </SidebarItem>
          ))}
        </SidebarSection>
        <SidebarSection label="Modo">
          {['all','ativa','passiva'].map(m => (
            <SidebarItem key={m} active={filters.modo === m} onClick={() => setFilters(f => ({ ...f, modo: m }))}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{
                background: m === 'all' ? 'var(--text3)' : m === 'ativa' ? 'var(--green)' : 'var(--purple)'
              }} />
              {m === 'all' ? 'Ambos' : m.charAt(0).toUpperCase() + m.slice(1)}
            </SidebarItem>
          ))}
        </SidebarSection>
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="h-[60px] flex items-center gap-2.5 px-5 flex-shrink-0"
  style={{
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg)',
    paddingLeft: isMobile ? 64 : 20,
  }}>
          <span className="font-title font-bold text-lg flex-1" style={{ color: 'var(--text)' }}>
            {VIEWS.find(v => v.id === view)?.label}
          </span>
          <GlobalSearch />
          <button className="btn-primary flex items-center gap-2" onClick={openNew}>
            <span className="text-lg leading-none">+</span> Nova prospecção
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 px-5 py-2.5 flex-shrink-0 flex-wrap" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          <span className="text-xs" style={{ color: 'var(--text3)' }}>📅 Campo:</span>
          <select className="form-input text-xs py-1 px-2" style={{ width: 'auto' }} value={dateF.field} onChange={e => setDateF(f => ({ ...f, field: e.target.value }))}>
            <option value="followup">Follow-up</option>
            <option value="pubdate">Publicação</option>
            <option value="pgto_date">Pagamento</option>
          </select>
          <span className="text-xs" style={{ color: 'var(--text3)' }}>|</span>
          {['today','week','month','overdue'].map(p => {
            const labels = { today: 'Hoje', week: 'Esta semana', month: 'Este mês', overdue: 'Atrasados' }
            return (
              <button key={p} className="text-xs px-2.5 py-1 rounded-md transition-colors" onClick={() => {
                const t = new Date(); t.setHours(0,0,0,0)
                const iso = d => d.toISOString().split('T')[0]
                if (p === 'today')   setDateF(f => ({ ...f, from: iso(t), to: iso(t) }))
                if (p === 'week')    { const e = new Date(t); e.setDate(t.getDate()+6); setDateF(f => ({ ...f, from: iso(t), to: iso(e) })) }
                if (p === 'month')   { const e = new Date(t.getFullYear(), t.getMonth()+1, 0); setDateF(f => ({ ...f, from: iso(t), to: iso(e) })) }
                if (p === 'overdue') { const y = new Date(t); y.setDate(t.getDate()-1); setDateF(f => ({ ...f, from: null, to: iso(y) })) }
              }} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text2)' }}>
                {labels[p]}
              </button>
            )
          })}
          <span className="text-xs" style={{ color: 'var(--text3)' }}>|</span>
          <span className="text-xs" style={{ color: 'var(--text3)' }}>De</span>
          <input type="date" className="form-input text-xs py-1 px-2" style={{ width: 'auto' }} value={dateF.from || ''} onChange={e => setDateF(f => ({ ...f, from: e.target.value || null }))} />
          <span className="text-xs" style={{ color: 'var(--text3)' }}>Até</span>
          <input type="date" className="form-input text-xs py-1 px-2" style={{ width: 'auto' }} value={dateF.to || ''} onChange={e => setDateF(f => ({ ...f, to: e.target.value || null }))} />
          <button className="text-xs px-2.5 py-1 rounded-md transition-colors" onClick={() => setDateF({ field: 'followup', from: null, to: null })}
            style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer' }}>✕ Limpar</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <><SkeletonStats count={5} /><SkeletonKanban cols={5} /></>
          ) : (
            <>
              {view === 'kanban'    && <ParceriasKanban   {...viewProps} />}
              {view === 'phases'   && <ParceriasFases    {...viewProps} />}
              {view === 'pipeline' && <ParceriasPipeline {...viewProps} />}
              {view === 'calendar' && <ParceriasCalendar {...viewProps} onNewItem={date => {
  setEditing(null)
  setDatePreset(date)
  setModal(true)
}} />}
              {view === 'database' && <ParceriasDatabase {...viewProps} />}
            </>
          )}
        </div>
      </div>

      <ParceriasModal
        open={modal}
        onClose={() => { setModal(false); setDatePreset(null) }}
        onSave={handleSave}
        onDelete={editing ? () => handleDelete(editing.id) : null}
        initial={editing ?? (datePreset ? { followup: datePreset } : null)}
      />
    </div>
  )
}