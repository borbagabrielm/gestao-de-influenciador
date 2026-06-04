import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar, { SidebarSection, SidebarItem } from '@/components/Sidebar'
import MetricasDashboard from './Dashboard'
import MetricasTabela    from './Tabela'
import MetricasImportar  from './Importar'
import MetricasSeguidores from './Seguidores.jsx'
import MetricasInsights from './Insights.jsx'
import { useIsMobile } from '@/hooks/useIsMobile'
import { PLAT_COLOR, FMT_COLOR } from './shared.js'

export default function MetricasPage() {
  const [view,     setView]     = useState('dashboard')
  const [metricas, setMetricas] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [platF,    setPlatF]    = useState('all')
  const [fmtF,     setFmtF]     = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')
  const [sortCol,  setSortCol]  = useState('views')
  const [sortDir,  setSortDir]  = useState(-1)
  const [search,   setSearch]   = useState('')

  const loadMetricas = () => {
    supabase.from('metricas').select('*').order('data_ref', { ascending: false })
      .then(({ data }) => { setMetricas(data || []); setLoading(false) })
  }

  useEffect(() => { loadMetricas() }, [])

  // ── Filtros ───────────────────────────────────────────────
  const filtered = useMemo(() => metricas.filter(m => {
    if (platF !== 'all' && m.plataforma !== platF) return false
    if (fmtF  !== 'all' && (m.raw?.Tipo || m.raw?.formato || '').toLowerCase() !== fmtF) return false
    if (dateFrom && m.data_ref && m.data_ref < dateFrom) return false
    if (dateTo   && m.data_ref && m.data_ref > dateTo)   return false
    if (search) {
      const cap = (m.raw?.Caption || m.raw?.['Video Caption'] || '').toLowerCase()
      if (!cap.includes(search.toLowerCase()) && !m.post_id?.includes(search)) return false
    }
    return true
  }), [metricas, platF, fmtF, dateFrom, dateTo, search])

  // ── Totais ────────────────────────────────────────────────
  const totals = useMemo(() => {
    const sum = (key) => filtered.reduce((s, m) => s + (m[key] || 0), 0)
    const eng = filtered.length > 0
      ? filtered.reduce((s, m) => {
          const e = m.alcance > 0 ? ((m.likes + m.comentarios + m.compartilhamentos) / m.alcance) * 100 : 0
          return s + e
        }, 0) / filtered.length
      : 0
    return {
      posts: filtered.length,
      views: sum('views'), alcance: sum('alcance'),
      likes: sum('likes'), comentarios: sum('comentarios'),
      salvamentos: sum('salvamentos'), compartilhamentos: sum('compartilhamentos'),
      engajamento: eng,
    }
  }, [filtered])

  // ── Top posts ─────────────────────────────────────────────
  const topPosts = useMemo(() =>
    [...filtered].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10)
  , [filtered])

  // ── Timeline ──────────────────────────────────────────────
  const timeline = useMemo(() => {
    const byDate = {}
    filtered.forEach(m => {
      if (!m.data_ref) return
      if (!byDate[m.data_ref]) byDate[m.data_ref] = {
        data_ref: m.data_ref, views: 0, likes: 0, alcance: 0, comentarios: 0, compartilhamentos: 0
      }
      byDate[m.data_ref].views             += m.views || 0
      byDate[m.data_ref].likes             += m.likes || 0
      byDate[m.data_ref].alcance           += m.alcance || 0
      byDate[m.data_ref].comentarios       += m.comentarios || 0
      byDate[m.data_ref].compartilhamentos += m.compartilhamentos || 0
    })
    return Object.values(byDate).sort((a, b) => a.data_ref.localeCompare(b.data_ref)).slice(-30)
  }, [filtered])

  const timelineEnriched = useMemo(() =>
    timeline.map(d => ({
      ...d,
      eng: d.alcance > 0
        ? (((d.likes||0) + (d.comentarios||0) + (d.compartilhamentos||0)) / d.alcance) * 100
        : 0
    }))
  , [timeline])

  // ── Por formato ───────────────────────────────────────────
  const byFormato = useMemo(() => {
    const r = {}
    filtered.forEach(m => {
      const f = m.raw?.Tipo || m.raw?.formato || 'outro'
      if (!r[f]) r[f] = { count: 0, views: 0, likes: 0 }
      r[f].count++; r[f].views += m.views || 0; r[f].likes += m.likes || 0
    })
    return Object.entries(r).sort((a, b) => b[1].views - a[1].views)
  }, [filtered])

  // ── Tabela ordenada ───────────────────────────────────────
  const sortedTable = useMemo(() =>
    [...filtered].sort((a, b) => sortDir * ((b[sortCol] || 0) - (a[sortCol] || 0)))
  , [filtered, sortCol, sortDir])

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => -d)
    else { setSortCol(col); setSortDir(-1) }
  }

  const isMobile = useIsMobile()

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      <Sidebar title="Métricas" subtitle="M" accentColor="var(--purple)">
        <SidebarSection label="Menu">
          <SidebarItem active={view === 'dashboard'} onClick={() => setView('dashboard')}>📊 Dashboard</SidebarItem>
          <SidebarItem active={view === 'tabela'}    onClick={() => setView('tabela')}>📋 Tabela completa</SidebarItem>
          <SidebarItem active={view === 'insights'} onClick={() => setView('insights')}>🧠 Insights IA</SidebarItem>
          <SidebarItem active={view === 'seguidores'} onClick={() => setView('seguidores')}>👥 Seguidores</SidebarItem>
          <SidebarItem active={view === 'importar'}  onClick={() => setView('importar')}>📥 Importar CSV</SidebarItem>
        </SidebarSection>
        <SidebarSection label="Plataforma">
          {['all','instagram','tiktok'].map(p => (
            <SidebarItem key={p} active={platF === p} onClick={() => setPlatF(p)}>
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: p === 'all' ? 'var(--text3)' : PLAT_COLOR[p] }} />
              {p === 'all' ? 'Todas' : p === 'instagram' ? 'Instagram' : 'TikTok'}
            </SidebarItem>
          ))}
        </SidebarSection>
        <SidebarSection label="Formato">
          {['all','REELS','FEED','video'].map(f => (
            <SidebarItem key={f} active={fmtF === f} onClick={() => setFmtF(f)}>
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: f === 'all' ? 'var(--text3)' : FMT_COLOR[f] || 'var(--text3)' }} />
              {f === 'all' ? 'Todos' : f}
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
          <span className="font-title font-bold text-lg flex-1">
            {view === 'dashboard' ? 'Dashboard de Métricas' : view === 'tabela' ? 'Tabela Completa' : view === 'insights' ? 'Insights de Performance' : view === 'seguidores' ? 'Seguidores' : 'Importar CSV'}
          </span>
          {(view === 'dashboard' || view === 'tabela') && (
            <>
              <input className="form-input text-xs py-1.5 px-3" style={{ width: 180 }}
                placeholder="Buscar post..." value={search} onChange={e => setSearch(e.target.value)} />
              <input type="date" className="form-input text-xs py-1 px-2" style={{ width: 'auto' }}
                value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <span className="text-xs" style={{ color: 'var(--text3)' }}>→</span>
              <input type="date" className="form-input text-xs py-1 px-2" style={{ width: 'auto' }}
                value={dateTo} onChange={e => setDateTo(e.target.value)} />
              {(dateFrom || dateTo || search) && (
                <button className="text-xs px-2 py-1 rounded-md"
                  style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)', cursor: 'pointer' }}
                  onClick={() => { setDateFrom(''); setDateTo(''); setSearch('') }}>✕</button>
              )}
            </>
          )}
          <span className="text-xs px-2.5 py-1 rounded-md"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text3)' }}>
            {filtered.length} posts
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {view === 'dashboard' && (
            <MetricasDashboard
              totals={totals}
              timeline={timeline}
              timelineEnriched={timelineEnriched}
              byFormato={byFormato}
              topPosts={topPosts}
            />
          )}
          {view === 'tabela' && (
            <MetricasTabela
              sortedTable={sortedTable}
              sortCol={sortCol}
              sortDir={sortDir}
              onSort={handleSort}
            />
          )}

{view === 'insights' && <MetricasInsights metricas={filtered} />}
          {view === 'importar' && (
            <MetricasImportar onImportSuccess={loadMetricas} />
          )}

          {view === 'seguidores' && <MetricasSeguidores />}
        </div>
      </div>
    </div>
  )
}