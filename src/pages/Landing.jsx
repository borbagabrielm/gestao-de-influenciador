import { Link } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'
import { SOCIALS, WhatsAppIcon, MailIcon, WHATSAPP_URL, EMAIL_URL, NICO_PHOTO } from '@/components/SocialIcons'

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Glow decorativo */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', opacity: 0.14, filter: 'blur(40px)' }} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <span className="font-title font-bold text-sm tracking-wide" style={{ color: 'var(--text)' }}>nico noal</span>
        <ThemeToggle inline />
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-8 pb-20 md:pt-14">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full" style={{ background: 'var(--accent)', filter: 'blur(24px)', opacity: 0.35 }} />
          <img src={NICO_PHOTO} alt="Nico"
            className="relative w-28 h-28 md:w-32 md:h-32 rounded-full object-cover"
            style={{ border: '3px solid var(--accent)' }} />
        </div>

        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-3" style={{ color: 'var(--accent)' }}>
          Criadora de conteúdo · Moda &amp; Estilo
        </span>

        <h1 className="font-title font-black text-4xl md:text-5xl mb-3" style={{ color: 'var(--text)' }}>
          oi, me chame de Nico! 🪩
        </h1>

        <p className="max-w-md text-base md:text-lg leading-relaxed mb-2" style={{ color: 'var(--text2)' }}>
          falo de moda, com (muita) criatividade 💗
        </p>
        <p className="text-sm mb-9" style={{ color: 'var(--text3)' }}>
          📍 Porto Alegre, RS
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 w-full max-w-xs sm:max-w-none">
          <Link to="/midia-kit" className="btn-primary w-full sm:w-auto text-center">
            Confira o Mídia Kit
          </Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
            className="btn-ghost w-full sm:w-auto text-center flex items-center justify-center gap-2">
            <WhatsAppIcon />
            Falar no WhatsApp
          </a>
          <a href={EMAIL_URL}
            className="btn-ghost w-full sm:w-auto text-center flex items-center justify-center gap-2">
            <MailIcon />
            E-mail
          </a>
        </div>

        {/* Redes sociais */}
        <div className="flex items-center gap-3">
          {SOCIALS.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text2)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}>
              {s.icon}
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-center pb-8">
        <Link to="/login" className="text-[11px] transition-colors" style={{ color: 'var(--text3)' }}
          onMouseEnter={e => e.target.style.color = 'var(--text2)'}
          onMouseLeave={e => e.target.style.color = 'var(--text3)'}>
          Acesso interno →
        </Link>
      </div>
    </div>
  )
}
