import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PERIOD_DAYS = 90
const GROWTH_WINDOW_DAYS = 30

function isoDaysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

function avgEngagement(rows: any[]) {
  if (!rows.length) return 0
  const total = rows.reduce((s, m) => {
    const e = m.alcance > 0 ? ((m.likes + m.comentarios + m.compartilhamentos) / m.alcance) * 100 : 0
    return s + e
  }, 0)
  return Number((total / rows.length).toFixed(2))
}

function avg(rows: any[], key: string) {
  if (!rows.length) return 0
  return Math.round(rows.reduce((s, m) => s + (m[key] || 0), 0) / rows.length)
}

function sum(rows: any[], key: string) {
  return rows.reduce((s, m) => s + (m[key] || 0), 0)
}

function pctChange(curr: number, prev: number): number | null {
  if (!prev) return null
  return Number((((curr - prev) / prev) * 100).toFixed(1))
}

// stats de uma janela de dias, sem "melhor formato" (usado só pro comparativo)
function windowStats(rows: any[]) {
  return {
    postsAnalyzed: rows.length,
    avgViews: avg(rows, 'views'),
    avgEngagementPct: avgEngagement(rows),
    totalReach: sum(rows, 'alcance'),
    totalViews: sum(rows, 'views'),
  }
}

function followerStats(seguidores: any[], plataforma: string) {
  const rows = seguidores
    .filter(s => s.plataforma === plataforma)
    .sort((a, b) => (a.data_ref < b.data_ref ? 1 : -1)) // desc

  if (!rows.length) return { followers: null, growthPct30d: null }

  const current = rows[0].quantidade
  const cutoff = isoDaysAgo(GROWTH_WINDOW_DAYS)
  const past = rows.find(r => r.data_ref <= cutoff)

  const growthPct30d = past && past.quantidade > 0
    ? Number((((current - past.quantidade) / past.quantidade) * 100).toFixed(1))
    : null

  return { followers: current, growthPct30d }
}

function platformStats(rows: any[], platform: string) {
  if (!rows.length) return null

  const byFmt: Record<string, any[]> = {}
  rows.forEach(m => {
    const f = platform === 'tiktok' ? 'vídeo' : (m.raw?.Tipo || 'outro').toString().toLowerCase()
    if (!byFmt[f]) byFmt[f] = []
    byFmt[f].push(m)
  })
  let topFormat: { label: string; avgViews: number; avgEngagementPct: number } | null = null
  Object.entries(byFmt).forEach(([label, fRows]) => {
    const fAvgViews = avg(fRows, 'views')
    if (!topFormat || fAvgViews > topFormat.avgViews) {
      topFormat = { label, avgViews: fAvgViews, avgEngagementPct: avgEngagement(fRows) }
    }
  })

  const cutoff30 = isoDaysAgo(GROWTH_WINDOW_DAYS)
  const cutoff60 = isoDaysAgo(GROWTH_WINDOW_DAYS * 2)
  const last30 = windowStats(rows.filter(m => m.data_ref >= cutoff30))
  const prior30 = windowStats(rows.filter(m => m.data_ref >= cutoff60 && m.data_ref < cutoff30))

  const totalReach = sum(rows, 'alcance')
  // "Alcance total" na tela cai pra totalViews quando não há alcance (TikTok) — o comparativo segue a mesma métrica exibida
  const reachGrowth = totalReach > 0
    ? pctChange(last30.totalReach, prior30.totalReach)
    : pctChange(last30.totalViews, prior30.totalViews)

  return {
    postsAnalyzed: rows.length,
    avgViews: avg(rows, 'views'),
    avgLikes: avg(rows, 'likes'),
    avgComments: avg(rows, 'comentarios'),
    avgEngagementPct: avgEngagement(rows),
    totalViews: sum(rows, 'views'),
    totalReach,
    topFormat,
    postsAnalyzedGrowthPct30d: pctChange(last30.postsAnalyzed, prior30.postsAnalyzed),
    avgViewsGrowthPct30d: pctChange(last30.avgViews, prior30.avgViews),
    avgEngagementGrowthPct30d: pctChange(last30.avgEngagementPct, prior30.avgEngagementPct),
    totalReachGrowthPct30d: reachGrowth,
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const cutoff = isoDaysAgo(PERIOD_DAYS)

    const [{ data: metricas, error: mErr }, { data: seguidores, error: sErr }] = await Promise.all([
      supabase.from('metricas').select('plataforma,views,likes,comentarios,compartilhamentos,alcance,data_ref,raw').gte('data_ref', cutoff),
      supabase.from('seguidores').select('plataforma,data_ref,quantidade'),
    ])

    if (mErr) throw mErr
    if (sErr) throw sErr

    const ig = (metricas || []).filter(m => m.plataforma === 'instagram')
    const tt = (metricas || []).filter(m => m.plataforma === 'tiktok')

    const body = {
      generatedAt: new Date().toISOString(),
      periodDays: PERIOD_DAYS,
      instagram: {
        ...followerStats(seguidores || [], 'instagram'),
        ...(platformStats(ig, 'instagram') || {}),
      },
      tiktok: {
        ...followerStats(seguidores || [], 'tiktok'),
        ...(platformStats(tt, 'tiktok') || {}),
      },
    }

    return new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
