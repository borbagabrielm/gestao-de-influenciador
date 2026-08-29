import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'
import DailyAlerts from '@/components/DailyAlerts'
import GlobalSearch from '@/components/GlobalSearch'
import { useIsMobile } from '@/hooks/useIsMobile'

const AREAS = [
  {
    path: '/painel/parcerias',
    icon: '🤝',
    iconBg: 'var(--accent-dk)',
    title: 'Parcerias',
    desc: 'Pipeline de prospecções e negociações com marcas.',
    tags: ['Kanban', 'Pipeline', 'Calendário', 'Funil acumulado'],
  },
  {
    path: '/painel/financeiro',
    icon: '💰',
    iconBg: 'var(--teal-bg)',
    title: 'Controle Financeiro',
    desc: 'Entradas, saídas e fluxo de caixa.',
    tags: ['Dashboard', 'Extrato', 'Gráficos', 'Por categoria'],
  },
  {
    path: '/painel/conteudo',
    icon: '📅',
    iconBg: 'var(--purple-bg)',
    title: 'Gestão de Conteúdo',
    desc: 'Calendário, kanban de produção e banco de ideias.',
    tags: ['Calendário', 'Kanban', 'Banco de Ideias', 'Dashboard'],
  },
  {
  path: '/painel/metricas',
  icon: '📊',
  iconBg: 'var(--purple-bg)',
  title: 'Métricas de Performance',
  desc: 'Importe e acompanhe performance de posts do Instagram e TikTok.',
  tags: ['Instagram', 'TikTok', 'Importação CSV', 'Histórico'],
},
]

export default function HomePage() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const name     = user?.email?.split('@')[0] || ''
  const initials = user?.email?.slice(0, 2).toUpperCase() || '?'

const isMobile = useIsMobile()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <div className={`fixed top-0 right-0 z-50 flex items-center gap-3 p-4 ${isMobile ? 'left-0 justify-end' : ''}`}>
        <GlobalSearch />
        <ThemeToggle inline />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black" style={{ background: 'var(--accent)' }}>{initials}</div>
          <span className="text-xs" style={{ color: 'var(--text2)' }}>{name}</span>
          <button onClick={logout} className="text-xs ml-1 transition-colors" style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}
            onMouseEnter={e => e.target.style.color = 'var(--coral)'}
            onMouseLeave={e => e.target.style.color = 'var(--text3)'}>
            Sair
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-24">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 font-title font-black text-2xl text-black"
            style={{ background: 'var(--accent)' }}>GI</div>
          <h1 className="font-title font-black text-3xl mb-2" style={{ color: 'var(--text)' }}>Gestão de Influenciador</h1>
          <p className="text-base" style={{ color: 'var(--text2)' }}>Selecione uma área para começar</p>
        </div>

        <div className="w-full max-w-4xl">
          {/* Alertas do dia */}
          <DailyAlerts />

{/* Cards de área — todos na mesma linha */}
<div className="grid gap-5" style={{
  gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)'
}}>
  {AREAS.map(area => (
    <div key={area.path}
      onClick={() => nav(area.path)}
      className="rounded-2xl p-6 cursor-pointer transition-all duration-200"
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 20px 60px rgba(0,0,0,.3)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)';  e.currentTarget.style.transform='';               e.currentTarget.style.boxShadow='' }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5" style={{ background: area.iconBg }}>{area.icon}</div>
      <div className="font-title font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>{area.title}</div>
      <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text2)' }}>{area.desc}</p>
      <div className="flex flex-wrap gap-1.5">
        {area.tags.map(t => (
          <span key={t} className="text-[10px] px-2 py-1 rounded-md" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>{t}</span>
        ))}
      </div>
    </div>
  ))}
</div>
        </div>
      </div>
    </div>
  )
}