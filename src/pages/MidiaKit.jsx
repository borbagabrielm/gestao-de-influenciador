import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './MidiaKit.css'
import { useLandingPage } from '@/hooks/useLandingPages'
import { SOCIALS, WhatsAppIcon, MailIcon } from '@/components/SocialIcons'
import { fmtN, PLAT_COLOR } from '@/pages/metricas/shared.js'
import { isVideoUrl } from '@/lib/media'

const STATS_URL = 'https://rciywgiuktjipcjtmrzw.supabase.co/functions/v1/midia-kit'
const MIN_FOR_LOOP = 4

function MediaThumb({ src, alt, className }) {
  return isVideoUrl(src)
    ? <video className={className} src={src} muted loop playsInline preload="metadata" />
    : <img className={className} src={src} alt={alt} loading="lazy" />
}

// Só toca os vídeos do carrossel que estão realmente visíveis dentro da
// faixa mascarada — evita dezenas de vídeos decodificando ao mesmo tempo.
function useLazyCarouselVideos(deps) {
  useEffect(() => {
    if (!window.IntersectionObserver) return
    const observers = []
    document.querySelectorAll('.mk-carousel-viewport').forEach(viewport => {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const video = entry.target.querySelector('video')
          if (!video) return
          if (entry.isIntersecting) video.play().catch(() => {})
          else video.pause()
        })
      }, { root: viewport, rootMargin: '0px 40px' })
      viewport.querySelectorAll('.mk-car-item').forEach(item => io.observe(item))
      observers.push(io)
    })
    return () => observers.forEach(io => io.disconnect())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

const DEFAULT_CONTENT = {
  hero_eyebrow: 'criadora de conteúdo · moda & estilo',
  hero_line1: 'COMUNICO.',
  hero_line2: 'CRIO.',
  hero_line3: 'INFLUENCIO.',
  hero_caption: 'sobre duas coisas que eu amo muito: moda e criatividade — porto alegre, rs',
  hero_photo_url: 'https://rciywgiuktjipcjtmrzw.supabase.co/storage/v1/object/public/avatars/nico.jpg',
  sobre_eyebrow: 'Quem é o ele',
  sobre_title: 'Autenticidade e ousadia em pessoa',
  sobre_paragraph_1: 'Para o Nico, a vida é um palco onde cada escolha é uma chance de deixar sua marca. Com looks icônicos, humor afiado e uma energia contagiante, ele inspira todo mundo ao redor com criatividade, sempre buscando o extraordinário em tudo o que faz.',
  sobre_paragraph_2: 'Fala (muito) sobre como se expressar através da moda está para aquilo que nos faz bem. Cria conteúdos extremamente lapidados e originais, mas também surfa em trends — sempre dando seu toque — compartilhando seu lifestyle de forma a inspirar quem se conecta com essa mistura única.',
  contact_title: 'bora conversar?',
  contact_subtitle: 'Vamos construir uma parceria de sucesso.',
  whatsapp_url: 'https://api.whatsapp.com/send?phone=5551981494510&text=Oi%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20para%20uma%20parceria%20com%20o%20Nico',
  email: 'oi@niconoal.com.br',
  metrics_comparison_enabled: true,
}

function useMidiaKitStats() {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')

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

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const els = document.querySelectorAll('.mk-reveal')
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
      }, { threshold: 0.12 })
      els.forEach(el => io.observe(el))
      return () => io.disconnect()
    }
    els.forEach(el => el.classList.add('in'))
  }, [])
  return ref
}

function growthLabel(pct) {
  if (pct == null) return null
  const dir = pct >= 0 ? 'up' : 'down'
  return { text: `${pct >= 0 ? '↑' : '↓'} ${Math.abs(pct)}% em 30d`, dir }
}

function StatTile({ value, label, growthPct, loading, showComparison }) {
  const growth = showComparison ? growthLabel(growthPct) : null
  return (
    <div className="mk-pstat">
      <span className={`num${loading ? ' mk-skel' : ''}`}>{loading ? '—' : value}</span>
      <span className="lbl">{label}</span>
      {growth && !loading && <span className={`sub ${growth.dir}`}>{growth.text}</span>}
    </div>
  )
}

function PlatformBlock({ platform, label, handle, icon, stats, loading, error, showComparison }) {
  const cls = platform === 'instagram' ? 'ig' : 'tt'
  return (
    <div className={`mk-platform ${cls}`}>
      <div className="mk-platform-head">
        <div className={`bar ${cls}`} />
        <div className="mk-platform-icon">{icon}</div>
        <div>
          <div className="mk-platform-name">{label}</div>
          <div className="mk-platform-handle mk-mono">{handle}</div>
        </div>
        <div className="mk-platform-period mk-eyebrow">últimos 30 dias</div>
      </div>
      {error ? (
        <div style={{ padding: 24, textAlign: 'center', fontSize: '0.85rem', color: 'var(--mk-ink-dim)' }}>
          Estamos atualizando esses números — volte em breve
        </div>
      ) : (
        <div className="mk-platform-stats">
          <StatTile loading={loading} showComparison={showComparison} value={stats?.followers != null ? fmtN(stats.followers) : '—'} label="Seguidores"
            growthPct={stats?.growthPct30d} />
          <StatTile loading={loading} showComparison={showComparison} value={stats?.avgEngagementPct != null ? `${stats.avgEngagementPct}%` : '—'} label="Engajamento médio"
            growthPct={stats?.avgEngagementGrowthPct30d} />
          <StatTile loading={loading} showComparison={showComparison} value={stats?.avgViews != null ? fmtN(stats.avgViews) : '—'} label="Views médias"
            growthPct={stats?.avgViewsGrowthPct30d} />
          <StatTile loading={loading} showComparison={showComparison} value={stats?.postsAnalyzed ?? '—'} label="Posts analisados"
            growthPct={stats?.postsAnalyzedGrowthPct30d} />
          <StatTile loading={loading} showComparison={showComparison} value={stats?.totalReach ? fmtN(stats.totalReach) : (stats?.totalViews ? fmtN(stats.totalViews) : '—')} label="Alcance total"
            growthPct={stats?.totalReachGrowthPct30d} />
          <StatTile loading={loading} value={stats?.topFormat?.label?.toUpperCase() || '—'} label="Melhor formato" />
        </div>
      )}
    </div>
  )
}

function ComingSoonCard({ icon, title, desc }) {
  return (
    <div className="mk-cs-card">
      <div className="mk-cs-icon-wrap">{icon}</div>
      <div className="mk-cs-title">{title}</div>
      <div className="mk-cs-desc">{desc}</div>
      <span className="mk-cs-tag">Em breve</span>
    </div>
  )
}

function BauhausDots() {
  return (
    <div className="mk-bauhaus-dots">
      <div className="mk-bh-dot" /><div className="mk-bh-dot pinch" /><div className="mk-bh-dot" />
    </div>
  )
}

export default function MidiaKitPage() {
  const { page, items, testimonials, brands, loading: pageLoading } = useLandingPage('midia-kit')
  const { data: stats, status } = useMidiaKitStats()
  const statsLoading = status === 'loading'
  const statsError = status === 'error'
  useReveal()

  const c = page?.content && Object.keys(page.content).length ? page.content : DEFAULT_CONTENT
  const loopsCarousel = items.length >= MIN_FOR_LOOP
  const carouselItems = loopsCarousel ? [...items, ...items] : items
  const loopsTestimonials = testimonials.length >= MIN_FOR_LOOP
  const testimonialItems = loopsTestimonials ? [...testimonials, ...testimonials] : testimonials
  const loopsBrands = brands.length >= MIN_FOR_LOOP
  const brandItems = loopsBrands ? [...brands, ...brands] : brands

  useLazyCarouselVideos([carouselItems.length])

  return (
    <div className="midia-kit">
      <div className="mk-masthead">
        <Link to="/" className="mk-wordmark">NICO&nbsp;NOAL</Link>
        <div className="mk-masthead-right">
          <div className="mk-swatches"><span className="mk-swatch blue" /><span className="mk-swatch red" /><span className="mk-swatch mustard" /></div>
          <div className="mk-masthead-meta">
            <div className="l1 mk-mono">MÍDIA&nbsp;KIT</div>
            <div className="l2 mk-mono">ED.&nbsp;2026&nbsp;·&nbsp;POA/RS</div>
          </div>
        </div>
      </div>
      <div className="mk-rule" />
      <div className="mk-index-strip mk-mono">
        <span><b>01</b> SOBRE</span>
        <span><b>02</b> INSTAGRAM</span>
        <span><b>03</b> TIKTOK</span>
        <span><b>04</b> AUDIÊNCIA</span>
        <span><b>05</b> PROVA&nbsp;SOCIAL</span>
        <span><b>06</b> PARCEIROS</span>
        <span><b>07</b> CONTATO</span>
      </div>
      <div className="mk-rule" />

      {/* HERO */}
      <div className="mk-hero">
        <div className="mk-shell">
          <div className="mk-hero-grid">
            <div className="mk-hero-copy">
              <span className="mk-eyebrow mk-hero-tag">{c.hero_eyebrow}</span>
              <div className="mk-hero-stack">
                <h1 className="w">{c.hero_line1}</h1>
                <h1 className="w blur-echo">{c.hero_line2}</h1>
                <h1 className="w accent">{c.hero_line3}</h1>
              </div>
              <p className="mk-hero-caption mk-mono">{c.hero_caption}</p>
              <div className="mk-annot mk-mono">(role para ver os números) ↓</div>
            </div>
            <div className="mk-hero-photo-wrap">
              <div className="mk-hero-orb-accent" aria-hidden="true" />
              {c.hero_photo_url ? (
                <div className="mk-photo-slot dark has-image">
                  <img src={c.hero_photo_url} alt="Retrato do Nico" />
                  <span className="mk-cm tl" /><span className="mk-cm tr" /><span className="mk-cm bl" /><span className="mk-cm br" />
                </div>
              ) : (
                <div className="mk-photo-slot dark">
                  <span className="mk-cm tl" /><span className="mk-cm tr" /><span className="mk-cm bl" /><span className="mk-cm br" />
                  <span className="ps-label mk-mono">FOTO — NICO</span>
                </div>
              )}
              <div className="mk-photo-caption mk-mono">FOTO — NICO</div>
            </div>
          </div>
        </div>
        <div className="mk-hero-vert mk-mono">MÍDIA KIT · 2026</div>
      </div>

      {/* 01 SOBRE */}
      <div className="mk-section on-paper mk-reveal">
        <div className="mk-shell">
          <div className="mk-section-head">
            <div className="mk-section-num">01</div>
            <div>
              <span className="mk-eyebrow">{c.sobre_eyebrow}</span>
              <h2 className="mk-section-title">{c.sobre_title}</h2>
            </div>
          </div>
          <div className="mk-sobre-body">
            <p>{c.sobre_paragraph_1}</p>
            <p>{c.sobre_paragraph_2}</p>
          </div>

          {items.length > 0 ? (
            <div className="mk-carousel-wrap">
              <span className="mk-eyebrow mk-carousel-label">Alguns conteúdos</span>
              <div className="mk-carousel-viewport">
                <div className={`mk-carousel${loopsCarousel ? '' : ' no-loop'}`}>
                  {carouselItems.map((item, i) => (
                    <a key={item.id + '-' + i} className="mk-car-item" href={item.linkUrl || undefined}
                      target={item.linkUrl ? '_blank' : undefined} rel="noreferrer">
                      <MediaThumb src={item.mediaUrl} alt={`Conteúdo ${i + 1}`} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : !pageLoading && (
            <div className="mk-carousel-wrap">
              <span className="mk-eyebrow mk-carousel-label">Alguns conteúdos</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--mk-ink-dim)' }}>
                Nenhum conteúdo adicionado ainda — adicione pelo painel em Landing Pages → Mídia Kit.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mk-rule" />

      {/* 02/03 INSIGHTS */}
      <div className="mk-section on-dark mk-reveal">
        <div className="mk-shell">
          <div className="mk-section-head">
            <div className="mk-section-num">02</div>
            <div>
              <span className="mk-eyebrow">Sente o impacto</span>
              <h2 className="mk-section-title">Performance nas redes</h2>
              <p className="mk-section-desc">Números reais, direto da base de dados da plataforma — atualizados automaticamente.</p>
            </div>
          </div>
          <PlatformBlock platform="instagram" label="Instagram" handle="@niconoal" icon="📸" stats={stats?.instagram} loading={statsLoading} error={statsError} showComparison={c.metrics_comparison_enabled !== false} />
          <PlatformBlock platform="tiktok" label="TikTok" handle="@niconoal" icon="🎵" stats={stats?.tiktok} loading={statsLoading} error={statsError} showComparison={c.metrics_comparison_enabled !== false} />
        </div>
      </div>

      <div className="mk-rule" />

      {/* 04 AUDIENCIA */}
      <div className="mk-section on-paper mk-reveal">
        <div className="mk-shell">
          <div className="mk-section-head">
            <div className="mk-section-num">04</div>
            <div>
              <span className="mk-eyebrow">Quem acompanha</span>
              <h2 className="mk-section-title">Audience Insights</h2>
              <p className="mk-section-desc">Dados demográficos da audiência — em implementação.</p>
            </div>
          </div>
          <div className="mk-cs-grid">
            <ComingSoonCard icon={<BauhausDots />} title="Gênero" desc="Distribuição por gênero" />
            <ComingSoonCard icon={<BauhausDots />} title="Faixa etária" desc="Idade predominante" />
            <ComingSoonCard icon={<BauhausDots />} title="Localização" desc="Principais cidades/estados" />
            <ComingSoonCard icon={<BauhausDots />} title="Interesses" desc="Temas de maior afinidade" />
          </div>
        </div>
      </div>

      <div className="mk-rule" />

      {/* 05 PROVA SOCIAL */}
      <div className="mk-section on-paper-2 mk-reveal">
        <div className="mk-shell">
          <div className="mk-section-head">
            <div className="mk-section-num">05</div>
            <div>
              <span className="mk-eyebrow">Prova social</span>
              <h2 className="mk-section-title">O que a comunidade diz</h2>
              <p className="mk-section-desc">Nico possui uma comunidade extremamente engajada que vibra e aprecia cada conteúdo publicado.</p>
            </div>
          </div>
          {testimonials.length > 0 ? (
            <div className="mk-carousel-viewport">
              <div className={`mk-carousel${loopsTestimonials ? '' : ' no-loop'}`}>
                {testimonialItems.map((t, i) => (
                  <div key={t.id + '-' + i} className="mk-testimonial-card">
                    <div className="mk-testimonial-head">
                      {t.avatarUrl ? (
                        <img className="mk-testimonial-avatar" src={t.avatarUrl} alt={t.name} />
                      ) : (
                        <div className="mk-testimonial-avatar mk-testimonial-initial">{t.name.slice(0, 1).toUpperCase()}</div>
                      )}
                      <div className="mk-testimonial-name-row">
                        <div>
                          <div className="mk-testimonial-name">{t.name}</div>
                          <div className="mk-testimonial-handle mk-mono">@{t.handle}</div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flexShrink: 0, opacity: 0.5 }}>
                          <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
                        </svg>
                      </div>
                    </div>
                    <p className="mk-testimonial-comment">{t.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : !pageLoading && (
            <p style={{ fontSize: '0.85rem', color: 'var(--mk-ink-dim)', textAlign: 'center' }}>
              Nenhum depoimento adicionado ainda — adicione pelo painel em Landing Pages → Mídia Kit.
            </p>
          )}
        </div>
      </div>

      <div className="mk-rule" />

      {/* 06 PARCEIROS */}
      <div className="mk-section on-paper mk-reveal">
        <div className="mk-shell">
          <div className="mk-section-head">
            <div className="mk-section-num">06</div>
            <div>
              <span className="mk-eyebrow">Nico e seus parceiros</span>
              <h2 className="mk-section-title">Marcas que já colaboraram</h2>
              <p className="mk-section-desc">Não é só moda por moda ou look por look — é através de (muita) criatividade, levando inspirações para quem não liga e nem acredita nas imposições de moda por aí.</p>
            </div>
          </div>
          {brands.length > 0 ? (
            <div className="mk-carousel-viewport">
              <div className={`mk-carousel${loopsBrands ? '' : ' no-loop'}`}>
                {brandItems.map((b, i) => (
                  <a key={b.id + '-' + i} className="mk-brand-item" href={b.linkUrl || undefined}
                    target={b.linkUrl ? '_blank' : undefined} rel="noreferrer" aria-label={b.name || 'Marca parceira'}>
                    <div className="mk-brand-logo" role="img" aria-label={b.name || 'Marca parceira'}
                      style={{ WebkitMaskImage: `url(${b.logoUrl})`, maskImage: `url(${b.logoUrl})` }} />
                  </a>
                ))}
              </div>
            </div>
          ) : !pageLoading && (
            <p style={{ fontSize: '0.85rem', color: 'var(--mk-ink-dim)', textAlign: 'center' }}>
              Nenhuma marca adicionada ainda — adicione pelo painel em Landing Pages → Mídia Kit.
            </p>
          )}
        </div>
      </div>

      {/* 07 CONTATO */}
      <div className="mk-section mk-contact mk-reveal">
        <div className="mk-shell">
          <span className="mk-eyebrow" style={{ color: 'var(--mk-chrome-1)' }}>07 · Contato</span>
          <h2 className="mk-contact-stack" style={{ marginTop: 14 }}>{c.contact_title}</h2>
          <p className="mk-contact-sub">{c.contact_subtitle}</p>
          <div className="mk-cta-row">
            <a className="mk-btn mk-btn-solid" href={c.whatsapp_url} target="_blank" rel="noreferrer">
              <WhatsAppIcon /> Chama no WhatsApp
            </a>
            <a className="mk-btn mk-btn-outline" href={`mailto:${c.email}`}>
              <MailIcon /> Manda um e-mail
            </a>
          </div>
          <div className="mk-foot-meta mk-mono">
            {SOCIALS.map(s => <a key={s.label} href={s.href} target="_blank" rel="noreferrer">{s.label.toUpperCase()}</a>)}
            <span>NICO NOAL © 2026</span>
          </div>
        </div>
      </div>
    </div>
  )
}
