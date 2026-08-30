-- Depoimentos (estilo comentário do Instagram) das landing pages

create table if not exists landing_page_testimonials (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references landing_pages(id) on delete cascade,
  avatar_url text,
  name text not null,
  handle text not null,
  comment text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table landing_page_testimonials enable row level security;

create policy "landing_page_testimonials public read" on landing_page_testimonials
  for select using (true);
create policy "landing_page_testimonials authenticated write" on landing_page_testimonials
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
