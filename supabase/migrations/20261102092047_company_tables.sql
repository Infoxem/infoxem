create table public.imported_companies (
  id text primary key check (btrim(id) <> ''),
  source_order integer not null unique check (source_order >= 0),
  name text not null check (btrim(name) <> ''),
  business_type text not null,
  country text not null default 'Kenya',
  county text,
  original_fields jsonb not null check (jsonb_typeof(original_fields) = 'object'),
  collection_status text not null default 'not_searched',
  last_collected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.finding_companies (
  id text primary key references public.imported_companies(id) on delete cascade,
  phone_mobile text[] not null default '{}',
  email text[] not null default '{}',
  website text[] not null default '{}',
  location text[] not null default '{}',
  address text[] not null default '{}',
  evidence jsonb not null default '[]' check (jsonb_typeof(evidence) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finding_has_data check (
    cardinality(phone_mobile) + cardinality(email) + cardinality(website) +
    cardinality(location) + cardinality(address) > 0
  )
);
create index imported_companies_updated_at_idx on public.imported_companies(updated_at desc);
create index finding_companies_updated_at_idx on public.finding_companies(updated_at desc);
alter table public.imported_companies enable row level security;
alter table public.finding_companies enable row level security;
revoke all on public.imported_companies, public.finding_companies from anon, authenticated;
grant select on public.imported_companies, public.finding_companies to anon, authenticated;
grant all on public.imported_companies, public.finding_companies to service_role;
create policy imported_companies_read on public.imported_companies for select to anon, authenticated using (true);
create policy finding_companies_read on public.finding_companies for select to anon, authenticated using (true);
comment on table public.imported_companies is 'Imported Companies: one original record per company ID.';
comment on table public.finding_companies is 'Finding Companies: one record per company with collected data; source evidence stays with that company.';
notify pgrst, 'reload schema';
