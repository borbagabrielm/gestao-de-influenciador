-- Atualiza o copy do hero do /midia-kit (a página já tem conteúdo salvo no
-- banco, então só mudar o DEFAULT_CONTENT do código não reflete no site).

update landing_pages
set content = (content - 'hero_eyebrow') || jsonb_build_object(
  'hero_line1', 'POR DENTRO DO',
  'hero_line2', 'universo icônico',
  'hero_line3', 'de @niconoal',
  'hero_caption', 'criando e compartilhando as coisas mais legais da internet'
),
updated_at = now()
where slug = 'midia-kit';
