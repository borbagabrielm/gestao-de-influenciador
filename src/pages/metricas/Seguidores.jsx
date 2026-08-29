import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { fmtN, fmtDate, PLAT_COLOR } from './shared.js'

const PLATS = ['instagram', 'tiktok']

function SparkGrowth({ data, color }) {
  if (data.length < 2) return null
  const vals  = data.map(d => d.quantidade)
  const max   = Math.max(...vals, 1)
  const min   = Math.min(...vals, 0)
  const range = max - min || 1
  const W = 200, H = 48, PAD = 4
  const pts = data.map((d, i) => {
    const x = PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2)
    const y = H - PAD - ((d.quantidade - min) / range) * (H - PAD * 2)
    return [x, y]
  })
  const pathD = pts.map((p, i) => `${i===0?'M':'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const areaD = [
    `M${pts[0][0].toFixed(1)},${H}`,
    ...pts.map(p => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`),
    `L${pts[pts.length-1][0].toFixed(1)},${H} Z`
  ].join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 48 }}>
      <defs>
        <linearGradient id={`sg-seg-${color.replace(/[^a-z]/g,'-')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sg-seg-${color.replace(/[^a-z]/g,'-')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0].toFixed(1)} cy={p[1].toFixed(1)} r="3" fill={color} opacity="0.8" />
      ))}
    </svg>
  )
}

export default function MetricasSeguidores() {
  const toast = useToast()
  const [dados,   setDados]   = useState({ instagram: [], tiktok: [] })
  const [loading, setLoading] = useState(true)
  const [form,    setForm]    = useState({ plataforma: 'instagram', data_ref: new Date().toISOString().split('T')[0], quantidade: '' })
  const [saving,  setSaving]  = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('seguidores')
      .select('*')
      .order('data_ref', { ascending: true })
    const ig = (data || []).filter(d => d.plataforma === 'instagram')
    const tt = (data || []).filter(d => d.plataforma === 'tiktok')
    setDados({ instagram: ig, tiktok: tt })
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.quantidade || isNaN(form.quantidade)) { toast.error('Informe a quantidade'); return }
    setSaving(true)
    const { data: existing } = await supabase
      .from('seguidores').select('id')
      .eq('plataforma', form.plataforma).eq('data_ref', form.data_ref).limit(1)
    if (existing?.[0]) {
      await supabase.from('seguidores').update({ quantidade: Number(form.quantidade) }).eq('id', existing[0].id)
    } else {
      await supabase.from('seguidores').insert({ ...form, quantidade: Number(form.quantidade) })
    }
    toast.success('✓ Seguidores registrados')
    setSaving(false)
    load()
  }

  const calcGrowth = (data) => {
    if (data.length < 2) return null
    const last  = data[data.length - 1].quantidade
    const prev  = data[data.length - 2].quantidade
    return prev > 0 ? ((last - prev) / prev * 100).toFixed(1) : null
  }

  const calcTotal = (data) => data.length > 0 ? data[data.length - 1].quantidade : 0

  return (
    <div className="space-y-5">
      {/* Cards por plataforma */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {PLATS.map(plat => {
          const data   = dados[plat]
          const total  = calcTotal(data)
          const growth = calcGrowth(data)
          const color  = PLAT_COLOR[plat]
          return (
            <div key={plat} className="rounded-2xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'var(--text3)' }}>
                    {plat === 'instagram' ? '📸 Instagram' : '🎵 TikTok'}
                  </div>
                  <div className="font-title font-black text-3xl" style={{ color }}>{Number(total).toLocaleString('pt-BR')}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>seguidores</div>
                </div>
                {growth !== null && (
                  <div className="text-right">
                    <div className="text-lg font-bold" style={{ color: Number(growth) >= 0 ? 'var(--green)' : 'var(--coral)' }}>
                      {Number(growth) >= 0 ? '↑' : '↓'} {Math.abs(Number(growth))}%
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--text3)' }}>vs anterior</div>
                  </div>
                )}
              </div>
              {loading
                ? <div className="skeleton rounded h-12 w-full" />
                : <SparkGrowth data={data} color={color} />
              }
              {data.length > 1 && (
                <div className="flex justify-between text-[9px] mt-1" style={{ color: 'var(--text3)' }}>
                  <span>{fmtDate(data[0]?.data_ref)}</span>
                  <span>{fmtDate(data[data.length-1]?.data_ref)}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Formulário de input */}
      <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <div className="text-sm font-medium mb-4" style={{ color: 'var(--text2)' }}>➕ Registrar seguidores</div>
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <div className="text-[11px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--text3)' }}>Plataforma</div>
            <div className="flex gap-2">
              {PLATS.map(p => (
                <button key={p} onClick={() => setForm(f => ({ ...f, plataforma: p }))}
                  className="text-xs px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: form.plataforma === p ? PLAT_COLOR[p]+'22' : 'var(--bg3)',
                    border: `1px solid ${form.plataforma === p ? PLAT_COLOR[p] : 'var(--border)'}`,
                    color: form.plataforma === p ? PLAT_COLOR[p] : 'var(--text2)',
                    cursor: 'pointer',
                  }}>
                  {p === 'instagram' ? '📸 Instagram' : '🎵 TikTok'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--text3)' }}>Data</div>
            <input type="date" className="form-input" value={form.data_ref}
              onChange={e => setForm(f => ({ ...f, data_ref: e.target.value }))} />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--text3)' }}>Quantidade</div>
            <input type="number" className="form-input" placeholder="Ex: 12500"
              value={form.quantidade} onChange={e => setForm(f => ({ ...f, quantidade: e.target.value }))} />
          </div>
          <button className="btn-primary px-6 py-2.5" disabled={saving} onClick={handleSave}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Histórico tabela */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="px-5 py-3.5" style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--text2)' }}>📋 Histórico de registros</span>
        </div>
        {loading
          ? <div className="p-4"><div className="skeleton rounded h-32 w-full" /></div>
          : [...dados.instagram, ...dados.tiktok]
              .sort((a, b) => b.data_ref.localeCompare(a.data_ref))
              .slice(0, 20)
              .map((d, i, arr) => {
                const prev = arr.find((r, ri) => ri > i && r.plataforma === d.plataforma)
                const growth = prev ? ((d.quantidade - prev.quantidade) / prev.quantidade * 100).toFixed(1) : null
                return (
                  <div key={d.id} className="flex items-center gap-4 px-5 py-3 transition-colors"
                    style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                      style={{ background: PLAT_COLOR[d.plataforma]+'22', color: PLAT_COLOR[d.plataforma] }}>
                      {d.plataforma}
                    </span>
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--text3)' }}>{fmtDate(d.data_ref)}</span>
                    <span className="text-sm font-bold" style={{ color: PLAT_COLOR[d.plataforma] }}>{Number(d.quantidade).toLocaleString('pt-BR')}</span>
                    {growth !== null && (
                      <span className="text-xs ml-auto" style={{ color: Number(growth) >= 0 ? 'var(--green)' : 'var(--coral)' }}>
                        {Number(growth) >= 0 ? '↑' : '↓'} {Math.abs(Number(growth))}%
                      </span>
                    )}
                  </div>
                )
              })
        }
      </div>
    </div>
  )
}