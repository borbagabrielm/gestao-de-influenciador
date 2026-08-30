import { useCallback, useEffect, useState } from 'react'
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

// ── Página única + itens de carrossel (tela do editor) ──
export function useLandingPage(slug) {
  const [page, setPage] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!slug) return
    setLoading(true)
    const { data: pageRow, error: pageErr } = await supabase
      .from('landing_pages').select('*').eq('slug', slug).single()
    if (!pageErr && pageRow) {
      setPage(fromDB(pageRow))
      const { data: itemRows } = await supabase
        .from('landing_page_carousel_items')
        .select('*').eq('landing_page_id', pageRow.id)
        .order('position', { ascending: true })
      setItems((itemRows || []).map(itemFromDB))
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

  const addCarouselItem = async (mediaUrl, linkUrl) => {
    const position = items.length ? Math.max(...items.map(i => i.position)) + 1 : 0
    const { data, error } = await supabase
      .from('landing_page_carousel_items')
      .insert({ landing_page_id: page.id, media_url: mediaUrl, link_url: linkUrl || null, position })
      .select().single()
    if (error) throw error
    setItems(prev => [...prev, itemFromDB(data)])
  }

  const updateCarouselItem = async (id, fields) => {
    const row = {}
    if (fields.mediaUrl !== undefined) row.media_url = fields.mediaUrl
    if (fields.linkUrl !== undefined) row.link_url = fields.linkUrl || null
    if (fields.position !== undefined) row.position = fields.position
    const { error } = await supabase.from('landing_page_carousel_items').update(row).eq('id', id)
    if (error) throw error
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...fields } : i))
  }

  const removeCarouselItem = async (id) => {
    const { error } = await supabase.from('landing_page_carousel_items').delete().eq('id', id)
    if (error) throw error
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const reorderCarouselItem = async (id, direction) => {
    const sorted = [...items].sort((a, b) => a.position - b.position)
    const idx = sorted.findIndex(i => i.id === id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const a = sorted[idx], b = sorted[swapIdx]
    await Promise.all([
      supabase.from('landing_page_carousel_items').update({ position: b.position }).eq('id', a.id),
      supabase.from('landing_page_carousel_items').update({ position: a.position }).eq('id', b.id),
    ])
    setItems(prev => prev.map(i => {
      if (i.id === a.id) return { ...i, position: b.position }
      if (i.id === b.id) return { ...i, position: a.position }
      return i
    }))
  }

  return {
    page, items, loading, reload: load,
    saveContent, uploadMedia,
    addCarouselItem, updateCarouselItem, removeCarouselItem, reorderCarouselItem,
  }
}
