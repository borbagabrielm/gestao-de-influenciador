import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLandingPage } from '@/hooks/useLandingPages'
import { useToast } from '@/contexts/ToastContext'
import { SkeletonCard } from '@/components/Skeleton'

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

export default function LandingPageEditor() {
  const { slug } = useParams()
  const toast = useToast()
  const {
    page, items, loading,
    saveContent, uploadMedia,
    addCarouselItem, updateCarouselItem, removeCarouselItem, reorderCarouselItem,
  } = useLandingPage(slug)

  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingItems, setUploadingItems] = useState(false)
  const heroFileRef = useRef(null)
  const itemsFileRef = useRef(null)

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

  const sortedItems = [...items].sort((a, b) => a.position - b.position)

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
          <input ref={itemsFileRef} type="file" accept="image/*,image/gif" multiple className="hidden" onChange={handleItemsUpload} />
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
                <img src={item.mediaUrl} alt="" className="w-10 h-14 rounded object-cover flex-shrink-0" />
                <input className="form-input flex-1 text-xs" placeholder="Link do post no Instagram (opcional)"
                  value={item.linkUrl} onChange={e => updateCarouselItem(item.id, { linkUrl: e.target.value })} />
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button className="w-7 h-7 rounded-md flex items-center justify-center" disabled={i === 0}
                    style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.4 : 1 }}
                    onClick={() => reorderCarouselItem(item.id, 'up')}>↑</button>
                  <button className="w-7 h-7 rounded-md flex items-center justify-center" disabled={i === sortedItems.length - 1}
                    style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: i === sortedItems.length - 1 ? 'default' : 'pointer', opacity: i === sortedItems.length - 1 ? 0.4 : 1 }}
                    onClick={() => reorderCarouselItem(item.id, 'down')}>↓</button>
                  <button className="w-7 h-7 rounded-md flex items-center justify-center"
                    style={{ background: 'var(--coral-bg)', border: '1px solid var(--coral)', color: 'var(--coral)', cursor: 'pointer' }}
                    onClick={() => { if (confirm('Remover este conteúdo?')) removeCarouselItem(item.id) }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
