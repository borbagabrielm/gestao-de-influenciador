import { useEffect } from 'react'

export default function Modal({ open, onClose, title, wide, children }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={'modal-box' + (wide ? ' wide' : '')}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-title font-bold text-xl">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-colors"
            style={{ background: 'var(--bg3)', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function FormRow({ label, children, half }) {
  return (
    <div className={'mb-4' + (half ? ' flex-1' : '')}>
      <label className="block text-[11px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--text3)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export function FormGrid({ children }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}

export function ModalActions({ onClose, onDelete, saving, label }) {
  return (
    <div className="flex gap-2.5 mt-6 justify-end items-center">
      {onDelete && (
        <button className="btn-danger mr-auto" onClick={onDelete}>Excluir</button>
      )}
      <button className="btn-ghost" onClick={onClose}>Cancelar</button>
      <button className="btn-primary" disabled={saving} type="button">
        {saving ? 'Salvando...' : (label || 'Salvar')}
      </button>
    </div>
  )
}