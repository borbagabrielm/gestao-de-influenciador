import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadToLandingPagesBucket } from '@/lib/storage'

const fromDB = r => ({
  id: r.id,
  avatarUrl: r.avatar_url || '',
  name: r.name,
  handle: r.handle,
  comment: r.comment,
  position: r.position,
})

// Depoimentos são globais — compartilhados por todas as landing pages, não
// atrelados a uma página específica.
export function useTestimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('testimonials').select('*').order('position', { ascending: true })
    if (!error) setTestimonials((data || []).map(fromDB))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const uploadAvatar = (file) => uploadToLandingPagesBucket(file, 'testimonials')

  const add = async ({ avatarUrl, name, handle, comment }) => {
    const position = testimonials.length ? Math.max(...testimonials.map(t => t.position)) + 1 : 0
    const { data, error } = await supabase
      .from('testimonials')
      .insert({ avatar_url: avatarUrl || null, name, handle, comment, position })
      .select().single()
    if (error) throw error
    setTestimonials(prev => [...prev, fromDB(data)])
  }

  const update = async (id, fields) => {
    const row = {}
    if (fields.avatarUrl !== undefined) row.avatar_url = fields.avatarUrl || null
    if (fields.name !== undefined) row.name = fields.name
    if (fields.handle !== undefined) row.handle = fields.handle
    if (fields.comment !== undefined) row.comment = fields.comment
    if (fields.position !== undefined) row.position = fields.position
    const { error } = await supabase.from('testimonials').update(row).eq('id', id)
    if (error) throw error
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...fields } : t))
  }

  const remove = async (id) => {
    const { error } = await supabase.from('testimonials').delete().eq('id', id)
    if (error) throw error
    setTestimonials(prev => prev.filter(t => t.id !== id))
  }

  const reorder = async (id, direction) => {
    const sorted = [...testimonials].sort((a, b) => a.position - b.position)
    const idx = sorted.findIndex(t => t.id === id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const a = sorted[idx], b = sorted[swapIdx]
    await Promise.all([
      supabase.from('testimonials').update({ position: b.position }).eq('id', a.id),
      supabase.from('testimonials').update({ position: a.position }).eq('id', b.id),
    ])
    setTestimonials(prev => prev.map(t => {
      if (t.id === a.id) return { ...t, position: b.position }
      if (t.id === b.id) return { ...t, position: a.position }
      return t
    }))
  }

  return { testimonials, loading, reload: load, uploadAvatar, add, update, remove, reorder }
}
