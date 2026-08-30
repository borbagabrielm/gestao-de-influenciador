import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const fromDB = r => ({
  id: r.id,
  category: r.category,
  label: r.label,
  value: r.value,
  position: r.position,
  importedAt: r.imported_at,
})

export function useAudienceInsights() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('audience_insights')
      .select('*')
      .order('category', { ascending: true })
      .order('position', { ascending: true })
    if (!error) setRows((data || []).map(fromDB))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // substitui todos os dados de uma categoria pelos novos importados
  const replaceCategory = async (category, items) => {
    const { error: delErr } = await supabase.from('audience_insights').delete().eq('category', category)
    if (delErr) throw delErr
    if (items.length) {
      const rowsToInsert = items.map((item, i) => ({
        category, label: item.label, value: item.value, position: i,
      }))
      const { error: insErr } = await supabase.from('audience_insights').insert(rowsToInsert)
      if (insErr) throw insErr
    }
    await load()
  }

  const byCategory = (category) => rows.filter(r => r.category === category)

  return { rows, loading, reload: load, replaceCategory, byCategory }
}
