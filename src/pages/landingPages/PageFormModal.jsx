import { useState } from 'react'

export default function PageFormModal({ mode, sourcePage, onClose, onSubmit }) {
  const [slug, setSlug] = useState('')
  const [name, setName] = useState(mode === 'duplicate' ? `${sourcePage?.name || ''} (cópia)` : '')
  const [description, setDescription] = useState(mode === 'duplicate' ? (sourcePage?.description || '') : '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!slug.trim() || !name.trim()) { setError('Preencha slug e título'); return }
    setSaving(true)
    setError('')
    try {
      await onSubmit({ slug, name, description })
    } catch (err) {
      setError(err.message || 'Erro ao salvar')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="font-title font-bold text-base mb-1" style={{ color: 'var(--text)' }}>
          {mode === 'duplicate' ? `Duplicar "${sourcePage?.name}"` : 'Nova landing page'}
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--text3)' }}>
          {mode === 'duplicate'
            ? 'Cria uma cópia completa (conteúdo, carrossel, marcas e publicidades). Os depoimentos são compartilhados, não precisam ser duplicados.'
            : 'Cria uma página do tipo campanha, usando a mesma estrutura da página padrão (hero, sobre, cases, conteúdo, métricas, prova social, parceiros, contato).'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text2)' }}>Slug da URL</label>
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: 'var(--text3)' }}>/</span>
              <input className="form-input flex-1" placeholder="black-friday" value={slug}
                onChange={e => setSlug(e.target.value)} autoFocus />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text2)' }}>Título da página</label>
            <input className="form-input" placeholder="Black Friday" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text2)' }}>Descrição</label>
            <textarea className="form-input" rows={2} placeholder="Página de parceria — Black Friday"
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          {error && <p className="text-xs" style={{ color: 'var(--coral)' }}>{error}</p>}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : mode === 'duplicate' ? 'Duplicar' : 'Criar página'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
