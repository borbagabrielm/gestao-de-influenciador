-- Suporte a landing pages do tipo "campaign" (parcerias/campanhas, ex: Dia dos
-- Namorados), duplicáveis a partir de um template padrão.

alter table landing_pages add column if not exists description text;

-- publicidades/parcerias anteriores relacionadas ao tema da campanha
create table if not exists landing_page_case_studies (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references landing_pages(id) on delete cascade,
  media_url text not null,
  label text not null default '',
  link_url text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table landing_page_case_studies enable row level security;

create policy "landing_page_case_studies public read" on landing_page_case_studies
  for select using (true);
create policy "landing_page_case_studies authenticated write" on landing_page_case_studies
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- seed: primeira landing page de campanha, usada como padrão pra duplicar
insert into landing_pages (slug, type, name, description, published, content)
values (
  'dia-dos-namorados',
  'campaign',
  'Dia dos Namorados',
  'Página de parceria — Dia dos Namorados',
  true,
  '{
    "hero_badge": "@niconoal",
    "hero_title": "Dia dos Namorados com o Nico 💞",
    "hero_subtitle": "do caos criativo à rotina leve: uma forma de celebrar através de tudo o que a gente consome, cria e vive.",
    "hero_photo_url": "https://rciywgiuktjipcjtmrzw.supabase.co/storage/v1/object/public/avatars/nico.jpg",
    "about_eyebrow": "quem é o Nico",
    "about_title": "Autenticidade e ousadia em pessoa",
    "about_paragraph_1": "Esquece a fórmula pronta de conteúdo de data comemorativa. O jeito do Nico é, antes de tudo, uma colisão de referências — alguém que não sabe viver sem projetar, curar e ressignificar o que está ao redor.",
    "about_paragraph_2": "Não é sobre performar um roteiro pronto. É lifestyle real, olhar apurado e a vontade de criar imagens e momentos que fiquem na memória, não só no feed.",
    "cases_eyebrow": "publicidades anteriores",
    "cases_title": "Parcerias já feitas",
    "cases_desc": "Nossas parcerias passadas mostram que publicidade boa é aquela que se mistura à vida real e ao conteúdo do Nico. Já transformamos datas comemorativas em narrativas que fazem sentido pra quem acompanha, priorizando marcas que entram na história de forma fluida, estética e com verdade.",
    "content_eyebrow": "nas suas redes",
    "content_title": "Como o conteúdo se conecta com a marca",
    "content_desc": "Nico fala (muito) sobre como se expressar através da moda está para aquilo que nos faz bem. Cria conteúdos extremamente lapidados e originais, mas também surfa em trends — sempre dando seu toque — compartilhando seu lifestyle de forma a inspirar quem se conecta com essa mistura única.",
    "metrics_comparison_enabled": true,
    "partners_eyebrow": "nico e seus parceiros",
    "partners_title": "Marcas que já colaboraram",
    "partners_desc": "Por aqui não é só moda por moda ou look por look — é através de (muita) criatividade, levando inspirações para quem não liga e nem acredita nas imposições de moda por aí. Confira as marcas que já colaboraram com o Nico.",
    "contact_title": "bora conversar?",
    "contact_subtitle": "Vamos construir uma parceria de sucesso.",
    "whatsapp_url": "https://api.whatsapp.com/send?phone=5551981494510&text=Oi%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20para%20uma%20parceria%20com%20o%20Nico",
    "email": "oi@niconoal.com.br"
  }'::jsonb
)
on conflict (slug) do nothing;
