import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Sidebar, { SidebarSection, SidebarItem } from '@/components/Sidebar'
import GlobalSearch from '@/components/GlobalSearch'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useLandingPages } from '@/hooks/useLandingPages'
import LandingPagesList from './List'
import LandingPageEditor from './Editor'
import LandingPagesTestimonials from './Testimonials'

export default function LandingPagesPage() {
  const { pages, createPage, duplicatePage } = useLandingPages()
  const isMobile = useIsMobile()
  const nav = useNavigate()
  const location = useLocation()

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      <Sidebar title="Landing Pages" subtitle="L" accentColor="var(--blue)">
        <SidebarSection label="Páginas">
          {pages.map(p => (
            <SidebarItem key={p.id} active={location.pathname.endsWith(p.slug)} onClick={() => nav(`/painel/landing-pages/${p.slug}`)}>
              {p.name}
            </SidebarItem>
          ))}
        </SidebarSection>
        <SidebarSection label="Compartilhado">
          <SidebarItem active={location.pathname.endsWith('depoimentos')} onClick={() => nav('/painel/landing-pages/depoimentos')}>
            Depoimentos
          </SidebarItem>
        </SidebarSection>
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-[60px] flex items-center gap-2.5 px-5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)', paddingLeft: isMobile ? 64 : 20 }}>
          <span className="font-title font-bold text-lg flex-1">Landing Pages</span>
          <GlobalSearch />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route index element={<LandingPagesList pages={pages} createPage={createPage} duplicatePage={duplicatePage} />} />
            <Route path="depoimentos" element={<LandingPagesTestimonials />} />
            <Route path=":slug" element={<LandingPageEditor />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
