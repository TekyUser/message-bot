create table if not exists public.keyword_rules (
  id uuid primary key default gen_random_uuid(),
  keyword text not null unique,
  response text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists keyword_rules_keyword_idx
  on public.keyword_rules (keyword);

-- The application accesses this table through the server-side
-- Supabase service-role key, so browser clients do not need table access.
alter table public.keyword_rules enable row level security;
