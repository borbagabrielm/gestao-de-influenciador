import { useState, useRef } from 'react'
import { fmtN, fmtDate, PLAT_COLOR, FMT_COLOR } from './shared.js'

// ── Sparkline simples ─────────────────────────────────────
function Sparkline({ data, color, width = 80, height = 32 }) {
  if (!data?.length) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Big Number Card ───────────────────────────────────────
export function BigCard({ label, value, color, sparkData }) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
      <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>{label}</div>
      <div className="font-title font-black text-3xl mb-1" style={{ color }}>{value}</div>
      {sparkData && (
        <div className="absolute bottom-3 right-4 opacity-60">
          <Sparkline data={sparkData} color={color} />
        </div>
      )}
    </div>
  )
}

// ── Horizontal Bar ────────────────────────────────────────
export function HBar({ label, value, max, color, sub }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium truncate flex-1 mr-2" style={{ color: 'var(--text)' }}>{label}</span>
        <span className="text-xs font-semibold flex-shrink-0" style={{ color }}>{fmtN(value)}</span>
      </div>
      <div className="rounded-full overflow-hidden" style={{ height: 6, background: 'var(--bg3)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }} />
      </div>
      {sub && <div className="text-[10px] mt-0.5" style={{ color: 'var(--text3)' }}>{sub}</div>}
    </div>
  )
}

// ── SparkGroup com tooltip unificado ─────────────────────
function SparkGroup({ enriched, metrics }) {
  const [tooltip, setTooltip] = useState(null)
  const svgRefs = useRef([])

  const lines = metrics.map(m => {
    const vals  = enriched.map(d => d[m.key] || 0)
    const max   = Math.max(...vals, 1)
    const min   = Math.min(...vals, 0)
    const range = max - min || 1
    const PAD   = 12
const pts = enriched.map((d, i) => {
  const x = (i / Math.max(enriched.length - 1, 1)) * 600
  const y = 34 - (((d[m.key] || 0) - min) / range) * 28
  return [x, y]
})
    const pathD = pts.map((p, i) => `${i===0?'M':'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
    const areaD = [
      `M${pts[0][0].toFixed(1)},40`,
      ...pts.map(p => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`),
      `L${pts[pts.length-1][0].toFixed(1)},40 Z`,
    ].join(' ')
    const current = vals[vals.length - 1] || 0
    const prev    = vals[vals.length - 2] || 0
    const trend   = prev > 0 ? ((current - prev) / prev) * 100 : 0
    return { ...m, pts, pathD, areaD, current, trend }
  })

  const hovX = tooltip !== null ? lines[0]?.pts[tooltip.idx]?.[0] : null

const handleSvgMove = (e, svgIndex) => {
  const svg = svgRefs.current[svgIndex]
  if (!svg) return
  const rect = svg.getBoundingClientRect()
  const xPct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  const idx  = Math.max(0, Math.min(enriched.length - 1, Math.round(xPct * (enriched.length - 1))))
  setTooltip({ idx, xPct })
}

  return (
    <div style={{ position: 'relative' }}>
      {lines.map((line, li) => (
        <div key={line.key} className="mb-2 pb-2"
          style={{ borderBottom: li < lines.length - 1 ? '1px solid var(--border)' : 'none' }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: line.color }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text2)' }}>{line.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold" style={{ color: line.color }}>{line.fmt(line.current)}</span>
              {line.trend !== 0 && (
                <span className="text-[10px]" style={{ color: line.trend > 0 ? 'var(--green)' : 'var(--coral)' }}>
                  {line.trend > 0 ? '↑' : '↓'} {Math.abs(line.trend).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <svg
            ref={el => svgRefs.current[li] = el}
            viewBox="0 0 600 42"
            style={{ width: '100%', height: 42, overflow: 'visible', display: 'block', cursor: 'crosshair' }}
            onMouseMove={e => handleSvgMove(e, li)}
            onMouseLeave={() => setTooltip(null)}
          >
            <defs>
              <linearGradient id={`sg-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={line.color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={line.color} stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Área clicável invisível cobrindo todo o SVG */}
            {/* Área de captura estendida além das bordas */}
            <rect x="-20" y="-10" width="640" height="62" fill="transparent" />
            <path d={line.areaD} fill={`url(#sg-${line.key})`} />
            <path d={line.pathD} fill="none" stroke={line.color} strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
            {line.pts.map((p, i) => (
              <circle key={i} cx={p[0].toFixed(1)} cy={p[1].toFixed(1)}
                r={tooltip?.idx === i ? '4' : '2.5'}
                fill={line.color} opacity={tooltip?.idx === i ? 1 : 0.6} />
            ))}
            {hovX !== null && (
              <line x1={hovX.toFixed(1)} y1="0" x2={hovX.toFixed(1)} y2="42"
                stroke="var(--border2)" strokeWidth="1" strokeDasharray="3,3" />
            )}
          </svg>
        </div>
      ))}

      {/* Tooltip unificado */}
      {tooltip !== null && enriched[tooltip.idx] && (() => {
        const d    = enriched[tooltip.idx]
        const left = Math.min(Math.max(tooltip.xPct * 100, 5), 68)
        return (
          <div style={{
            position: 'absolute',
            left: `${left}%`,
            top: 0,
            transform: 'translateY(-8px)',
            background: 'var(--bg4)',
            border: '1px solid var(--border2)',
            borderRadius: 10,
            padding: '8px 12px',
            pointerEvents: 'none',
            zIndex: 30,
            minWidth: 140,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            <div className="text-[10px] font-semibold mb-2 pb-1"
              style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>
              📅 {fmtDate(d.data_ref)}
            </div>
            {lines.map(line => (
              <div key={line.key} className="flex items-center justify-between gap-4 mb-1">
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: line.color }} />
                  <span style={{ color: 'var(--text2)' }}>{line.label}</span>
                </span>
                <span className="text-xs font-bold" style={{ color: line.color }}>
                  {line.fmt(d[line.key] || 0)}
                </span>
              </div>
            ))}
          </div>
        )
      })()}
    </div>
  )
}

// ── Dashboard Principal ───────────────────────────────────
const SPARK_METRICS = [
  { key: 'views', label: 'Views',    color: 'var(--accent)', fmt: v => fmtN(v) },
  { key: 'likes', label: 'Likes',    color: 'var(--coral)',  fmt: v => fmtN(v) },
  { key: 'eng',   label: 'Engaj. %', color: 'var(--green)',  fmt: v => v.toFixed(2)+'%' },
]

export default function MetricasDashboard({ totals, timeline, timelineEnriched, byFormato, topPosts }) {
  return (
    <div className="space-y-5">
      {/* Big Numbers — linha 1 */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <BigCard label="Publicações"     value={fmtN(totals.posts)}                color="var(--text)"   />
        <BigCard label="Visualizações"   value={fmtN(totals.views)}                color="var(--accent)" sparkData={timeline.slice(-12).map(d => d.views)} />
        <BigCard label="Alcance total"   value={fmtN(totals.alcance)}              color="var(--teal)"   sparkData={timeline.slice(-12).map(d => d.alcance)} />
        <BigCard label="Tx. Engajamento" value={totals.engajamento.toFixed(2)+'%'} color="var(--green)"  />
      </div>
      {/* Big Numbers — linha 2 */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <BigCard label="Likes"             value={fmtN(totals.likes)}             color="var(--coral)"  />
        <BigCard label="Comentários"       value={fmtN(totals.comentarios)}       color="var(--purple)" />
        <BigCard label="Salvamentos"       value={fmtN(totals.salvamentos)}       color="var(--amber)"  />
        <BigCard label="Compartilhamentos" value={fmtN(totals.compartilhamentos)} color="var(--blue)"   />
      </div>

      {/* Timeline + Por formato */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <div className="text-sm font-medium mb-4" style={{ color: 'var(--text2)' }}>
            Performance ao longo do tempo
          </div>
          {timelineEnriched.length < 2
            ? <p className="text-xs py-4 text-center" style={{ color: 'var(--text3)' }}>Dados insuficientes</p>
            : <SparkGroup enriched={timelineEnriched} metrics={SPARK_METRICS} />
          }
          {timeline.length > 1 && (
            <div className="flex justify-between text-[9px] mt-2" style={{ color: 'var(--text3)' }}>
              <span>{fmtDate(timeline[0]?.data_ref)}</span>
              <span>{fmtDate(timeline[Math.floor(timeline.length/2)]?.data_ref)}</span>
              <span>{fmtDate(timeline[timeline.length-1]?.data_ref)}</span>
            </div>
          )}
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <div className="text-sm font-medium mb-4" style={{ color: 'var(--text2)' }}>Por formato</div>
          {byFormato.length === 0
            ? <p className="text-xs" style={{ color: 'var(--text3)' }}>Sem dados</p>
            : byFormato.map(([fmt, d]) => (
                <HBar key={fmt} label={fmt} value={d.views}
                  max={byFormato[0]?.[1]?.views || 1}
                  color={FMT_COLOR[fmt] || 'var(--accent)'}
                  sub={`${d.count} posts · ${fmtN(d.likes)} likes`} />
              ))
          }
        </div>
      </div>

      {/* Top 10 */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="px-5 py-3.5" style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--text2)' }}>🏆 Top 10 posts por views</span>
        </div>
        {topPosts.length === 0 && (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--text3)' }}>Nenhum dado</div>
        )}
        {topPosts.map((m, i) => {
          const cap = m.raw?.Caption || m.raw?.['Video Caption'] || m.post_id
          const eng = m.alcance > 0
            ? (((m.likes + m.comentarios + m.compartilhamentos) / m.alcance) * 100).toFixed(1) + '%'
            : '—'
          return (
            <div key={m.id} className="flex items-center gap-3 px-5 py-3 transition-colors"
              style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}>
              <span className="text-sm font-bold w-5 text-center flex-shrink-0"
                style={{ color: i < 3 ? 'var(--amber)' : 'var(--text3)' }}>{i + 1}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                style={{ background: (PLAT_COLOR[m.plataforma]||'#888')+'22', color: PLAT_COLOR[m.plataforma]||'#888' }}>
                {m.plataforma}
              </span>
              <a href={m.raw?.Link || m.raw?.['Video Share URL']} target="_blank" rel="noreferrer"
                className="flex-1 text-xs truncate hover:underline"
                style={{ color: 'var(--text)', maxWidth: 300 }}>
                {cap?.slice(0, 60) || '—'}
              </a>
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--text3)' }}>{fmtDate(m.data_ref)}</span>
              <span className="text-sm font-bold w-16 text-right flex-shrink-0" style={{ color: 'var(--accent)' }}>{fmtN(m.views)}</span>
              <span className="text-xs w-14 text-right flex-shrink-0" style={{ color: 'var(--coral)' }}>❤ {fmtN(m.likes)}</span>
              <span className="text-xs w-12 text-right flex-shrink-0" style={{ color: 'var(--teal)' }}>{eng}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}