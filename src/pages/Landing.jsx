import { Link } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'
import { SOCIALS, WhatsAppIcon, MailIcon, WHATSAPP_URL, EMAIL_URL } from '@/components/SocialIcons'

// Cor de destaque exclusiva desta página — sobrescreve --accent/--accent2 só
// dentro dela, sem afetar o resto do app (painel continua no verde padrão).
const HOME_ACCENT = { '--accent': '#3366FF', '--accent2': '#2451DB' }

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)', ...HOME_ACCENT }}>
      {/* Glow decorativo */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', opacity: 0.14, filter: 'blur(40px)' }} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <span className="font-title font-bold text-sm tracking-wide" style={{ color: 'var(--text)' }}>nico noal</span>
        <ThemeToggle inline />
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20 md:pt-32">
        <h1 className="font-title font-black text-4xl md:text-5xl mb-3" style={{ color: 'var(--text)' }}>
          @niconoal
        </h1>

        <p className="max-w-md text-base md:text-lg leading-relaxed mb-2" style={{ color: 'var(--text2)' }}>
          compartilhando e criando <span style={{ color: 'var(--accent)', fontWeight: 700 }}>coisas icônicas</span>
        </p>
        <p className="text-sm mb-9" style={{ color: 'var(--text3)' }}>
          📍 Porto Alegre, RS
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 w-full max-w-xs sm:max-w-none">
          <Link to="/midia-kit" className="btn-primary w-full sm:w-auto text-center" style={{ color: '#fff' }}>
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
    </div>
  )
}
