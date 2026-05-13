import Papa from 'papaparse'
import { fmtN, PLAT_COLOR, parseInstagram, parseTikTok, detectPlataforma } from './shared'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useState } from 'react'

export default function MetricasImportar({ onImportSuccess }) {
  const toast = useToast()
  const [file,      setFile]      = useState(null)
  const [preview,   setPreview]   = useState([])
  const [plat,      setPlat]      = useState(null)
  const [importing, setImporting] = useState(false)
  const [result,    setResult]    = useState(null)

  const handleFile = (e) => {
    const f = e.target.files[0]; if (!f) return
    setFile(f); setResult(null)
    Papa.parse(f, {
      header: true, skipEmptyLines: true,
      complete: ({ data }) => {
        const headers = Object.keys(data[0] || {})
        const p = detectPlataforma(headers)
        setPlat(p)
        const parsed = p === 'tiktok' ? parseTikTok(data) : p === 'instagram' ? parseInstagram(data) : []
        setPreview(parsed.slice(0, 5))
      }
    })
  }

  const handleImport = async () => {
    if (!file || !plat) return
    setImporting(true)
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: async ({ data }) => {
        const rows = plat === 'tiktok' ? parseTikTok(data) : parseInstagram(data)
        let inseridos = 0, atualizados = 0, erros = 0
        for (const row of rows) {
          try {
            const { data: existingList } = await supabase
              .from('metricas').select('id')
              .eq('plataforma', row.plataforma).eq('post_id', row.post_id).limit(1)
            const existing = existingList?.[0] || null
            if (existing) {
              await supabase.from('metricas').update({
                views: row.views, plays: row.plays, likes: row.likes,
                comentarios: row.comentarios, compartilhamentos: row.compartilhamentos,
                salvamentos: row.salvamentos, alcance: row.alcance,
                raw: row.raw, updated_at: new Date().toISOString(),
              }).eq('id', existing.id)
              atualizados++
            } else {
              await supabase.from('metricas').insert({
                plataforma: row.plataforma, post_id: row.post_id, data_ref: row.data_ref,
                views: row.views, plays: row.plays, likes: row.likes,
                comentarios: row.comentarios, compartilhamentos: row.compartilhamentos,
                salvamentos: row.salvamentos, alcance: row.alcance, impressoes: row.impressoes,
                raw: row.raw, updated_at: new Date().toISOString(),
              })
              inseridos++
            }
          } catch(e) { erros++ }
        }
        const res = { inseridos, atualizados, erros, total: rows.length }
        setResult(res)
        setImporting(false)
        if (erros === 0) {
          toast.success(`✓ ${inseridos} inseridos, ${atualizados} atualizados`)
          onImportSuccess?.()
        } else {
          toast.error(`${erros} erros durante a importação`)
        }
      }
    })
  }

  const reset = () => { setFile(null); setPreview([]); setPlat(null); setResult(null) }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Upload area */}
      <div className="rounded-2xl p-8 text-center mb-6"
        style={{ background: 'var(--bg2)', border: '2px dashed var(--border2)' }}>
        <div className="text-4xl mb-3">📂</div>
        <div className="font-title font-bold text-lg mb-1" style={{ color: 'var(--text)' }}>
          Arraste ou selecione um CSV
        </div>
        <p className="text-sm mb-5" style={{ color: 'var(--text3)' }}>
          Suporta exportações do Instagram e TikTok
        </p>
        <label className="btn-primary cursor-pointer px-6 py-2.5">
          Selecionar arquivo
          <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
        </label>
        {file && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{file.name}</span>
            {plat
              ? <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: PLAT_COLOR[plat]+'22', color: PLAT_COLOR[plat] }}>
                  {plat === 'instagram' ? '📸 Instagram' : '🎵 TikTok'}
                </span>
              : <span className="text-xs" style={{ color: 'var(--coral)' }}>Formato não reconhecido</span>
            }
          </div>
        )}
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="rounded-xl overflow-hidden mb-6" style={{ border: '1px solid var(--border)' }}>
          <div className="px-4 py-3" style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm font-medium">Preview — primeiros {preview.length} registros</span>
          </div>
          {preview.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 text-xs flex-wrap"
              style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: 'var(--bg2)' }}>
              <span className="font-medium truncate flex-1" style={{ color: 'var(--text)', maxWidth: 200 }}>
                {r.caption?.slice(0, 50) || r.post_id}
              </span>
              <span style={{ color: 'var(--text3)' }}>{r.data_ref}</span>
              <span style={{ color: 'var(--accent)' }}>👁 {fmtN(r.views)}</span>
              <span style={{ color: 'var(--coral)' }}>❤️ {fmtN(r.likes)}</span>
              <span style={{ color: 'var(--teal)' }}>📡 {fmtN(r.alcance)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className="rounded-xl p-5 mb-6 grid grid-cols-4 gap-3"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          {[
            { label: 'Total',       val: result.total,       color: 'var(--text)'   },
            { label: 'Inseridos',   val: result.inseridos,   color: 'var(--green)'  },
            { label: 'Atualizados', val: result.atualizados, color: 'var(--accent)' },
            { label: 'Erros',       val: result.erros,       color: result.erros > 0 ? 'var(--coral)' : 'var(--text3)' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-title font-bold text-2xl" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[11px] mt-1" style={{ color: 'var(--text3)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {file && plat && !result && (
        <button className="btn-primary w-full py-3 text-base font-semibold"
          disabled={importing} onClick={handleImport}>
          {importing ? 'Importando...' : `Importar ${plat === 'instagram' ? '📸 Instagram' : '🎵 TikTok'}`}
        </button>
      )}
      {result && (
        <button className="btn-ghost w-full py-3" onClick={reset}>
          Importar outro arquivo
        </button>
      )}
    </div>
  )
}