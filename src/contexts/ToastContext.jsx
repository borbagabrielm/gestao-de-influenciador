import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const toast = {
    success: msg => addToast(msg, 'success'),
    error:   msg => addToast(msg, 'error'),
    info:    msg => addToast(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl animate-slide-up"
            style={{
              background: 'var(--bg2)',
              border: `1px solid ${t.type === 'error' ? 'var(--coral)' : t.type === 'info' ? 'var(--blue)' : 'var(--accent)'}`,
              color: t.type === 'error' ? 'var(--coral)' : t.type === 'info' ? 'var(--blue)' : 'var(--accent)',
              minWidth: 260,
            }}
          >
            <span>{t.type === 'error' ? '✕' : '✓'}</span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)