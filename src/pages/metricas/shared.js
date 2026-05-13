// ── Parsers ───────────────────────────────────────────────
export function parseNum(v) {
  if (!v || v === 'Não há dados') return 0
  return Number(String(v).replace(/\./g, '').replace(',', '.')) || 0
}

export function parseDateIG(str) {
  if (!str) return null
  const months = { 'jan':1,'fev':2,'mar':3,'abr':4,'mai':5,'jun':6,'jul':7,'ago':8,'set':9,'out':10,'nov':11,'dez':12 }
  const m = str.match(/(\d+)\s+de\s+(\w+)\.\s+de\s+(\d+)/)
  if (!m) return null
  const mon = months[m[2].toLowerCase()]
  if (!mon) return null
  return `${m[3]}-${String(mon).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`
}

export function extractPostId(url) {
  if (!url) return null
  const m = url.match(/\/(p|reel|video)\/([^/?]+)/)
  return m ? m[2] : null
}

export function parseInstagram(rows) {
  return rows.map(r => ({
    plataforma: 'instagram', post_id: extractPostId(r['Link']),
    data_ref: parseDateIG(r['Date']), views: parseNum(r['Views']),
    likes: parseNum(r['Likes']), comentarios: parseNum(r['Comments']),
    salvamentos: parseNum(r['Saved']), compartilhamentos: parseNum(r['Shares']),
    alcance: parseNum(r['Alcance']), impressoes: 0, plays: 0,
    link: r['Link'] || '', caption: r['Caption'] || '', formato: r['Tipo'] || '', raw: r,
  })).filter(r => r.post_id)
}

export function parseTikTok(rows) {
  return rows.map(r => ({
    plataforma: 'tiktok', post_id: extractPostId(r['Video Share URL']),
    data_ref: r['Video Create Time']?.split(' ')[0] || null,
    views: parseNum(r['Views']), plays: parseNum(r['Views']),
    likes: parseNum(r['Likes']), comentarios: parseNum(r['Comments']),
    compartilhamentos: parseNum(r['Shares']), alcance: parseNum(r['Alcance']),
    impressoes: 0, salvamentos: 0,
    link: r['Video Share URL'] || '', caption: r['Video Caption'] || '',
    formato: 'video', raw: r,
  })).filter(r => r.post_id)
}

export function detectPlataforma(headers) {
  if (headers.includes('Video Share URL')) return 'tiktok'
  if (headers.includes('Link')) return 'instagram'
  return null
}

// ── Formatters ────────────────────────────────────────────
export const fmtN = (n) => {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n/1000).toFixed(1) + 'k'
  return String(n)
}
export const fmtDate = (d) => d ? d.split('-').slice(1).reverse().join('/') : '—'

// ── Cores ─────────────────────────────────────────────────
export const PLAT_COLOR = { instagram: '#e1306c', tiktok: '#69c9d0', all: 'var(--accent)' }
export const FMT_COLOR  = {
  REELS: 'var(--purple)', reels: 'var(--purple)',
  FEED:  'var(--teal)',   feed:  'var(--teal)',
  video: 'var(--amber)',  outro: 'var(--text3)',
}