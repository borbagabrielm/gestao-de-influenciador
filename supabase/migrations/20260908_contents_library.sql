-- Biblioteca central de conteúdos — mesma ideia dos depoimentos: um pool
-- global, compartilhado por todas as landing pages, editado num só lugar.

create table if not exists contents (
  id uuid primary key default gen_random_uuid(),
  media_url text not null,
  link_url text,
  category text not null default 'Principais',
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table contents enable row level security;

create policy "contents public read" on contents
  for select using (true);
create policy "contents authenticated write" on contents
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
