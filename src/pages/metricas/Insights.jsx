import { useEffect, useState } from 'react'
import { fmtN, fmtDate, PLAT_COLOR } from './shared.js'

const PERIODS = [
  { v: '7',  label: 'Últimos 7 dias'  },
  { v: '30', label: 'Últimos 30 dias' },
  { v: '90', label: 'Últimos 90 dias' },
  { v: 'all',label: 'Todos os dados'  },
]

function filterByPeriod(metricas, period) {
  if (period === 'all') return metricas
  const days = Number(period)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split('T')[0]
  return metricas.filter(m => m.data_ref >= cutoffStr)
}

function buildContext(metricas) {
  if (!metricas.length) return null

  const ig = metricas.filter(m => m.plataforma === 'instagram')
  const tt = metricas.filter(m => m.plataforma === 'tiktok')

  const sum = (arr, key) => arr.reduce((s, m) => s + (m[key] || 0), 0)
  const avg = (arr, key) => arr.length ? Math.round(sum(arr, key) / arr.length) : 0
  const avgEng = (arr) => {
    if (!arr.length) return 0
    return (arr.reduce((s, m) => {
      const e = m.alcance > 0 ? ((m.likes + m.comentarios + m.compartilhamentos) / m.alcance) * 100 : 0
      return s + e
    }, 0) / arr.length).toFixed(2)
  }

  // Por formato (Instagram)
  const byFmt = {}
  ig.forEach(m => {
    const f = m.raw?.Tipo || 'outro'
    if (!byFmt[f]) byFmt[f] = { count: 0, views: 0, likes: 0, eng: 0 }
    byFmt[f].count++
    byFmt[f].views += m.views || 0
    byFmt[f].likes += m.likes || 0
    byFmt[f].eng += m.alcance > 0 ? ((m.likes + m.comentarios + m.compartilhamentos) / m.alcance) * 100 : 0
  })
  Object.keys(byFmt).forEach(k => {
    byFmt[k].avgViews = Math.round(byFmt[k].views / byFmt[k].count)
    byFmt[k].avgEng   = (byFmt[k].eng / byFmt[k].count).toFixed(2)
  })

  // Por dia da semana
  const byDow = Array(7).fill(0).map(() => ({ count: 0, views: 0, eng: 0 }))
  const DOW = ['Domingo','Segunda','Terca','Quarta','Quinta','Sexta','Sabado']
  metricas.forEach(m => {
    if (!m.data_ref) return
    const d = new Date(m.data_ref + 'T12:00:00').getDay()
    byDow[d].count++
    byDow[d].views += m.views || 0
    byDow[d].eng += m.alcance > 0 ? ((m.likes + m.comentarios + m.compartilhamentos) / m.alcance) * 100 : 0
  })
  const dowStats = byDow.map((d, i) => ({
    dia: DOW[i],
    avgViews: d.count ? Math.round(d.views / d.count) : 0,
    avgEng:   d.count ? (d.eng / d.count).toFixed(2) : '0',
    count: d.count,
  }))

  // Top 5 posts
  const top5 = [...metricas]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map(m => ({
      titulo: (m.raw?.Caption || m.raw?.['Video Caption'] || '').slice(0, 60) || m.post_id,
      plataforma: m.plataforma,
      views: m.views,
      eng: m.alcance > 0 ? (((m.likes + m.comentarios + m.compartilhamentos) / m.alcance) * 100).toFixed(2) : '0',
      data: fmtDate(m.data_ref),
    }))

  return {
    periodo: `${metricas.length} posts analisados`,
    instagram: ig.length ? {
      posts: ig.length,
      totalViews: sum(ig, 'views'),
      avgViews: avg(ig, 'views'),
      totalLikes: sum(ig, 'likes'),
      avgLikes: avg(ig, 'likes'),
      avgEngajamento: avgEng(ig),
      totalAlcance: sum(ig, 'alcance'),
      porFormato: byFmt,
    } : null,
    tiktok: tt.length ? {
      posts: tt.length,
      totalViews: sum(tt, 'views'),
      avgViews: avg(tt, 'views'),
      totalLikes: sum(tt, 'likes'),
      avgLikes: avg(tt, 'likes'),
      avgEngajamento: avgEng(tt),
    } : null,
    porDiaDaSemana: dowStats,
    top5Posts: top5,
  }
}

function InsightCard({ icon, title, content, color, loading }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--bg2)', border: `1px solid ${color}30` }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-semibold" style={{ color }}>{title}</span>
        {loading && (
          <div className="ml-auto w-4 h-4 border-2 rounded-full animate-spin flex-shrink-0"
            style={{ borderColor: 'var(--border2)', borderTopColor: color }} />
        )}
      </div>
      {loading
        ? (
          <div className="space-y-2">
            <div className="skeleton rounded h-3 w-full" />
            <div className="skeleton rounded h-3 w-4/5" />
            <div className="skeleton rounded h-3 w-3/5" />
          </div>
        )
        : (
          <div className="text-sm leading-relaxed space-y-2" style={{ color: 'var(--text2)' }}>
            {content?.split('\n').filter(Boolean).map((line, i) => (
              <p key={i} style={{ color: line.startsWith('•') ? 'var(--text)' : 'var(--text2)' }}>
                {line}
              </p>
            ))}
          </div>
        )
      }
    </div>
  )
}

export default function MetricasInsights({ metricas: allMetricas }) {
  const [period,   setPeriod]   = useState('30')
  const [insights, setInsights] = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [lastGen,  setLastGen]  = useState(null)

  const metricas = filterByPeriod(allMetricas, period)
  const ctx = buildContext(metricas)

  const generate = async () => {
    if (!ctx) return
    setLoading(true)
    setError(null)

    const prompt = `Você é um especialista em marketing digital e criação de conteúdo para influenciadores.

Analise os seguintes dados reais de performance de conteúdo e gere insights acionáveis em português brasileiro informal e direto.

DADOS DO PERÍODO (${ctx.periodo}):

${ctx.instagram ? `
INSTAGRAM:
- ${ctx.instagram.posts} posts publicados
- Total de views: ${fmtN(ctx.instagram.totalViews)}
- Média de views por post: ${fmtN(ctx.instagram.avgViews)}
- Média de likes por post: ${fmtN(ctx.instagram.avgLikes)}
- Taxa de engajamento média: ${ctx.instagram.avgEngajamento}%
- Alcance total: ${fmtN(ctx.instagram.totalAlcance)}
${Object.entries(ctx.instagram.porFormato).map(([fmt, d]) =>
  `- ${fmt}: ${d.count} posts, média ${fmtN(d.avgViews)} views, ${d.avgEng}% engajamento`
).join('\n')}
` : ''}

${ctx.tiktok ? `
TIKTOK:
- ${ctx.tiktok.posts} posts publicados
- Total de views: ${fmtN(ctx.tiktok.totalViews)}
- Média de views: ${fmtN(ctx.tiktok.avgViews)}
- Taxa de engajamento média: ${ctx.tiktok.avgEngajamento}%
` : ''}

PERFORMANCE POR DIA DA SEMANA:
${ctx.porDiaDaSemana.filter(d => d.count > 0).map(d =>
  `- ${d.dia}: ${d.count} posts, média ${fmtN(d.avgViews)} views, ${d.avgEng}% engajamento`
).join('\n')}

TOP 5 POSTS:
${ctx.top5Posts.map((p, i) =>
  `${i+1}. "${p.titulo}" (${p.plataforma}) — ${fmtN(p.views)} views, ${p.eng}% engajamento`
).join('\n')}

Gere exatamente 4 seções de insights, cada uma com o seguinte formato:
[PADROES] conteúdo aqui
[TENDENCIAS] conteúdo aqui
[RECOMENDACOES] conteúdo aqui
[OPORTUNIDADES] conteúdo aqui

Cada seção deve ter 3-4 bullet points começando com •, sendo específico com os números dos dados fornecidos. Seja direto e acionável.`

    try {
      const response = await fetch(
  'https://rciywgiuktjipcjtmrzw.supabase.co/functions/v1/insights',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ prompt }),
  }
)
const data = await response.json()
console.log('data:', JSON.stringify(data))
const text = data.text || ''

      // Parse das seções
      const parse = (tag) => {
        const match = text.match(new RegExp(`\\[${tag}\\]([\\s\\S]*?)(?=\\[|$)`))
        return match ? match[1].trim() : ''
      }

      setInsights({
        padroes:       parse('PADROES'),
        tendencias:    parse('TENDENCIAS'),
        recomendacoes: parse('RECOMENDACOES'),
        oportunidades: parse('OPORTUNIDADES'),
      })
      setLastGen(new Date())
    } catch(e) {
      setError('Erro ao gerar insights. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Gera automaticamente ao entrar na página ou mudar período
  useEffect(() => {
    if (allMetricas.length > 0) generate()
  }, [period, allMetricas.length])

  if (allMetricas.length === 0) return (
    <div className="text-center py-16">
      <div className="text-4xl mb-4">📊</div>
      <div className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Sem dados para analisar</div>
      <p className="text-xs" style={{ color: 'var(--text3)' }}>Importe métricas do Instagram ou TikTok primeiro</p>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>
            🧠 Insights de Performance
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
            Análise gerada por IA com base nos seus dados reais
            {lastGen && ` · Atualizado às ${lastGen.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Seletor de período */}
          <div className="flex gap-1">
            {PERIODS.map(p => (
              <button key={p.v} onClick={() => setPeriod(p.v)}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  background: period === p.v ? 'var(--accent-dk)' : 'var(--bg2)',
                  border: `1px solid ${period === p.v ? 'var(--accent)' : 'var(--border)'}`,
                  color: period === p.v ? 'var(--accent)' : 'var(--text2)',
                  cursor: 'pointer',
                }}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={generate} disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer' }}>
            {loading ? '...' : '↺ Regerar'}
          </button>
        </div>
      </div>

      {/* Stats rápidos do período */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Posts analisados', value: metricas.length,                                              color: 'var(--text)'   },
          { label: 'Total views',      value: fmtN(metricas.reduce((s,m) => s+(m.views||0), 0)),            color: 'var(--accent)' },
          { label: 'Alcance total',    value: fmtN(metricas.reduce((s,m) => s+(m.alcance||0), 0)),          color: 'var(--teal)'   },
          { label: 'Período',          value: PERIODS.find(p => p.v === period)?.label.replace('Últimos ',''), color: 'var(--purple)' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'var(--text3)' }}>{s.label}</div>
            <div className="font-title font-bold text-xl" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ background: 'var(--coral-bg)', color: 'var(--coral)', border: '1px solid var(--coral)30' }}>
          {error}
        </div>
      )}

      {/* Cards de insights */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <InsightCard
          icon="🔍" title="Padrões identificados" color="var(--accent)"
          content={insights?.padroes} loading={loading && !insights?.padroes}
        />
        <InsightCard
          icon="📈" title="Tendências" color="var(--teal)"
          content={insights?.tendencias} loading={loading && !insights?.tendencias}
        />
        <InsightCard
          icon="💡" title="Recomendações" color="var(--purple)"
          content={insights?.recomendacoes} loading={loading && !insights?.recomendacoes}
        />
        <InsightCard
          icon="🚀" title="Oportunidades" color="var(--amber)"
          content={insights?.oportunidades} loading={loading && !insights?.oportunidades}
        />
      </div>
    </div>
  )
}