import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const fromDB = r => ({
  id: r.id,
  titulo: r.titulo || '',
  status: r.status || 'backlog',
  data_publicacao: r.data_publicacao || '',
  rede_social: r.rede_social || '',
  formato: r.formato || '',
  tipo_conteudo: r.tipo_conteudo || '',
  legenda: r.legenda || '',
  link: r.link || '',
  observacoes: r.observacoes || '',
  responsavel: r.responsavel || '',
  campanha: r.campanha || '',
  tags: r.tags || [],
})

const toDB = (d, userId) => ({
  user_id: userId,
  titulo: d.titulo,
  status: d.status,
  data_publicacao: d.data_publicacao && d.data_publicacao !== '' ? d.data_publicacao : null,
  rede_social: d.rede_social || null,
  formato: d.formato || null,
  tipo_conteudo: d.tipo_conteudo || null,
  legenda: d.legenda || '',
  link: d.link || '',
  observacoes: d.observacoes || '',
  responsavel: d.responsavel || '',
  campanha: d.campanha || '',
  tags: d.tags || [],
  updated_at: new Date().toISOString(),
  prospect_id: d.prospect_id || null,
})

export function useConteudos() {
  const [conteudos, setConteudos] = useState([])
  const [loading, setLoading]     = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('conteudos')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setConteudos((data || []).map(fromDB))
    setLoading(false)
    return error
  }, [])

  useEffect(() => { load() }, [load])

  const save = async (payload, editId) => {
    const { data: { user } } = await supabase.auth.getUser()
    const row = toDB(payload, user.id)

    if (editId) {
      const { error } = await supabase.from('conteudos').update(row).eq('id', editId)
      if (error) throw error
      setConteudos(prev => prev.map(c => c.id === editId ? { ...payload, id: editId } : c))
    } else {
      const { data, error } = await supabase
        .from('conteudos')
        .insert({ ...row, created_at: new Date().toISOString() })
        .select().single()
      if (error) throw error
      setConteudos(prev => [fromDB(data), ...prev])
    }
  }

  const remove = async (id) => {
    const { error } = await supabase.from('conteudos').delete().eq('id', id)
    if (error) throw error
    setConteudos(prev => prev.filter(c => c.id !== id))
  }

  const updateField = async (id, fields) => {
    const { error } = await supabase
      .from('conteudos')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    setConteudos(prev => prev.map(c => c.id === id ? { ...c, ...fields } : c))
  }

  const duplicate = async (id) => {
    const original = conteudos.find(c => c.id === id)
    if (!original) return
    const { data: { user } } = await supabase.auth.getUser()
    const payload = { ...original, titulo: original.titulo + ' (cópia)', status: 'backlog', data_publicacao: '' }
    const row = toDB(payload, user.id)
    const { data, error } = await supabase
      .from('conteudos')
      .insert({ ...row, created_at: new Date().toISOString() })
      .select().single()
    if (error) throw error
    setConteudos(prev => [fromDB(data), ...prev])
  }

  return { conteudos, loading, load, save, remove, updateField, duplicate }
}