import { useState, useEffect } from 'react'
import { useConteudos } from '@/hooks/useConteudos'
import { useToast } from '@/contexts/ToastContext'
import Sidebar, { SidebarSection, SidebarItem } from '@/components/Sidebar'
import GlobalSearch from '@/components/GlobalSearch'
import { SkeletonKanban, SkeletonStats } from '@/components/Skeleton'
import CnCalMensal  from './CalMensal'
import CnCalSemanal from './CalSemanal'
import CnKanban     from './Kanban'
import CnBacklog    from './Backlog'
import CnDashboard  from './Dashboard'
import CnModal      from './Modal'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { CN_STATUS } from '@/lib/constants'

const VIEWS = [
  { id:'cal-mes',   label:'Cal. Mensal'   },
  { id:'cal-sem',   label:'Cal. Semanal'  },
  { id:'kanban',    label:'Kanban'        },
  { id:'backlog',   label:'Banco de Ideias'},
  { id:'dashboard', label:'Dashboard'    },
]

export default function ConteudoPage() {
  const { conteudos, loading, save, remove, updateField, duplicate } = useConteudos()
  const toast = useToast()

  const [view,     setView]     = useState('cal-mes')
  const [filters,  setFilters]  = useState({ rs: 'all', tipo: 'all' })
  const [formato,  setFormato]  = useState('all')
  const [resp,     setResp]     = useState('all')
  const [search,   setSearch]   = useState('')
  const [showAtr,  setShowAtr]  = useState(false)
  const [modal,    setModal]    = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [datePreset, setDatePreset] = useState(null)

  useKeyboardShortcuts([
  { key: 'n', action: () => openNew() },
])

  const filtered = conteudos.filter(c => {
    if (filters.rs   !== 'all' && c.rede_social   !== filters.rs)   return false
    if (filters.tipo !== 'all' && c.tipo_conteudo !== filters.tipo) return false
    if (formato !== 'all' && c.formato !== formato) return false
    if (resp    !== 'all' && c.responsavel !== resp) return false
    if (showAtr) {
      const today = new Date().toISOString().split('T')[0]
      if (!c.data_publicacao || c.status === 'publicado' || c.status === 'arquivado') return false
      if (c.data_publicacao >= today) return false
    }
    if (search && !c.titulo.toLowerCase().includes(search.toLowerCase()) &&
        !c.campanha.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const openNew  = () => { setEditing(null); setModal(true) }
  const openEdit = id => { setEditing(conteudos.find(c => c.id === id)||null); setModal(true) }

  const handleSave = async payload => {
    try {
      await save(payload, editing?.id)
      toast.success(editing ? '✓ Conteúdo atualizado' : '✓ Conteúdo criado')
      setModal(false)
    } catch(e) { toast.error('Erro: '+e.message) }
  }
  const handleDelete = async id => {
    try { await remove(id); toast.success('Conteúdo excluído'); setModal(false) }
    catch(e) { toast.error('Erro: '+e.message) }
  }
const handleDuplicate = async id => {
  try {
    const newItem = await duplicate(id)
    toast.success('Conteúdo duplicado')
    setModal(false)
    // Abre modal com o item duplicado para editar
    setTimeout(() => {
      setEditing(newItem)
      setModal(true)
    }, 300)
  } catch(e) { toast.error('Erro: '+e.message) }
}
  const handleDrop = async (id, fields) => {
    try { await updateField(id, fields) }
    catch(e) { toast.error('Erro: '+e.message) }
  }

  const RS_ITEMS = [
    { v:'all', label:'Todas', color:'var(--text3)' },
    { v:'instagram', label:'Instagram', color:'#e1306c' },
    { v:'tiktok',    label:'TikTok',    color:'#69c9d0' },
    { v:'youtube',   label:'YouTube',   color:'#ff0000' },
  ]
  const TIPO_ITEMS = [
    { v:'all',         label:'Todos',       color:'var(--text3)' },
    { v:'organico',    label:'Orgânico',    color:'var(--green)'  },
    { v:'criativo',    label:'Criativo',    color:'var(--purple)' },
    { v:'trend',       label:'Trend',       color:'var(--amber)'  },
    { v:'publicidade', label:'Publicidade', color:'var(--blue)'   },
    { v:'parceria',    label:'Parceria',    color:'var(--pink)'   },
  ]

  const viewProps = { conteudos: filtered, allConteudos: conteudos, onEdit: openEdit, onDrop: handleDrop }
  const isCalView = view === 'cal-mes' || view === 'cal-sem'

useEffect(() => {
  if (loading) return
  if (window.__openItem?.type === 'conteudo') {
    const item = conteudos.find(c => c.id === window.__openItem.id)
    if (item) { setEditing(item); setModal(true); window.__openItem = null }
  }
  const handler = (e) => {
    if (e.detail?.type === 'conteudo') {
      const item = conteudos.find(c => c.id === e.detail.id)
      if (item) { setEditing(item); setModal(true) }
    }
  }
  window.addEventListener('open-item', handler)
  return () => window.removeEventListener('open-item', handler)
}, [conteudos, loading])

const isMobile = useIsMobile()

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      <Sidebar title="Conteúdo" subtitle="C" accentColor="var(--purple)">
        <SidebarSection label="Visões">
          {VIEWS.map(v => (
            <SidebarItem key={v.id} active={view===v.id} onClick={()=>setView(v.id)}>{v.label}</SidebarItem>
          ))}
        </SidebarSection>
        <SidebarSection label="Rede Social">
          {RS_ITEMS.map(i => (
            <SidebarItem key={i.v} active={filters.rs===i.v} onClick={()=>setFilters(f=>({...f,rs:i.v}))}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: i.color }} />{i.label}
            </SidebarItem>
          ))}
        </SidebarSection>
        <SidebarSection label="Tipo">
          {TIPO_ITEMS.map(i => (
            <SidebarItem key={i.v} active={filters.tipo===i.v} onClick={()=>setFilters(f=>({...f,tipo:i.v}))}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: i.color }} />{i.label}
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
          <span className="font-title font-bold text-lg flex-1">{VIEWS.find(v=>v.id===view)?.label}</span>
          <GlobalSearch />
          <select className="form-input text-xs py-1 px-2" style={{ width:'auto' }} value={formato} onChange={e=>setFormato(e.target.value)}>
            <option value="all">Todos formatos</option>
            <option value="video">Vídeo</option>
            <option value="estatico">Estático</option>
            <option value="carrossel">Carrossel</option>
          </select>
          <select className="form-input text-xs py-1 px-2" style={{ width:'auto' }} value={resp} onChange={e=>setResp(e.target.value)}>
            <option value="all">Todos responsáveis</option>
            <option value="Nico">Nico</option>
            <option value="Gabe">Gabe</option>
            <option value="Erika">Erika</option>
          </select>
          <button className="btn-primary flex items-center gap-1.5" onClick={openNew}>+ Novo conteúdo</button>
        </div>

        {/* Cal nav / filter bar */}
        {isCalView && (
          <div className="flex items-center justify-between px-5 py-2.5 flex-shrink-0" style={{ borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
            <div id="cn-cal-controls" />
            <button
              className="text-xs px-2.5 py-1 rounded-md transition-colors"
              style={{ border: `1px solid ${showAtr?'var(--coral)':'var(--border)'}`, background: showAtr?'var(--coral-bg)':'transparent', color: showAtr?'var(--coral)':'var(--text2)', cursor:'pointer' }}
              onClick={()=>setShowAtr(a=>!a)}>
              ⚠ Atrasados
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? <><SkeletonStats count={5}/><SkeletonKanban cols={5}/></> : (
            <>
              {view==='cal-mes' && <CnCalMensal {...viewProps} onNewItem={date => {
  setEditing(null)
  setDatePreset(date)
  setModal(true)
}} />}
              {view==='cal-sem'   && <CnCalSemanal {...viewProps} />}
              {view==='kanban'    && <CnKanban     {...viewProps} />}
              {view==='backlog'   && <CnBacklog    {...viewProps} />}
              {view==='dashboard' && <CnDashboard  {...viewProps} />}
            </>
          )}
        </div>
      </div>

      <CnModal
        open={modal}
        onClose={() => { setModal(false); setDatePreset(null) }}
        onSave={handleSave}
        onDelete={editing ? () => handleDelete(editing.id) : null}
        onDuplicate={editing ? () => handleDuplicate(editing.id) : null}
        initial={editing ?? (datePreset ? { data_publicacao: datePreset } : null)}
      />
    </div>
  )
}