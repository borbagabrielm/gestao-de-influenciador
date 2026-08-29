import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function GlobalSearch({ onOpenItem }) {
  const [open,    setOpen]    = useState(false)
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)
  const nav = useNavigate()

  useEffect(() => {
    const handler = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(o => !o) }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    else { setQuery(''); setResults([]); setSelected(0) }
  }, [open])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      const q = query.toLowerCase()
      const [p, f, c] = await Promise.all([
        supabase.from('prospects').select('id,company,status,phase').ilike('company', `%${q}%`).limit(4),
        supabase.from('financeiro').select('id,descricao,tipo,valor').ilike('descricao', `%${q}%`).limit(4),
        supabase.from('conteudos').select('id,titulo,status,rede_social').ilike('titulo', `%${q}%`).limit(4),
      ])
      const all = [
        ...(p.data || []).map(r => ({ ...r, _type: 'parceria',   _label: r.company,   _sub: r.status,   _path: '/painel/parcerias'  })),
        ...(f.data || []).map(r => ({ ...r, _type: 'financeiro', _label: r.descricao, _sub: r.tipo + ' · R$' + Number(r.valor).toLocaleString('pt-BR'), _path: '/painel/financeiro' })),
        ...(c.data || []).map(r => ({ ...r, _type: 'conteudo',   _label: r.titulo,    _sub: r.rede_social || r.status, _path: '/painel/conteudo' })),
      ]
      setResults(all)
      setSelected(0)
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Navegação por teclado
  useEffect(() => {
    if (!open) return
    const handler = e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && results[selected]) { go(results[selected]) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, results, selected])

  const go = item => {
    nav(item._path)
    setOpen(false)
    // Passa o item para abrir o modal após navegar
    setTimeout(() => {
      window.__openItem = { type: item._type, id: item.id }
      window.dispatchEvent(new CustomEvent('open-item', { detail: { type: item._type, id: item.id } }))
    }, 150)
  }

  const typeIcon  = { parceria: '🤝', financeiro: '💰', conteudo: '📅' }
  const typeLabel = { parceria: 'Parceria', financeiro: 'Financeiro', conteudo: 'Conteúdo' }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text3)', cursor: 'pointer', minWidth: 180 }}>
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"/></svg>
      <span>Buscar</span>
      <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>⌘K</kbd>
    </button>
  )

  return (
    <div className="fixed inset-0 z-[9998] flex items-start justify-center pt-24"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border2)' }}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'var(--text3)', flexShrink: 0 }}><path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"/></svg>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar em parcerias, financeiro, conteúdo..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text)', border: 'none' }} />
          {loading && <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border2)', borderTopColor: 'var(--accent)' }} />}
          <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>Esc</kbd>
        </div>

        {results.length > 0 && (
          <div className="py-1 max-h-80 overflow-y-auto">
            {results.map((r, i) => (
              <div key={r.id + r._type}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                style={{ background: i === selected ? 'var(--bg3)' : 'transparent', color: 'var(--text)' }}
                onClick={() => go(r)}
                onMouseEnter={() => setSelected(i)}>
                <span className="text-base">{typeIcon[r._type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{r._label}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--text3)' }}>{typeLabel[r._type]} · {r._sub}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md flex-shrink-0"
                  style={{ background: 'var(--bg4)', color: 'var(--text3)' }}>↵ abrir</span>
              </div>
            ))}
          </div>
        )}
        {query && !loading && results.length === 0 && (
          <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text3)' }}>
            Nenhum resultado para "{query}"
          </div>
        )}
        {!query && (
          <div className="px-4 py-4">
            <div className="text-xs mb-2" style={{ color: 'var(--text3)' }}>Atalhos de teclado</div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                ['N', 'Nova parceria / conteúdo'],
                ['E', 'Nova entrada financeira'],
                ['S', 'Nova saída financeira'],
                ['⌘K', 'Busca global'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text3)' }}>
                  <kbd className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>{key}</kbd>
                  {desc}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}