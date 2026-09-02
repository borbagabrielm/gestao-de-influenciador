import { useRef, useState } from 'react'
import { useTestimonials } from '@/hooks/useTestimonials'
import { useToast } from '@/contexts/ToastContext'

function ReorderButtons({ index, total, onUp, onDown, onRemove, confirmLabel }) {
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <button className="w-7 h-7 rounded-md flex items-center justify-center" disabled={index === 0}
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.4 : 1 }}
        onClick={onUp}>↑</button>
      <button className="w-7 h-7 rounded-md flex items-center justify-center" disabled={index === total - 1}
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: index === total - 1 ? 'default' : 'pointer', opacity: index === total - 1 ? 0.4 : 1 }}
        onClick={onDown}>↓</button>
      <button className="w-7 h-7 rounded-md flex items-center justify-center"
        style={{ background: 'var(--coral-bg)', border: '1px solid var(--coral)', color: 'var(--coral)', cursor: 'pointer' }}
        onClick={() => { if (confirm(confirmLabel)) onRemove() }}>✕</button>
    </div>
  )
}

export default function LandingPagesTestimonials() {
  const toast = useToast()
  const { testimonials, loading, uploadAvatar, add, update, remove, reorder } = useTestimonials()
  const [newTestimonial, setNewTestimonial] = useState({ avatarUrl: '', name: '', handle: '', comment: '' })
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [adding, setAdding] = useState(false)
  const avatarFileRef = useRef(null)

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const url = await uploadAvatar(file)
      setNewTestimonial(prev => ({ ...prev, avatarUrl: url }))
    } catch (err) { toast.error('Erro no upload: ' + err.message) }
    setUploadingAvatar(false)
    e.target.value = ''
  }

  const handleAdd = async () => {
    if (!newTestimonial.name || !newTestimonial.handle || !newTestimonial.comment) {
      toast.error('Preencha nome, @ e comentário')
      return
    }
    setAdding(true)
    try {
      await add(newTestimonial)
      setNewTestimonial({ avatarUrl: '', name: '', handle: '', comment: '' })
      toast.success('✓ Depoimento adicionado')
    } catch (err) { toast.error('Erro: ' + err.message) }
    setAdding(false)
  }

  const sorted = [...testimonials].sort((a, b) => a.position - b.position)

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <div className="font-title font-bold text-lg" style={{ color: 'var(--text)' }}>Depoimentos</div>
        <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
          Pool compartilhado entre todas as landing pages — editar aqui reflete em qualquer página que exiba depoimentos.
        </p>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-xs" style={{ color: 'var(--text3)' }}>Carregando...</p>
        ) : sorted.length === 0 ? (
          <p className="text-xs mb-4" style={{ color: 'var(--text3)' }}>Nenhum depoimento adicionado ainda.</p>
        ) : (
          <div className="space-y-2.5 mb-4">
            {sorted.map((t, i) => (
              <div key={t.id} className="flex items-start gap-3 p-2.5 rounded-lg" style={{ background: 'var(--bg3)' }}>
                {t.avatarUrl
                  ? <img src={t.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5" />
                  : <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>{t.name.slice(0, 1).toUpperCase()}</div>}
                <div className="flex-1 grid gap-1.5" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <input className="form-input text-xs" placeholder="Nome" value={t.name} onChange={e => update(t.id, { name: e.target.value })} />
                  <input className="form-input text-xs" placeholder="usuario (sem @)" value={t.handle} onChange={e => update(t.id, { handle: e.target.value })} />
                  <textarea className="form-input text-xs" style={{ gridColumn: '1 / -1' }} rows={2} placeholder="Comentário"
                    value={t.comment} onChange={e => update(t.id, { comment: e.target.value })} />
                </div>
                <ReorderButtons index={i} total={sorted.length} confirmLabel="Remover este depoimento?"
                  onUp={() => reorder(t.id, 'up')}
                  onDown={() => reorder(t.id, 'down')}
                  onRemove={() => remove(t.id)} />
              </div>
            ))}
          </div>
        )}

        <div className="p-3 rounded-lg space-y-2.5" style={{ border: '1px dashed var(--border2)' }}>
          <div className="text-xs font-medium" style={{ color: 'var(--text2)' }}>Novo depoimento</div>
          <div className="flex items-center gap-3">
            {newTestimonial.avatarUrl
              ? <img src={newTestimonial.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              : <div className="w-9 h-9 rounded-full flex-shrink-0" style={{ background: 'var(--bg4)' }} />}
            <input ref={avatarFileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <button className="btn-ghost" onClick={() => avatarFileRef.current?.click()} disabled={uploadingAvatar}>
              {uploadingAvatar ? 'Enviando...' : 'Foto (opcional)'}
            </button>
          </div>
          <div className="grid gap-2.5" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <input className="form-input text-xs" placeholder="Nome" value={newTestimonial.name}
              onChange={e => setNewTestimonial(prev => ({ ...prev, name: e.target.value }))} />
            <input className="form-input text-xs" placeholder="usuario (sem @)" value={newTestimonial.handle}
              onChange={e => setNewTestimonial(prev => ({ ...prev, handle: e.target.value }))} />
          </div>
          <textarea className="form-input text-xs" rows={2} placeholder="Comentário" value={newTestimonial.comment}
            onChange={e => setNewTestimonial(prev => ({ ...prev, comment: e.target.value }))} />
          <button className="btn-ghost" onClick={handleAdd} disabled={adding}>
            {adding ? 'Adicionando...' : '+ Adicionar depoimento'}
          </button>
        </div>
      </div>
    </div>
  )
}
