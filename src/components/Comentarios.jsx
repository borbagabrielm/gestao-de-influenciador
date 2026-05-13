import { useState } from 'react'
import { useComentarios } from '@/hooks/useComentarios'
import { useAuth } from '@/contexts/AuthContext'

export default function Comentarios({ tipo, refId }) {
  const { user }                    = useAuth()
  const { comentarios, loading, add, remove } = useComentarios(tipo, refId)
  const [texto, setTexto]           = useState('')
  const [saving, setSaving]         = useState(false)

  const handleAdd = async () => {
    if (!texto.trim()) return
    setSaving(true)
    try {
      await add(texto.trim())
      setTexto('')
    } finally {
      setSaving(false)
    }
  }

  const fmt = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' }) + ' ' +
           d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
  }

  if (!refId) return null

  return (
    <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text3)' }}>
        💬 Comentários {comentarios.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-md text-[10px]" style={{ background: 'var(--bg3)' }}>{comentarios.length}</span>}
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-2 mb-3 max-h-64 overflow-y-auto">
        {loading && (
          <div className="space-y-2">
            {[1,2].map(i => (
              <div key={i} className="rounded-xl p-3" style={{ background: 'var(--bg3)' }}>
                <div className="skeleton rounded h-2.5 w-24 mb-2" />
                <div className="skeleton rounded h-3 w-full" />
              </div>
            ))}
          </div>
        )}
        {!loading && comentarios.length === 0 && (
          <p className="text-xs py-2" style={{ color: 'var(--text3)' }}>Nenhum comentário ainda.</p>
        )}
        {comentarios.map(c => {
          const isMe = c.user_email === user?.email
          const initials = c.user_email?.slice(0, 2).toUpperCase()
          return (
            <div key={c.id} className="rounded-xl p-3 group relative"
              style={{ background: isMe ? 'var(--accent-dk)' : 'var(--bg3)', border: `1px solid ${isMe ? 'var(--accent)30' : 'transparent'}` }}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-black flex-shrink-0"
                  style={{ background: isMe ? 'var(--accent)' : 'var(--border2)' }}>
                  {initials}
                </div>
                <span className="text-[11px] font-medium" style={{ color: 'var(--text2)' }}>
                  {c.user_email?.split('@')[0]}
                </span>
                <span className="text-[10px] ml-auto" style={{ color: 'var(--text3)' }}>{fmt(c.created_at)}</span>
                {isMe && (
                  <button
                    onClick={() => remove(c.id)}
                    className="opacity-0 group-hover:opacity-100 text-[10px] transition-opacity"
                    style={{ background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer' }}>
                    ✕
                  </button>
                )}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>{c.texto}</p>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="form-input flex-1 text-sm py-2"
          placeholder="Escreva um comentário..."
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={saving || !texto.trim()}
          className="btn-primary px-4 py-2 text-sm"
          style={{ opacity: !texto.trim() ? 0.5 : 1 }}>
          {saving ? '...' : '↑'}
        </button>
      </div>
      <p className="text-[10px] mt-1.5" style={{ color: 'var(--text3)' }}>Enter para enviar</p>
    </div>
  )
}