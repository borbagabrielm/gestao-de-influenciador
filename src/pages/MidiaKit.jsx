import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'
import { SOCIALS, WhatsAppIcon, MailIcon, WHATSAPP_URL, EMAIL_URL, NICO_PHOTO } from '@/components/SocialIcons'
import { fmtN, PLAT_COLOR } from '@/pages/metricas/shared.js'

const STATS_URL = 'https://rciywgiuktjipcjtmrzw.supabase.co/functions/v1/midia-kit'

function useMidiaKitStats() {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ok | error

  useEffect(() => {
    let cancelled = false
    fetch(STATS_URL)
      .then(r => { if (!r.ok) throw new Error('bad status'); return r.json() })
      .then(json => { if (!cancelled) { setData(json); setStatus('ok') } })
      .catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true }
  }, [])

  return { data, status }
}

function SectionTitle({ eyebrow, title, desc }) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--accent)' }}>
          {eyebrow}
        </span>
      )}
      <h2 className="font-title font-black text-2xl md:text-3xl mt-1.5 mb-2" style={{ color: 'var(--text)' }}>{title}</h2>
      {desc && <p className="text-sm max-w-xl" style={{ color: 'var(--text2)' }}>{desc}</p>}
    </div>
  )
}

function StatTile({ label, value, sub, color, loading }) {
  return (
    <div className="stat-card">
      <div className="text-[11px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--text3)' }}>{label}</div>
      {loading
        ? <div className="skeleton h-7 w-16 rounded" />
        : <div className="font-title font-black text-2xl" style={{ color: color || 'var(--text)' }}>{value}</div>}
      {sub && !loading && <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{sub}</div>}
    </div>
  )
}

function PlatformSection({ platform, label, handle, icon, stats, loading, error }) {
  const color = PLAT_COLOR[platform]
  const growth = stats?.growthPct30d

  return (
    <div className="rounded-2xl p-6 md:p-7" style={{ background: 'var(--bg2)', border: `1px solid ${color}30` }}>
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: `${color}1a`, color }}>
          {icon}
        </span>
        <div>
          <div className="font-title font-bold text-sm" style={{ color: 'var(--text)' }}>{label}</div>
          <div className="text-xs" style={{ color: 'var(--text3)' }}>{handle}</div>
        </div>
        <span className="ml-auto text-[10px] px-2 py-1 rounded-md" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
          últimos 90 dias
        </span>
      </div>

      {error ? (
        <div className="text-sm py-6 text-center" style={{ color: 'var(--text3)' }}>
          Estamos atualizando esses números — volte em breve 🔧
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatTile label="Seguidores" loading={loading}
            value={stats?.followers != null ? fmtN(stats.followers) : '—'}
            sub={growth != null ? `${growth >= 0 ? '↑' : '↓'} ${Math.abs(growth)}% em 30d` : null}
            color={color} />
          <StatTile label="Posts analisados" loading={loading}
            value={stats?.postsAnalyzed ?? '—'} color={color} />
          <StatTile label="Views médias" loading={loading}
            value={stats?.avgViews != null ? fmtN(stats.avgViews) : '—'} color={color} />
          <StatTile label="Engajamento médio" loading={loading}
            value={stats?.avgEngagementPct != null ? `${stats.avgEngagementPct}%` : '—'} color={color} />
          <StatTile label="Alcance total" loading={loading}
            value={stats?.totalReach ? fmtN(stats.totalReach) : (stats?.totalViews ? fmtN(stats.totalViews) : '—')} color={color} />
          <StatTile label="Melhor formato" loading={loading}
            value={stats?.topFormat?.label || '—'} color={color} />
        </div>
      )}
    </div>
  )
}

function ComingSoonCard({ icon, title, desc }) {
  return (
    <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--bg2)', border: '1px dashed var(--border2)' }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-title font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>{title}</div>
      <p className="text-xs max-w-xs mx-auto" style={{ color: 'var(--text3)' }}>{desc}</p>
      <span className="inline-block mt-3 text-[10px] px-2 py-1 rounded-md font-medium" style={{ background: 'var(--accent-dk)', color: 'var(--accent)' }}>
        Em breve
      </span>
    </div>
  )
}

export default function MidiaKitPage() {
  const { data, status } = useMidiaKitStats()
  const loading = status === 'loading'
  const error   = status === 'error'

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5 md:px-10">
        <Link to="/" className="font-title font-bold text-sm tracking-wide" style={{ color: 'var(--text)' }}>
          nico noal
        </Link>
        <ThemeToggle inline />
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-24">
        {/* Hero */}
        <div className="flex flex-col items-center text-center pt-6 pb-14">
          <img src={NICO_PHOTO} alt="Nico" className="w-20 h-20 rounded-full object-cover mb-5" style={{ border: '3px solid var(--accent)' }} />
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-3" style={{ color: 'var(--accent)' }}>
            Mídia Kit
          </span>
          <h1 className="font-title font-black text-3xl md:text-4xl mb-3" style={{ color: 'var(--text)' }}>
            comunico, crio &amp; influencio 🌐
          </h1>
          <p className="max-w-md text-base leading-relaxed" style={{ color: 'var(--text2)' }}>
            sobre duas coisas que eu amo muito: <strong style={{ color: 'var(--text)' }}>moda e criatividade</strong>
          </p>
          <div className="flex items-center gap-3 mt-6">
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150"
                style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text2)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quem é o Nico */}
        <div className="mb-14">
          <SectionTitle eyebrow="Quem é o ele" title="Autenticidade e ousadia em pessoa 🖤" />
          <div className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
            <p>Para o Nico, a vida é um palco onde cada escolha é uma chance de deixar sua marca. Com <strong style={{ color: 'var(--text)' }}>looks icônicos, humor afiado e uma energia contagiante</strong>, ele inspira todo mundo ao redor com criatividade, sempre buscando o extraordinário em tudo o que faz.</p>
            <p>Fala (muito) sobre como se <strong style={{ color: 'var(--text)' }}>expressar através da moda</strong> está para aquilo que nos faz bem. Cria conteúdos extremamente lapidados e originais, mas também surfa em trends — sempre dando seu toque — compartilhando seu lifestyle de forma a inspirar quem se conecta com essa mistura única.</p>
          </div>
        </div>

        {/* Instagram + TikTok Insights */}
        <div className="mb-14">
          <SectionTitle eyebrow="Sente o impacto" title="Performance nas redes 🔥"
            desc="Números reais, direto da base de dados da plataforma — atualizados automaticamente." />
          <div className="space-y-4">
            <PlatformSection platform="instagram" label="Instagram" handle="@niconoal" icon="📸"
              stats={data?.instagram} loading={loading} error={error} />
            <PlatformSection platform="tiktok" label="TikTok" handle="@niconoal" icon="🎵"
              stats={data?.tiktok} loading={loading} error={error} />
          </div>
        </div>

        {/* Audience Insights (preview) */}
        <div className="mb-14">
          <SectionTitle eyebrow="Quem acompanha" title="Audience Insights"
            desc="Dados demográficos da audiência — em implementação." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ComingSoonCard icon="🚻" title="Gênero" desc="Distribuição por gênero" />
            <ComingSoonCard icon="🎂" title="Faixa etária" desc="Idade predominante" />
            <ComingSoonCard icon="📍" title="Localização" desc="Principais cidades/estados" />
            <ComingSoonCard icon="💬" title="Interesses" desc="Temas de maior afinidade" />
          </div>
        </div>

        {/* Depoimentos */}
        <div className="mb-14">
          <SectionTitle eyebrow="Prova social" title="O que a comunidade diz"
            desc="Nico possui uma comunidade extremamente engajada que vibra e aprecia cada conteúdo publicado." />
          <ComingSoonCard icon="💬" title="Depoimentos" desc="Prints e comentários reais de seguidores em breve por aqui." />
        </div>

        {/* Marcas parceiras */}
        <div className="mb-16">
          <SectionTitle eyebrow="Nico e seus parceiros" title="Marcas que já colaboraram 🤝"
            desc="Não é só moda por moda ou look por look — é através de (muita) criatividade, levando inspirações para quem não liga e nem acredita nas imposições de moda por aí." />
          <ComingSoonCard icon="🏷️" title="Marcas parceiras" desc="Logos das marcas que já colaboraram com o Nico em breve por aqui." />
        </div>

        {/* CTA final */}
        <div className="rounded-3xl p-8 md:p-10 text-center" style={{ background: 'var(--bg2)', border: '1px solid var(--border2)' }}>
          <h2 className="font-title font-black text-2xl mb-2" style={{ color: 'var(--text)' }}>bora conversar? ⭐</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text2)' }}>Vamos construir uma parceria de sucesso!</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
              <WhatsAppIcon /> Chama no WhatsApp
            </a>
            <a href={EMAIL_URL} className="btn-ghost w-full sm:w-auto flex items-center justify-center gap-2">
              <MailIcon /> Manda um e-mail
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
