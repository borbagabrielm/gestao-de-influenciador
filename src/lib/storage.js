import { supabase } from '@/lib/supabase'

// Upload genérico pro bucket público das landing pages, usado tanto pelo
// conteúdo de cada página quanto pelo pool global de depoimentos/marcas.
export async function uploadToLandingPagesBucket(file, folder) {
  const ext = file.name.split('.').pop()
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from('landing-pages').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('landing-pages').getPublicUrl(path)
  return data.publicUrl
}
