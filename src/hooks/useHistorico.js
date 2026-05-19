import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useHistorico(tipo, refId) {
  const [historico, setHistorico] = useState([])
  const [loading, setLoading]     = useState(true)

  const load = useCallback(async () => {
    if (!refId) return
    setLoading(true)
    const { data } = await supabase
      .from('historico_alteracoes')
      .select('*')
      .eq('tipo', tipo)
      .eq('ref_id', refId)
      .order('created_at', { ascending: false })
    setHistorico(data || [])
    setLoading(false)
  }, [tipo, refId])

  useEffect(() => { load() }, [load])

  const registrar = async (campo, valorAnterior, valorNovo) => {
    if (valorAnterior === valorNovo) return
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('historico_alteracoes').insert({
      tipo,
      ref_id: refId,
      user_email: user.email,
      campo,
      valor_anterior: String(valorAnterior || ''),
      valor_novo: String(valorNovo || ''),
    })
    load()
  }

  return { historico, loading, registrar }
}