import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadToLandingPagesBucket } from '@/lib/storage'

const fromDB = r => ({
  id: r.id,
  mediaUrl: r.media_url,
  linkUrl: r.link_url || '',
  category: r.category || 'Principais',
  position: r.position,
})

// Conteúdos são globais — mesmo pool usado por todas as landing pages,
// editado num só lugar (mesmo padrão de useTestimonials).
export function useContents() {
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('contents').select('*').order('position', { ascending: true })
    if (!error) setContents((data || []).map(fromDB))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const uploadMedia = (file) => uploadToLandingPagesBucket(file, 'contents')

  const add = async ({ mediaUrl, linkUrl, category }) => {
    const position = contents.length ? Math.max(...contents.map(c => c.position)) + 1 : 0
    const { data, error } = await supabase
      .from('contents')
      .insert({ media_url: mediaUrl, link_url: linkUrl || null, category: category || 'Principais', position })
      .select().single()
    if (error) throw error
    setContents(prev => [...prev, fromDB(data)])
  }

  const update = async (id, fields) => {
    const row = {}
    if (fields.mediaUrl !== undefined) row.media_url = fields.mediaUrl
    if (fields.linkUrl !== undefined) row.link_url = fields.linkUrl || null
    if (fields.category !== undefined) row.category = fields.category || 'Principais'
    if (fields.position !== undefined) row.position = fields.position
    const { error } = await supabase.from('contents').update(row).eq('id', id)
    if (error) throw error
    setContents(prev => prev.map(c => c.id === id ? { ...c, ...fields } : c))
  }

  const remove = async (id) => {
    const { error } = await supabase.from('contents').delete().eq('id', id)
    if (error) throw error
    setContents(prev => prev.filter(c => c.id !== id))
  }

  const reorder = async (id, direction) => {
    const sorted = [...contents].sort((a, b) => a.position - b.position)
    const idx = sorted.findIndex(c => c.id === id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const a = sorted[idx], b = sorted[swapIdx]
    await Promise.all([
      supabase.from('contents').update({ position: b.position }).eq('id', a.id),
      supabase.from('contents').update({ position: a.position }).eq('id', b.id),
    ])
    setContents(prev => prev.map(c => {
      if (c.id === a.id) return { ...c, position: b.position }
      if (c.id === b.id) return { ...c, position: a.position }
      return c
    }))
  }

  return { contents, loading, reload: load, uploadMedia, add, update, remove, reorder }
}
