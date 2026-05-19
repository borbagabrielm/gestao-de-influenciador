import { useEffect } from 'react'

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handler = (e) => {
      // Ignora se estiver digitando em input/textarea/select
      const tag = e.target.tagName.toLowerCase()
      if (['input', 'textarea', 'select'].includes(tag)) return
      // Ignora se tiver modificador (exceto os atalhos que precisam)
      const key = e.key.toLowerCase()
      shortcuts.forEach(({ key: k, ctrl, meta, action }) => {
        if (ctrl && !e.ctrlKey) return
        if (meta && !e.metaKey) return
        if (key === k.toLowerCase()) {
          e.preventDefault()
          action()
        }
      })
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [shortcuts])
}