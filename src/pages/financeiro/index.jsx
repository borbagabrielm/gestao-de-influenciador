import { useState, useEffect } from 'react'
import { useFinanceiro } from '@/hooks/useFinanceiro'
import { useToast } from '@/contexts/ToastContext'
import Sidebar, { SidebarSection, SidebarItem } from '@/components/Sidebar'
import GlobalSearch from '@/components/GlobalSearch'
import { SkeletonStats, SkeletonTable } from '@/components/Skeleton'
import FinDashboard from './Dashboard'
import FinExtrato   from './Extrato'
import FinTabela    from './Tabela'
import FinModal     from './Modal'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { F_STATUS } from '@/lib/constants'

const VIEWS = [
  { id: 'dashboard', label: 'Dashboard'  },
  { id: 'extrato',   label: 'Extrato'    },
  { id: 'entradas',  label: 'Entradas'   },
  { id: 'saidas',    label: 'Saídas'     },
]

export default function FinanceiroPage() {
  const { financeiro, loading, save, remove } = useFinanceiro()
  const toast = useToast()

  const [view,    setView]    = useState('dashboard')
  const [filters, setFilters] = useState({ tipo: 'all', periodo: 'all' })
  const [dateF,   setDateF]   = useState({ from: null, to: null })
  const [search,  setSearch]  = useState('')
  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [tipoNew, setTipoNew] = useState('entrada')

  useKeyboardShortcuts([
  { key: 'e', action: () => openNew('entrada') },
  { key: 's', action: () => openNew('saida') },
])

  const today    = new Date()
  const isoToday = today.toISOString().split('T')[0]

  const filtered = financeiro.filter(t => {
    if (filters.tipo !== 'all' && t.tipo !== filters.tipo) return false
    if (filters.periodo === 'mes') {
      const s = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-01`
      const e = new Date(today.getFullYear(), today.getMonth()+1, 0).toISOString().split('T')[0]
      if (t.data < s || t.data > e) return false
    } else if (filters.periodo === 'trim') {
      const q = Math.floor(today.getMonth()/3)
      const s = new Date(today.getFullYear(), q*3, 1).toISOString().split('T')[0]
      const e = new Date(today.getFullYear(), q*3+3, 0).toISOString().split('T')[0]
      if (t.data < s || t.data > e) return false
    } else if (filters.periodo === 'ano') {
      if (!t.data.startsWith(today.getFullYear()+'')) return false
    }
    if (dateF.from && t.data < dateF.from) return false
    if (dateF.to   && t.data > dateF.to)   return false
    if (search && !t.desc.toLowerCase().includes(search.toLowerCase()) &&
        !t.origem.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const openNew  = tipo => { setTipoNew(tipo); setEditing(null); setModal(true) }
  const openEdit = id  => { setEditing(financeiro.find(t => t.id === id) || null); setModal(true) }

  const handleSave = async payload => {
    try {
      await save(payload, editing?.id)
      toast.success(editing ? '✓ Transação atualizada' : '✓ Transação criada')
      setModal(false)
    } catch(e) { toast.error('Erro: ' + e.message) }
  }
  const handleDelete = async id => {
    try { await remove(id); toast.success('Transação excluída'); setModal(false) }
    catch(e) { toast.error('Erro: ' + e.message) }
  }

  const viewProps = { financeiro: filtered, allFinanceiro: financeiro, onEdit: openEdit }

useEffect(() => {
  if (loading) return
  if (window.__openItem?.type === 'financeiro') {
    const item = financeiro.find(t => t.id === window.__openItem.id)
    if (item) { setEditing(item); setModal(true); window.__openItem = null }
  }
  const handler = (e) => {
    if (e.detail?.type === 'financeiro') {
      const item = financeiro.find(t => t.id === e.detail.id)
      if (item) { setEditing(item); setModal(true) }
    }
  }
  window.addEventListener('open-item', handler)
  return () => window.removeEventListener('open-item', handler)
}, [financeiro, loading])

const isMobile = useIsMobile()

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      <Sidebar title="Financeiro" subtitle="F" accentColor="var(--teal)">
        <SidebarSection label="Visões">
          {VIEWS.map(v => (
            <SidebarItem key={v.id} active={view === v.id} onClick={() => setView(v.id)}>{v.label}</SidebarItem>
          ))}
        </SidebarSection>
        <SidebarSection label="Período">
          {[['all','Todos'],['mes','Este mês'],['trim','Trimestre'],['ano','Este ano']].map(([k,l]) => (
            <SidebarItem key={k} active={filters.periodo === k} onClick={() => setFilters(f => ({ ...f, periodo: k }))}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: k==='all'?'var(--text3)':k==='mes'?'var(--teal)':k==='trim'?'var(--purple)':'var(--amber)' }} />
              {l}
            </SidebarItem>
          ))}
        </SidebarSection>
        <SidebarSection label="Tipo">
          {[['all','Todos'],['entrada','Entradas'],['saida','Saídas']].map(([k,l]) => (
            <SidebarItem key={k} active={filters.tipo === k} onClick={() => setFilters(f => ({ ...f, tipo: k }))}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: k==='all'?'var(--text3)':k==='entrada'?'var(--green)':'var(--coral)' }} />
              {l}
            </SidebarItem>
          ))}
        </SidebarSection>
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-[60px] flex items-center gap-2.5 px-5 flex-shrink-0"
  style={{
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg)',
    paddingLeft: isMobile ? 64 : 20,
  }}>
          <span className="font-title font-bold text-lg flex-1">{VIEWS.find(v=>v.id===view)?.label}</span>
          <GlobalSearch />
          <button className="btn-new flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg"
            onClick={() => openNew('entrada')}
            style={{ background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid rgba(74,222,128,.3)', cursor:'pointer' }}>
            + Entrada
          </button>
          <button className="btn-new flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg"
            onClick={() => openNew('saida')}
            style={{ background: 'var(--coral-bg)', color: 'var(--coral)', border: '1px solid rgba(248,113,113,.3)', cursor:'pointer' }}>
            + Saída
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 px-5 py-2.5 flex-shrink-0 flex-wrap" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          {['today','week','month','year'].map(p => {
            const labels = { today:'Hoje', week:'Esta semana', month:'Este mês', year:'Este ano' }
            return (
              <button key={p} className="text-xs px-2.5 py-1 rounded-md"
                style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer' }}
                onClick={() => {
                  const t = new Date(); t.setHours(0,0,0,0)
                  const iso = d => d.toISOString().split('T')[0]
                  if (p==='today')  setDateF({ from: iso(t), to: iso(t) })
                  if (p==='week')   { const e=new Date(t);e.setDate(t.getDate()+6); setDateF({ from: iso(t), to: iso(e) }) }
                  if (p==='month')  { const e=new Date(t.getFullYear(),t.getMonth()+1,0); setDateF({ from: iso(t), to: iso(e) }) }
                  if (p==='year')   setDateF({ from: t.getFullYear()+'-01-01', to: t.getFullYear()+'-12-31' })
                }}>
                {labels[p]}
              </button>
            )
          })}
          <span className="text-xs" style={{ color: 'var(--text3)' }}>|</span>
          <span className="text-xs" style={{ color: 'var(--text3)' }}>De</span>
          <input type="date" className="form-input text-xs py-1 px-2" style={{ width: 'auto' }} value={dateF.from||''} onChange={e => setDateF(f=>({...f,from:e.target.value||null}))} />
          <span className="text-xs" style={{ color: 'var(--text3)' }}>Até</span>
          <input type="date" className="form-input text-xs py-1 px-2" style={{ width: 'auto' }} value={dateF.to||''} onChange={e => setDateF(f=>({...f,to:e.target.value||null}))} />
          <button className="text-xs px-2.5 py-1 rounded-md" style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer' }}
            onClick={() => setDateF({ from: null, to: null })}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? <><SkeletonStats count={4} /><SkeletonTable /></> : (
            <>
              {view === 'dashboard' && <FinDashboard {...viewProps} />}
              {view === 'extrato'   && <FinExtrato   {...viewProps} />}
              {view === 'entradas'  && <FinTabela tipo="entrada" {...viewProps} />}
              {view === 'saidas'    && <FinTabela tipo="saida"   {...viewProps} />}
            </>
          )}
        </div>
      </div>

      <FinModal
        open={modal}
        onClose={() => setModal(false)}
        onSave={handleSave}
        onDelete={editing ? () => handleDelete(editing.id) : null}
        initial={editing}
        tipoInicial={tipoNew}
      />
    </div>
  )
}