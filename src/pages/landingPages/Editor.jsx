import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
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

function Toggle({ checked, onChange, label, desc }) {
  return (
    <label className="flex items-center justify-between gap-4" style={{ cursor: 'pointer' }}>
      <div>
        <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</div>
        {desc && <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{desc}</div>}
      </div>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className="relative flex-shrink-0"
        style={{
          width: 40, height: 22, borderRadius: 999,
          background: checked ? 'var(--accent)' : 'var(--bg4)',
          border: '1px solid var(--border2)', cursor: 'pointer', transition: 'background 0.15s',
        }}>
        <span style={{
          position: 'absolute', top: 2, left: checked ? 20 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: checked ? '#000' : 'var(--text3)', transition: 'left 0.15s',
        }} />
      </button>
    </label>
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
    page, items, brands, loading,
    saveContent, uploadMedia,
    addCarouselItem, updateCarouselItem, removeCarouselItem, reorderCarouselItem,
    addBrand, updateBrand, removeBrand, reorderBrand,
  } = useLandingPage(slug)

  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingItems, setUploadingItems] = useState(false)
  const [uploadingBrands, setUploadingBrands] = useState(false)
  const heroFileRef = useRef(null)
  const itemsFileRef = useRef(null)
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

      {/* Métricas */}
      <div className="card">
        <div className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Métricas</div>
        <Toggle
          checked={form.metrics_comparison_enabled !== false}
          onChange={v => setField('metrics_comparison_enabled', v)}
          label="Mostrar comparativo de 30 dias"
          desc="Exibe a variação (↑/↓ %) de cada métrica em relação aos 30 dias anteriores. Desative se preferir mostrar só os números atuais."
        />
      </div>

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

      {/* Depoimentos — agora gerenciados globalmente, compartilhados entre landing pages */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Depoimentos</div>
            <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
              Compartilhados entre todas as landing pages — editados num só lugar.
            </p>
          </div>
          <Link to="/painel/landing-pages/depoimentos" className="btn-ghost">Gerenciar depoimentos →</Link>
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
