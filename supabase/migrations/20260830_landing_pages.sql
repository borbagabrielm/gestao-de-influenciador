-- Landing Pages: páginas públicas editáveis pelo painel (ex.: mídia kit)

create table if not exists landing_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  type text not null,
  name text not null,
  published boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists landing_page_carousel_items (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references landing_pages(id) on delete cascade,
  media_url text not null,
  link_url text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table landing_pages enable row level security;
alter table landing_page_carousel_items enable row level security;

-- leitura pública (a página em si é pública)
create policy "landing_pages public read" on landing_pages
  for select using (published = true);
create policy "landing_pages authenticated read all" on landing_pages
  for select using (auth.role() = 'authenticated');
create policy "landing_page_carousel_items public read" on landing_page_carousel_items
  for select using (true);

-- escrita restrita a usuários autenticados (equipe logada no painel)
create policy "landing_pages authenticated write" on landing_pages
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "landing_page_carousel_items authenticated write" on landing_page_carousel_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- bucket público para imagens/gifs das landing pages
insert into storage.buckets (id, name, public)
values ('landing-pages', 'landing-pages', true)
on conflict (id) do nothing;

create policy "landing-pages storage public read" on storage.objects
  for select using (bucket_id = 'landing-pages');
create policy "landing-pages storage authenticated write" on storage.objects
  for insert with check (bucket_id = 'landing-pages' and auth.role() = 'authenticated');
create policy "landing-pages storage authenticated update" on storage.objects
  for update using (bucket_id = 'landing-pages' and auth.role() = 'authenticated');
create policy "landing-pages storage authenticated delete" on storage.objects
  for delete using (bucket_id = 'landing-pages' and auth.role() = 'authenticated');

-- seed: página do mídia kit
insert into landing_pages (slug, type, name, content)
values (
  'midia-kit',
  'midia-kit',
  'Mídia Kit',
  '{
    "hero_eyebrow": "criadora de conteúdo · moda & estilo",
    "hero_line1": "COMUNICO.",
    "hero_line2": "CRIO.",
    "hero_line3": "INFLUENCIO.",
    "hero_caption": "sobre duas coisas que eu amo muito: moda e criatividade — porto alegre, rs",
    "hero_photo_url": "https://rciywgiuktjipcjtmrzw.supabase.co/storage/v1/object/public/avatars/nico.jpg",
    "sobre_eyebrow": "Quem é o ele",
    "sobre_title": "Autenticidade e ousadia em pessoa",
    "sobre_paragraph_1": "Para o Nico, a vida é um palco onde cada escolha é uma chance de deixar sua marca. Com looks icônicos, humor afiado e uma energia contagiante, ele inspira todo mundo ao redor com criatividade, sempre buscando o extraordinário em tudo o que faz.",
    "sobre_paragraph_2": "Fala (muito) sobre como se expressar através da moda está para aquilo que nos faz bem. Cria conteúdos extremamente lapidados e originais, mas também surfa em trends — sempre dando seu toque — compartilhando seu lifestyle de forma a inspirar quem se conecta com essa mistura única.",
    "contact_title": "bora conversar?",
    "contact_subtitle": "Vamos construir uma parceria de sucesso.",
    "whatsapp_url": "https://api.whatsapp.com/send?phone=5551981494510&text=Oi%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20para%20uma%20parceria%20com%20o%20Nico",
    "email": "oi@niconoal.com.br"
  }'::jsonb
)
on conflict (slug) do nothing;
