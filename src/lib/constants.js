// ── Responsáveis ──
export const RESPONSAVEIS = {
  Nico:  { color: '#c8f043', photo: 'https://instagram.fpoa13-1.fna.fbcdn.net/v/t51.82787-19/683090406_18581886565022230_4043454797942534839_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fpoa13-1.fna.fbcdn.net&_nc_cat=110&ccb=7-5' },
  Gabe:  { color: '#9b6dff', photo: 'https://instagram.fpoa13-1.fna.fbcdn.net/v/t51.82787-19/671117195_18578700337004536_5136776709204820303_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fpoa13-1.fna.fbcdn.net&_nc_cat=104&ccb=7-5' },
  Erika: { color: '#f472b6', photo: 'https://instagram.fpoa13-1.fna.fbcdn.net/v/t51.2885-19/330362837_576657751193342_8437573667664803139_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fpoa13-1.fna.fbcdn.net&_nc_cat=102&ccb=7-5' },
}

// ── Parcerias ──
export const P_STATUS_1 = {
  lead:       { label: 'Lead mapeado',     color: '#5a5a6e', bg: '#1a1a22' },
  contato:    { label: 'Em contato',       color: '#60a5fa', bg: '#0e1a2e' },
  negociacao: { label: 'Em negociação',    color: '#fbbf24', bg: '#221a0a' },
  proposta:   { label: 'Proposta enviada', color: '#c084fc', bg: '#1e1530' },
  fechado:    { label: 'Parceria fechada', color: '#4ade80', bg: '#0e2018' },
  perdido:    { label: 'Perdido',          color: '#f87171', bg: '#220e0e' },
}
export const P_STATUS_2 = {
  producao:  { label: 'Em produção',       color: '#60a5fa', bg: '#0e1a2e' },
  edicao:    { label: 'Em edição',         color: '#fbbf24', bg: '#221a0a' },
  aprovacao: { label: 'Aguard. aprovação', color: '#f472b6', bg: '#220e1a' },
  publicado: { label: 'Publicado',         color: '#4ade80', bg: '#0e2018' },
}
export const P_STATUS_3 = {
  nf_pendente:   { label: 'NF pendente',    color: '#f87171', bg: '#220e0e' },
  nf_emitida:    { label: 'NF emitida',     color: '#fbbf24', bg: '#221a0a' },
  pgto_pendente: { label: 'Pgto. pendente', color: '#f472b6', bg: '#220e1a' },
  recebido:      { label: 'Recebido ✓',     color: '#4ade80', bg: '#0e2018' },
}
export const P_PHASES = {
  1: { label: 'Fase 1 · Prospecção', color: '#9b6dff', bg: '#1e1530', sm: P_STATUS_1 },
  2: { label: 'Fase 2 · Produção',   color: '#2dd4bf', bg: '#0d2420', sm: P_STATUS_2 },
  3: { label: 'Fase 3 · Financeiro', color: '#fbbf24', bg: '#221a0a', sm: P_STATUS_3 },
}

// ── Conteúdo ──
export const CN_STATUS = {
  backlog:   { label: 'Backlog',   color: '#5a5a6e', bg: '#1a1a22', emoji: '💡' },
  planejado: { label: 'Planejado', color: '#60a5fa', bg: '#0e1a2e', emoji: '📋' },
  gravado:   { label: 'Gravado',   color: '#fbbf24', bg: '#221a0a', emoji: '🎬' },
  editado:   { label: 'Editado',   color: '#c084fc', bg: '#1e1530', emoji: '✂️' },
  publicado: { label: 'Publicado', color: '#4ade80', bg: '#0e2018', emoji: '✅' },
  arquivado: { label: 'Arquivado', color: '#5a5a6e', bg: '#1a1a22', emoji: '🗄️' },
}
export const CN_TIPOS = {
  organico:    { label: 'Orgânico',    color: '#4ade80', bg: '#0e2018' },
  criativo:    { label: 'Criativo',    color: '#9b6dff', bg: '#1e1530' },
  trend:       { label: 'Trend',       color: '#fbbf24', bg: '#221a0a' },
  publicidade: { label: 'Publicidade', color: '#60a5fa', bg: '#0e1a2e' },
  parceria:    { label: 'Parceria',    color: '#f472b6', bg: '#220e1a' },
}
export const RS_META = {
  instagram: { label: 'Instagram', color: '#e1306c' },
  tiktok:    { label: 'TikTok',    color: '#69c9d0' },
  youtube:   { label: 'YouTube',   color: '#ff0000' },
}
export const FMT_ICONS = { video: '🎥', estatico: '🖼️', carrossel: '📑' }

// ── Financeiro ──
export const F_STATUS = {
  confirmado: { label: 'Confirmado', color: '#4ade80', bg: '#0e2018' },
  pendente:   { label: 'Pendente',   color: '#fbbf24', bg: '#221a0a' },
  atrasado:   { label: 'Atrasado',   color: '#f87171', bg: '#220e0e' },
  cancelado:  { label: 'Cancelado',  color: '#5a5a6e', bg: '#1a1a22' },
}
export const F_CAT_ENTRADA = ['Publicidade','Permuta','Patrocínio','Collab','Licenciamento','Outro']
export const F_CAT_SAIDA   = ['Equipe','Marketing','Equipamento','Software','Transporte','Alimentação','Impostos','Freelancer','Caixa','Outro']