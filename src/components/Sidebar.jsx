import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useIsMobile } from '@/hooks/useIsMobile'
import ThemeToggle from './ThemeToggle'

export default function Sidebar({ title, subtitle, accentColor, children }) {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  const initials = user?.email?.slice(0, 2).toUpperCase() || '?'
  const name     = user?.email?.split('@')[0] || ''

  const content = (
    <aside className="flex flex-col h-full" style={{
      width: isMobile ? '100%' : 224,
      background: 'var(--bg2)',
      borderRight: isMobile ? 'none' : '1px solid var(--border)',
    }}>
      {/* Logo */}
      <div className="p-5 pb-0 flex items-center gap-2.5 mb-7">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-title font-bold text-sm flex-shrink-0 text-black"
          style={{ background: accentColor || 'var(--accent)' }}>
          {subtitle?.slice(0, 1) || 'G'}
        </div>
        <div className="flex-1">
          <div className="font-title font-bold text-[13px] leading-tight" style={{ color: 'var(--text)' }}>{title}</div>
          <div className="text-[10px]" style={{ color: 'var(--text3)' }}>Gestão de Influenciador</div>
        </div>
        {isMobile && (
          <button onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 20 }}>
            ✕
          </button>
        )}
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto">{children}</div>

      {/* Bottom */}
      <div className="p-3 flex flex-col gap-2" style={{ borderTop: '1px solid var(--border)' }}>
        <ThemeToggle />
        <div className="flex items-center gap-2.5 p-2 rounded-lg" style={{ background: 'var(--bg3)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
            style={{ background: 'var(--accent)' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{name}</div>
            <div className="text-[10px] truncate" style={{ color: 'var(--text3)' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={() => { nav('/'); isMobile && setOpen(false) }}
          className="w-full py-1.5 text-[11px] rounded-lg transition-colors"
          style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text3)' }}
          onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text3)' }}>
          ← Menu principal
        </button>
        <button onClick={logout}
          className="w-full py-1.5 text-[11px] rounded-lg transition-colors"
          style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text3)' }}
          onMouseEnter={e => { e.target.style.borderColor = 'var(--coral)'; e.target.style.color = 'var(--coral)' }}
          onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text3)' }}>
          Sair da conta
        </button>
      </div>
    </aside>
  )

  if (isMobile) return (
    <>
      {/* Botão hambúrguer fixo */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', top: 12, left: 12, zIndex: 100,
          width: 40, height: 40, borderRadius: 10,
          background: 'var(--bg2)', border: '1px solid var(--border)',
          color: 'var(--text)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>
        ☰
      </button>

      {/* Drawer overlay */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        }}
          onClick={() => setOpen(false)}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 280,
            background: 'var(--bg2)',
          }}
            onClick={e => e.stopPropagation()}>
            {content}
          </div>
        </div>
      )}
    </>
  )

  return content
}

export function SidebarSection({ label, children }) {
  return (
    <div className="px-3 mb-5">
      <div className="text-[10px] font-medium tracking-widest uppercase px-2 mb-1" style={{ color: 'var(--text3)' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

export function SidebarItem({ active, onClick, icon, children }) {
  return (
    <div className={'sidebar-nav-item' + (active ? ' active' : '')} onClick={onClick}>
      {icon && <span className="w-4 h-4 flex-shrink-0 opacity-70">{icon}</span>}
      {children}
    </div>
  )
}