import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const fromDB = r => ({
  id: r.id,
  company: r.company || '',
  contact: r.contact || '',
  email: r.email || '',
  value: r.value || 0,
  finalValue: r.final_value || 0,
  tags: r.tags || [],
  modo: r.modo || null,
  phase: r.phase || 1,
  status: r.status || 'lead',
  notes: r.notes || '',
  followup: r.followup || '',
  pubdate: r.pubdate || '',
  pgtoDate: r.pgto_date || '',
  statusHistory: r.status_history || [],
  whatsapp: r.whatsapp || '',
  campanha: r.campanha || '',
})

const toDB = (d, userId) => ({
  user_id: userId,
  company: d.company,
  contact: d.contact,
  email: d.email,
  value: d.value || 0,
  final_value: d.finalValue || 0,
  tags: d.tags || [],
  modo: d.modo || null,
  phase: d.phase || 1,
  status: d.status || 'lead',
  notes: d.notes || '',
  followup: d.followup || null,
  pubdate: d.pubdate || null,
  pgto_date: d.pgtoDate || null,
  status_history: d.statusHistory || [],
  updated_at: new Date().toISOString(),
  whatsapp: d.whatsapp || '',
  campanha: d.campanha || '',
})

export function useProspects() {
  const [prospects, setProspects] = useState([])
  const [loading, setLoading]     = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setProspects((data || []).map(fromDB))
    setLoading(false)
    return error
  }, [])

  useEffect(() => { load() }, [load])

  const save = async (payload, editId) => {
    const { data: { user } } = await supabase.auth.getUser()
    const row = toDB(payload, user.id)

    if (editId) {
      const { error } = await supabase.from('prospects').update(row).eq('id', editId)
      if (error) throw error
      setProspects(prev => prev.map(p => p.id === editId ? { ...payload, id: editId } : p))
    } else {
      const { data, error } = await supabase
        .from('prospects')
        .insert({ ...row, created_at: new Date().toISOString() })
        .select().single()
      if (error) throw error
      setProspects(prev => [fromDB(data), ...prev])
    }
  }

  const remove = async (id) => {
    const { error } = await supabase.from('prospects').delete().eq('id', id)
    if (error) throw error
    setProspects(prev => prev.filter(p => p.id !== id))
  }

  return { prospects, loading, load, save, remove }
}