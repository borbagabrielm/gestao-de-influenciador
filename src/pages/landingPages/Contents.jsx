import { useRef, useState } from 'react'
import { useContents } from '@/hooks/useContents'
import { useToast } from '@/contexts/ToastContext'
import { isVideoUrl } from '@/lib/media'

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

export default function LandingPagesContents() {
  const toast = useToast()
  const { contents, loading, uploadMedia, add, update, remove, reorder } = useContents()
  const [newCategory, setNewCategory] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const sorted = [...contents].sort((a, b) => a.position - b.position)
  const knownCategories = [...new Set(contents.map(c => c.category).filter(c => c && c !== 'Principais'))]

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      for (const file of files) {
        const url = await uploadMedia(file)
        await add({ mediaUrl: url, linkUrl: '', category: newCategory.trim() || 'Principais' })
      }
      toast.success(`✓ ${files.length} conteúdo(s) adicionado(s)`)
    } catch (err) { toast.error('Erro no upload: ' + err.message) }
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <div className="font-title font-bold text-lg" style={{ color: 'var(--text)' }}>Conteúdos</div>
        <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
          Pool compartilhado entre todas as landing pages — organize por categoria pra alimentar os carrosséis (ex: o "se joga aqui!" do mídia kit).
        </p>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-xs" style={{ color: 'var(--text3)' }}>Carregando...</p>
        ) : sorted.length === 0 ? (
          <p className="text-xs mb-4" style={{ color: 'var(--text3)' }}>Nenhum conteúdo adicionado ainda.</p>
        ) : (
          <div className="space-y-2.5 mb-4">
            {sorted.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'var(--bg3)' }}>
                {isVideoUrl(c.mediaUrl)
                  ? <video src={c.mediaUrl} className="w-10 h-14 rounded object-cover flex-shrink-0" muted loop autoPlay playsInline />
                  : <img src={c.mediaUrl} alt="" className="w-10 h-14 rounded object-cover flex-shrink-0" />}
                <input className="form-input text-xs" style={{ width: 130 }} placeholder="Categoria" list="content-categories"
                  value={c.category} onChange={e => update(c.id, { category: e.target.value })} />
                <input className="form-input flex-1 text-xs" placeholder="Link do post (opcional)"
                  value={c.linkUrl} onChange={e => update(c.id, { linkUrl: e.target.value })} />
                <ReorderButtons index={i} total={sorted.length} confirmLabel="Remover este conteúdo?"
                  onUp={() => reorder(c.id, 'up')}
                  onDown={() => reorder(c.id, 'down')}
                  onRemove={() => remove(c.id)} />
              </div>
            ))}
          </div>
        )}

        <datalist id="content-categories">
          {knownCategories.map(cat => <option key={cat} value={cat} />)}
        </datalist>

        <div className="p-3 rounded-lg space-y-2.5" style={{ border: '1px dashed var(--border2)' }}>
          <div className="text-xs font-medium" style={{ color: 'var(--text2)' }}>Adicionar conteúdo(s)</div>
          <input className="form-input text-xs" placeholder="Categoria (ex: Looks, Bastidores...)" list="content-categories"
            value={newCategory} onChange={e => setNewCategory(e.target.value)} />
          <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm" multiple className="hidden" onChange={handleUpload} />
          <button className="btn-ghost" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? 'Enviando...' : '+ Escolher arquivo(s)'}
          </button>
          <p className="text-[11px]" style={{ color: 'var(--text3)' }}>
            A categoria acima é aplicada a todos os arquivos enviados nesse lote — dá pra editar cada um depois na lista.
          </p>
        </div>
      </div>
    </div>
  )
}
