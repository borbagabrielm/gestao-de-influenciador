import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const fromDB = r => ({
  id: r.id,
  tipo: r.tipo || 'entrada',
  desc: r.descricao || '',
  valor: r.valor || 0,
  data: r.data || '',
  origem: r.origem || '',
  categoria: r.categoria || '',
  statusPgto: r.status_pgto || 'confirmado',
  tags: r.tags || [],
  notes: r.notes || '',
})

const toDB = (d, userId) => ({
  user_id: userId,
  tipo: d.tipo,
  descricao: d.desc,
  valor: d.valor || 0,
  data: d.data || null,
  origem: d.origem || '',
  categoria: d.categoria || '',
  status_pgto: d.statusPgto || 'confirmado',
  tags: d.tags || [],
  notes: d.notes || '',
  updated_at: new Date().toISOString(),
})

export function useFinanceiro() {
  const [financeiro, setFinanceiro] = useState([])
  const [loading, setLoading]       = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('financeiro')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setFinanceiro((data || []).map(fromDB))
    setLoading(false)
    return error
  }, [])

  useEffect(() => { load() }, [load])

  const save = async (payload, editId) => {
    const { data: { user } } = await supabase.auth.getUser()
    const row = toDB(payload, user.id)

    if (editId) {
      const { error } = await supabase.from('financeiro').update(row).eq('id', editId)
      if (error) throw error
      setFinanceiro(prev => prev.map(t => t.id === editId ? { ...payload, id: editId } : t))
    } else {
      const { data, error } = await supabase
        .from('financeiro')
        .insert({ ...row, created_at: new Date().toISOString() })
        .select().single()
      if (error) throw error
      setFinanceiro(prev => [fromDB(data), ...prev])
    }
  }

  const remove = async (id) => {
    const { error } = await supabase.from('financeiro').delete().eq('id', id)
    if (error) throw error
    setFinanceiro(prev => prev.filter(t => t.id !== id))
  }

  return { financeiro, loading, load, save, remove }
}