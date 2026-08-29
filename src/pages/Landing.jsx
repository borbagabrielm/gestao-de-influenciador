import { Link } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'

const WHATSAPP_URL = 'https://api.whatsapp.com/send?phone=5551981494510&text=Oi%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20para%20uma%20parceria%20com%20o%20Nico'
const EMAIL_URL     = 'mailto:oi@niconoal.com.br'
const NICO_PHOTO     = 'https://rciywgiuktjipcjtmrzw.supabase.co/storage/v1/object/public/avatars/nico.jpg'

const SOCIALS = [
  {
    label: 'Instagram',
    href: 'http://instagram.com/niconoal',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@niconoal',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.6 5.82a4.28 4.28 0 0 1-3.14-1.4v9.9a4.9 4.9 0 1 1-4.9-4.9c.16 0 .32.01.48.03v2.5a2.4 2.4 0 1 0 1.9 2.35V2h2.53a4.28 4.28 0 0 0 4.13 4.1v2.5c-.35.02-.7.02-1-.03z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/nicolasmachadoblog?sub_confirmation=1',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.6 7.6a2.9 2.9 0 0 0-2.05-2.06C17.8 5 12 5 12 5s-5.8 0-7.55.54A2.9 2.9 0 0 0 2.4 7.6 30.2 30.2 0 0 0 1.9 12a30.2 30.2 0 0 0 .5 4.4 2.9 2.9 0 0 0 2.05 2.06C6.2 19 12 19 12 19s5.8 0 7.55-.54a2.9 2.9 0 0 0 2.05-2.06 30.2 30.2 0 0 0 .5-4.4 30.2 30.2 0 0 0-.5-4.4ZM9.9 15.1V8.9l5.4 3.1-5.4 3.1Z" />
      </svg>
    ),
  },
]

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
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-10 w-full max-w-xs sm:max-w-none">
          <Link to="/midia-kit" className="btn-primary w-full sm:w-auto text-center">
            Confira o Mídia Kit
          </Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
            className="btn-ghost w-full sm:w-auto text-center flex items-center justify-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.63 15.02L2 22l5.12-1.34A10 10 0 1 0 12 2Zm0 18.1a8.09 8.09 0 0 1-4.13-1.13l-.3-.18-3.05.8.81-2.97-.19-.31A8.1 8.1 0 1 1 12 20.1Zm4.44-6.07c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.44-.59 1.64-1.15.2-.57.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28Z" />
            </svg>
            Falar no WhatsApp
          </a>
          <a href={EMAIL_URL}
            className="btn-ghost w-full sm:w-auto text-center flex items-center justify-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="m4 7 8 6 8-6" />
            </svg>
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
