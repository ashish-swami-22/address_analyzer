create table if not exists public.address_analyses (
  id uuid primary key default gen_random_uuid(),
  original_address text not null,
  normalized_address text not null default '',
  status text not null check (status in ('resolved', 'confirmation_required', 'needs_more_information')),
  parsed_address jsonb not null default '{}'::jsonb,
  completeness_score integer not null check (completeness_score between 0 and 100),
  location_confidence integer check (location_confidence between 0 and 100),
  latitude double precision,
  longitude double precision,
  digipin text,
  issues jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists address_analyses_created_at_idx on public.address_analyses (created_at desc);
create index if not exists address_analyses_status_idx on public.address_analyses (status);

alter table public.address_analyses enable row level security;

-- There are intentionally no public policies. The Edge Function will write using
-- the server-side service role key; the browser must not write directly to this table.
