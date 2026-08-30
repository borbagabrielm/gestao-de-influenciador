import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLandingPage } from '@/hooks/useLandingPages'
import { useToast } from '@/contexts/ToastContext'
import { SkeletonCard } from '@/components/Skeleton'
import { isVideoUrl } from '@/lib/media'

const SECTIONS = [
  {
    label: 'Hero',
    fields: [
      ['hero_eyebrow', 'Categoria (acima do título)'],
      ['hero_line1', 'Título — linha 1'],
      ['hero_line2', 'Título — linha 2'],
      ['hero_line3', 'Título — linha 3'],
      ['hero_caption', 'Legenda', 'textarea'],
    ],
  },
  {
    label: 'Sobre',
    fields: [
      ['sobre_eyebrow', 'Categoria'],
      ['sobre_title', 'Título'],
      ['sobre_paragraph_1', 'Parágrafo 1', 'textarea'],
      ['sobre_paragraph_2', 'Parágrafo 2', 'textarea'],
    ],
  },
  {
    label: 'Contato',
    fields: [
      ['contact_title', 'Título da chamada final'],
      ['contact_subtitle', 'Subtítulo'],
      ['whatsapp_url', 'Link do WhatsApp'],
      ['email', 'E-mail'],
    ],
  },
]

function Field({ label, value, onChange, type }) {
  return (
    <div>
      <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text2)' }}>{label}</label>
      {type === 'textarea' ? (
        <textarea className="form-input" rows={3} value={value} onChange={e => onChange(e.target.value)} />
      ) : (
        <input className="form-input" value={value} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  )
}

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

export default function LandingPageEditor() {
  const { slug } = useParams()
  const toast = useToast()
  const {
    page, items, testimonials, brands, loading,
    saveContent, uploadMedia,
    addCarouselItem, updateCarouselItem, removeCarouselItem, reorderCarouselItem,
    addTestimonial, updateTestimonial, removeTestimonial, reorderTestimonial,
    addBrand, updateBrand, removeBrand, reorderBrand,
  } = useLandingPage(slug)

  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingItems, setUploadingItems] = useState(false)
  const [newTestimonial, setNewTestimonial] = useState({ avatarUrl: '', name: '', handle: '', comment: '' })
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [addingTestimonial, setAddingTestimonial] = useState(false)
  const [uploadingBrands, setUploadingBrands] = useState(false)
  const heroFileRef = useRef(null)
  const itemsFileRef = useRef(null)
  const avatarFileRef = useRef(null)
  const brandsFileRef = useRef(null)

  useEffect(() => { if (page) setForm(page.content) }, [page])

  if (loading || !form) return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
      <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
    </div>
  )

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveContent(form)
      toast.success('✓ Alterações salvas')
    } catch (e) { toast.error('Erro ao salvar: ' + e.message) }
    setSaving(false)
  }

  const handleHeroUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingHero(true)
    try {
      const url = await uploadMedia(file)
      setField('hero_photo_url', url)
      toast.success('✓ Foto enviada — clique em Salvar para aplicar')
    } catch (err) { toast.error('Erro no upload: ' + err.message) }
    setUploadingHero(false)
    e.target.value = ''
  }

  const handleItemsUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploadingItems(true)
    try {
      for (const file of files) {
        const url = await uploadMedia(file)
        await addCarouselItem(url, '')
      }
      toast.success(`✓ ${files.length} conteúdo(s) adicionado(s)`)
    } catch (err) { toast.error('Erro no upload: ' + err.message) }
    setUploadingItems(false)
    e.target.value = ''
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const url = await uploadMedia(file)
      setNewTestimonial(prev => ({ ...prev, avatarUrl: url }))
    } catch (err) { toast.error('Erro no upload: ' + err.message) }
    setUploadingAvatar(false)
    e.target.value = ''
  }

  const handleAddTestimonial = async () => {
    if (!newTestimonial.name || !newTestimonial.handle || !newTestimonial.comment) {
      toast.error('Preencha nome, @ e comentário')
      return
    }
    setAddingTestimonial(true)
    try {
      await addTestimonial(newTestimonial)
      setNewTestimonial({ avatarUrl: '', name: '', handle: '', comment: '' })
      toast.success('✓ Depoimento adicionado')
    } catch (err) { toast.error('Erro: ' + err.message) }
    setAddingTestimonial(false)
  }

  const handleBrandsUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploadingBrands(true)
    try {
      for (const file of files) {
        const url = await uploadMedia(file)
        await addBrand(url, '', '')
      }
      toast.success(`✓ ${files.length} marca(s) adicionada(s)`)
    } catch (err) { toast.error('Erro no upload: ' + err.message) }
    setUploadingBrands(false)
    e.target.value = ''
  }

  const sortedItems = [...items].sort((a, b) => a.position - b.position)
  const sortedTestimonials = [...testimonials].sort((a, b) => a.position - b.position)
  const sortedBrands = [...brands].sort((a, b) => a.position - b.position)

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-title font-bold text-lg" style={{ color: 'var(--text)' }}>{page?.name}</div>
          <div className="text-xs" style={{ color: 'var(--text3)' }}>/{slug}</div>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>

      {/* Foto do hero */}
      <div className="card">
        <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Foto do hero</div>
        <div className="flex items-center gap-4">
          {form.hero_photo_url && (
            <img src={form.hero_photo_url} alt="" className="w-20 h-24 rounded-lg object-cover flex-shrink-0" style={{ border: '1px solid var(--border)' }} />
          )}
          <div className="flex-1">
            <input ref={heroFileRef} type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} />
            <button className="btn-ghost" onClick={() => heroFileRef.current?.click()} disabled={uploadingHero}>
              {uploadingHero ? 'Enviando...' : 'Trocar foto'}
            </button>
          </div>
        </div>
      </div>

      {SECTIONS.map(section => (
        <div key={section.label} className="card space-y-4">
          <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{section.label}</div>
          {section.fields.map(([key, label, type]) => (
            <Field key={key} label={label} type={type} value={form[key] || ''} onChange={v => setField(key, v)} />
          ))}
        </div>
      ))}

      {/* Carrossel de conteúdos */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Carrossel de conteúdos ({sortedItems.length})</div>
          <input ref={itemsFileRef} type="file" accept="image/*,video/mp4,video/webm" multiple className="hidden" onChange={handleItemsUpload} />
          <button className="btn-ghost" onClick={() => itemsFileRef.current?.click()} disabled={uploadingItems}>
            {uploadingItems ? 'Enviando...' : '+ Adicionar conteúdo(s)'}
          </button>
        </div>

        {sortedItems.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--text3)' }}>Nenhum conteúdo adicionado ainda.</p>
        ) : (
          <div className="space-y-2.5">
            {sortedItems.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'var(--bg3)' }}>
                {isVideoUrl(item.mediaUrl)
                  ? <video src={item.mediaUrl} className="w-10 h-14 rounded object-cover flex-shrink-0" muted loop autoPlay playsInline />
                  : <img src={item.mediaUrl} alt="" className="w-10 h-14 rounded object-cover flex-shrink-0" />}
                <input className="form-input flex-1 text-xs" placeholder="Link do post no Instagram (opcional)"
                  value={item.linkUrl} onChange={e => updateCarouselItem(item.id, { linkUrl: e.target.value })} />
                <ReorderButtons index={i} total={sortedItems.length} confirmLabel="Remover este conteúdo?"
                  onUp={() => reorderCarouselItem(item.id, 'up')}
                  onDown={() => reorderCarouselItem(item.id, 'down')}
                  onRemove={() => removeCarouselItem(item.id)} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Depoimentos */}
      <div className="card">
        <div className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Depoimentos ({sortedTestimonials.length})</div>

        {sortedTestimonials.length > 0 && (
          <div className="space-y-2.5 mb-4">
            {sortedTestimonials.map((t, i) => (
              <div key={t.id} className="flex items-start gap-3 p-2.5 rounded-lg" style={{ background: 'var(--bg3)' }}>
                {t.avatarUrl
                  ? <img src={t.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5" />
                  : <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>{t.name.slice(0, 1).toUpperCase()}</div>}
                <div className="flex-1 grid gap-1.5" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <input className="form-input text-xs" placeholder="Nome" value={t.name} onChange={e => updateTestimonial(t.id, { name: e.target.value })} />
                  <input className="form-input text-xs" placeholder="usuario (sem @)" value={t.handle} onChange={e => updateTestimonial(t.id, { handle: e.target.value })} />
                  <textarea className="form-input text-xs" style={{ gridColumn: '1 / -1' }} rows={2} placeholder="Comentário"
                    value={t.comment} onChange={e => updateTestimonial(t.id, { comment: e.target.value })} />
                </div>
                <ReorderButtons index={i} total={sortedTestimonials.length} confirmLabel="Remover este depoimento?"
                  onUp={() => reorderTestimonial(t.id, 'up')}
                  onDown={() => reorderTestimonial(t.id, 'down')}
                  onRemove={() => removeTestimonial(t.id)} />
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
          <button className="btn-ghost" onClick={handleAddTestimonial} disabled={addingTestimonial}>
            {addingTestimonial ? 'Adicionando...' : '+ Adicionar depoimento'}
          </button>
        </div>
      </div>

      {/* Marcas parceiras */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Marcas parceiras ({sortedBrands.length})</div>
          <input ref={brandsFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleBrandsUpload} />
          <button className="btn-ghost" onClick={() => brandsFileRef.current?.click()} disabled={uploadingBrands}>
            {uploadingBrands ? 'Enviando...' : '+ Adicionar logo(s)'}
          </button>
        </div>

        {sortedBrands.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--text3)' }}>Nenhuma marca adicionada ainda.</p>
        ) : (
          <div className="space-y-2.5">
            {sortedBrands.map((b, i) => (
              <div key={b.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'var(--bg3)' }}>
                <img src={b.logoUrl} alt="" className="w-14 h-10 rounded object-contain flex-shrink-0 p-1" style={{ background: 'var(--bg2)' }} />
                <input className="form-input text-xs" style={{ width: 140 }} placeholder="Nome da marca"
                  value={b.name} onChange={e => updateBrand(b.id, { name: e.target.value })} />
                <input className="form-input flex-1 text-xs" placeholder="Link do site/Instagram (opcional)"
                  value={b.linkUrl} onChange={e => updateBrand(b.id, { linkUrl: e.target.value })} />
                <ReorderButtons index={i} total={sortedBrands.length} confirmLabel="Remover esta marca?"
                  onUp={() => reorderBrand(b.id, 'up')}
                  onDown={() => reorderBrand(b.id, 'down')}
                  onRemove={() => removeBrand(b.id)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
