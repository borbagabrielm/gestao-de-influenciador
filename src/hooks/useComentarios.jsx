import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function useComentarios(tipo, refId) {
  const [comentarios, setComentarios] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!refId) return
    setLoading(true)
    const { data } = await supabase
      .from("comentarios")
      .select("*")
      .eq("tipo", tipo)
      .eq("ref_id", refId)
      .order("created_at", { ascending: true })
    setComentarios(data || [])
    setLoading(false)
  }, [tipo, refId])

  useEffect(() => { load() }, [load])

  const add = async (texto) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from("comentarios")
      .insert({ tipo, ref_id: refId, user_email: user.email, texto })
      .select().single()
    if (error) throw error
    setComentarios(prev => [...prev, data])
  }

  const remove = async (id) => {
    const { error } = await supabase.from("comentarios").delete().eq("id", id)
    if (error) throw error
    setComentarios(prev => prev.filter(c => c.id !== id))
  }

  return { comentarios, loading, add, remove }
}
