-- Dados demográficos de audiência (cidade, faixa etária, gênero), importados via
-- planilha na aba Público de Métricas. Cada import substitui os dados anteriores
-- da mesma categoria.

create table if not exists audience_insights (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('city', 'age', 'gender')),
  label text not null,
  value numeric not null, -- percentual (0-100)
  position int not null default 0,
  imported_at timestamptz not null default now()
);

create index if not exists audience_insights_category_idx on audience_insights(category);

alter table audience_insights enable row level security;

-- só a equipe logada no painel acessa (a página pública lê via Edge Function midia-kit)
create policy "audience_insights authenticated all" on audience_insights
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
