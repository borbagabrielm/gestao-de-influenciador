import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

const fromDB = r => ({
  id: r.id,
  slug: r.slug,
  type: r.type,
  name: r.name,
  published: r.published,
  content: r.content || {},
  updatedAt: r.updated_at,
})

const itemFromDB = r => ({
  id: r.id,
  landingPageId: r.landing_page_id,
  mediaUrl: r.media_url,
  linkUrl: r.link_url || '',
  position: r.position,
})

const testimonialFromDB = r => ({
  id: r.id,
  landingPageId: r.landing_page_id,
  avatarUrl: r.avatar_url || '',
  name: r.name,
  handle: r.handle,
  comment: r.comment,
  position: r.position,
})

const brandFromDB = r => ({
  id: r.id,
  landingPageId: r.landing_page_id,
  logoUrl: r.logo_url,
  name: r.name || '',
  linkUrl: r.link_url || '',
  position: r.position,
})

// ── helpers genéricos de reordenação (reusados por carrossel, depoimentos e marcas) ──
function usePositionedCollection(table, setState) {
  const reorder = async (items, id, direction) => {
    const sorted = [...items].sort((a, b) => a.position - b.position)
    const idx = sorted.findIndex(i => i.id === id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const a = sorted[idx], b = sorted[swapIdx]
    await Promise.all([
      supabase.from(table).update({ position: b.position }).eq('id', a.id),
      supabase.from(table).update({ position: a.position }).eq('id', b.id),
    ])
    setState(prev => prev.map(i => {
      if (i.id === a.id) return { ...i, position: b.position }
      if (i.id === b.id) return { ...i, position: a.position }
      return i
    }))
  }

  const remove = async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
    setState(prev => prev.filter(i => i.id !== id))
  }

  return { reorder, remove }
}

// Atualiza o estado local na hora (input não trava) e só grava no banco
// depois de uma pausa na digitação, juntando os campos alterados nesse meio-tempo.
function useDebouncedUpdate(table, setState) {
  const timers = useRef({})
  const pending = useRef({})

  return (id, fields, toRow) => {
    setState(prev => prev.map(i => i.id === id ? { ...i, ...fields } : i))
    pending.current[id] = { ...(pending.current[id] || {}), ...fields }
    clearTimeout(timers.current[id])
    timers.current[id] = setTimeout(() => {
      const toSave = pending.current[id]
      delete pending.current[id]
      delete timers.current[id]
      supabase.from(table).update(toRow(toSave)).eq('id', id).then(({ error }) => {
        if (error) console.error(`Erro ao salvar em ${table}:`, error)
      })
    }, 500)
  }
}

// ── Lista (tela /painel/landing-pages) ──
export function useLandingPages() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error) setPages((data || []).map(fromDB))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return { pages, loading, reload: load }
}

// ── Página única + itens de carrossel + depoimentos + marcas (tela do editor) ──
export function useLandingPage(slug) {
  const [page, setPage] = useState(null)
  const [items, setItems] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!slug) return
    setLoading(true)
    const { data: pageRow, error: pageErr } = await supabase
      .from('landing_pages').select('*').eq('slug', slug).single()
    if (!pageErr && pageRow) {
      setPage(fromDB(pageRow))
      const [{ data: itemRows }, { data: testimonialRows }, { data: brandRows }] = await Promise.all([
        supabase.from('landing_page_carousel_items').select('*')
          .eq('landing_page_id', pageRow.id).order('position', { ascending: true }),
        supabase.from('landing_page_testimonials').select('*')
          .eq('landing_page_id', pageRow.id).order('position', { ascending: true }),
        supabase.from('landing_page_brands').select('*')
          .eq('landing_page_id', pageRow.id).order('position', { ascending: true }),
      ])
      setItems((itemRows || []).map(itemFromDB))
      setTestimonials((testimonialRows || []).map(testimonialFromDB))
      setBrands((brandRows || []).map(brandFromDB))
    }
    setLoading(false)
  }, [slug])

  useEffect(() => { load() }, [load])

  const saveContent = async (content) => {
    const { error } = await supabase
      .from('landing_pages')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', page.id)
    if (error) throw error
    setPage(prev => ({ ...prev, content }))
  }

  const uploadMedia = async (file) => {
    const ext = file.name.split('.').pop()
    const path = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error } = await supabase.storage.from('landing-pages').upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('landing-pages').getPublicUrl(path)
    return data.publicUrl
  }

  // ── carrossel ──
  const itemHelpers = usePositionedCollection('landing_page_carousel_items', setItems)
  const debouncedItemUpdate = useDebouncedUpdate('landing_page_carousel_items', setItems)

  const addCarouselItem = async (mediaUrl, linkUrl) => {
    const position = items.length ? Math.max(...items.map(i => i.position)) + 1 : 0
    const { data, error } = await supabase
      .from('landing_page_carousel_items')
      .insert({ landing_page_id: page.id, media_url: mediaUrl, link_url: linkUrl || null, position })
      .select().single()
    if (error) throw error
    setItems(prev => [...prev, itemFromDB(data)])
  }

  const updateCarouselItem = (id, fields) => debouncedItemUpdate(id, fields, f => {
    const row = {}
    if (f.mediaUrl !== undefined) row.media_url = f.mediaUrl
    if (f.linkUrl !== undefined) row.link_url = f.linkUrl || null
    return row
  })

  const removeCarouselItem = itemHelpers.remove
  const reorderCarouselItem = (id, direction) => itemHelpers.reorder(items, id, direction)

  // ── depoimentos ──
  const testimonialHelpers = usePositionedCollection('landing_page_testimonials', setTestimonials)
  const debouncedTestimonialUpdate = useDebouncedUpdate('landing_page_testimonials', setTestimonials)

  const addTestimonial = async ({ avatarUrl, name, handle, comment }) => {
    const position = testimonials.length ? Math.max(...testimonials.map(t => t.position)) + 1 : 0
    const { data, error } = await supabase
      .from('landing_page_testimonials')
      .insert({ landing_page_id: page.id, avatar_url: avatarUrl || null, name, handle, comment, position })
      .select().single()
    if (error) throw error
    setTestimonials(prev => [...prev, testimonialFromDB(data)])
  }

  const updateTestimonial = (id, fields) => debouncedTestimonialUpdate(id, fields, f => {
    const row = {}
    if (f.avatarUrl !== undefined) row.avatar_url = f.avatarUrl || null
    if (f.name !== undefined) row.name = f.name
    if (f.handle !== undefined) row.handle = f.handle
    if (f.comment !== undefined) row.comment = f.comment
    return row
  })

  const removeTestimonial = testimonialHelpers.remove
  const reorderTestimonial = (id, direction) => testimonialHelpers.reorder(testimonials, id, direction)

  // ── marcas parceiras ──
  const brandHelpers = usePositionedCollection('landing_page_brands', setBrands)
  const debouncedBrandUpdate = useDebouncedUpdate('landing_page_brands', setBrands)

  const addBrand = async (logoUrl, name = '', linkUrl = '') => {
    const position = brands.length ? Math.max(...brands.map(b => b.position)) + 1 : 0
    const { data, error } = await supabase
      .from('landing_page_brands')
      .insert({ landing_page_id: page.id, logo_url: logoUrl, name, link_url: linkUrl || null, position })
      .select().single()
    if (error) throw error
    setBrands(prev => [...prev, brandFromDB(data)])
  }

  const updateBrand = (id, fields) => debouncedBrandUpdate(id, fields, f => {
    const row = {}
    if (f.logoUrl !== undefined) row.logo_url = f.logoUrl
    if (f.name !== undefined) row.name = f.name
    if (f.linkUrl !== undefined) row.link_url = f.linkUrl || null
    return row
  })

  const removeBrand = brandHelpers.remove
  const reorderBrand = (id, direction) => brandHelpers.reorder(brands, id, direction)

  return {
    page, items, testimonials, brands, loading, reload: load,
    saveContent, uploadMedia,
    addCarouselItem, updateCarouselItem, removeCarouselItem, reorderCarouselItem,
    addTestimonial, updateTestimonial, removeTestimonial, reorderTestimonial,
    addBrand, updateBrand, removeBrand, reorderBrand,
  }
}
