-- Eyebrow/título/descrição da seção Audience Insights do /midia-kit também
-- estavam hardcoded no componente (por isso não apareciam pra edição).
-- Agora são campos de content — isso faz o "seed" na página já existente.

update landing_pages
set content = content || jsonb_build_object(
  'audience_eyebrow', 'Audience Insights',
  'audience_title', 'Quem são os ICONS?!',
  'audience_desc', 'Seguidores do Nico que foram carinhosamente apelidados assim por ele.'
),
updated_at = now()
where slug = 'midia-kit';
