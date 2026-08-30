-- Marcas parceiras (logos) das landing pages

create table if not exists landing_page_brands (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references landing_pages(id) on delete cascade,
  logo_url text not null,
  name text not null default '',
  link_url text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table landing_page_brands enable row level security;

create policy "landing_page_brands public read" on landing_page_brands
  for select using (true);
create policy "landing_page_brands authenticated write" on landing_page_brands
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
