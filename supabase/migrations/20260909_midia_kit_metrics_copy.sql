-- A seção de performance (Instagram/TikTok) do /midia-kit tinha o
-- eyebrow/título/descrição hardcoded no componente, por isso não apareciam
-- pra edição no painel. Agora são campos de content — isso aqui faz o
-- "seed" desses campos na página já existente, com os textos trocados
-- (eyebrow e título inverteram de lugar a pedido).

update landing_pages
set content = content || jsonb_build_object(
  'metrics_eyebrow', 'Nas redes sociais',
  'metrics_title', 'Sente o impacto',
  'metrics_desc', 'Números reais, direto da base de dados da plataforma — atualizados automaticamente.'
),
updated_at = now()
where slug = 'midia-kit';
