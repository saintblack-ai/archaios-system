create table if not exists public.archaios_command_entries (
  id uuid primary key default gen_random_uuid(),
  entry_type text not null check (
    entry_type in ('mission_status', 'sitrep', 'priority', 'active_project', 'strategic_risk')
  ),
  title text not null,
  detail text not null default '',
  status text not null default 'amber' check (status in ('green', 'amber', 'red')),
  priority integer not null default 100,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.archaios_division_snapshots (
  id uuid primary key default gen_random_uuid(),
  division_key text not null unique,
  name text not null,
  call_sign text not null,
  mission text not null,
  status text not null default 'amber' check (status in ('green', 'amber', 'red')),
  metrics jsonb not null default '[]'::jsonb,
  items jsonb not null default '[]'::jsonb,
  sort_order integer not null default 100,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.archaios_archive_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  division_key text not null,
  asset_type text not null,
  file_path text,
  description text not null default '',
  tags text[] not null default '{}',
  sensitivity_level text not null default 'internal' check (sensitivity_level in ('public', 'internal', 'restricted', 'private')),
  preservation_status text not null default 'identified' check (preservation_status in ('identified', 'ingested', 'verified', 'backed_up')),
  checksum text,
  rights_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.archaios_projects (
  id uuid primary key default gen_random_uuid(),
  division_key text not null,
  name text not null,
  mission text not null default '',
  status text not null default 'active' check (status in ('idea', 'active', 'blocked', 'complete', 'archived')),
  priority integer not null default 100,
  target_date date,
  impact_score integer not null default 50 check (impact_score >= 0 and impact_score <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.archaios_agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_name text not null,
  division_key text not null,
  task text not null,
  input_reference text,
  output_reference text,
  status text not null default 'queued' check (status in ('queued', 'running', 'complete', 'failed')),
  summary text not null default '',
  created_at timestamptz not null default now()
);

alter table public.archaios_command_entries enable row level security;
alter table public.archaios_division_snapshots enable row level security;
alter table public.archaios_archive_assets enable row level security;
alter table public.archaios_projects enable row level security;
alter table public.archaios_agent_runs enable row level security;

drop policy if exists "archaios command entries readable by authenticated users" on public.archaios_command_entries;
create policy "archaios command entries readable by authenticated users"
  on public.archaios_command_entries for select
  to authenticated
  using (true);

drop policy if exists "archaios division snapshots readable by authenticated users" on public.archaios_division_snapshots;
create policy "archaios division snapshots readable by authenticated users"
  on public.archaios_division_snapshots for select
  to authenticated
  using (true);

drop policy if exists "archaios archive assets readable by authenticated users" on public.archaios_archive_assets;
create policy "archaios archive assets readable by authenticated users"
  on public.archaios_archive_assets for select
  to authenticated
  using (sensitivity_level in ('public', 'internal'));

drop policy if exists "archaios projects readable by authenticated users" on public.archaios_projects;
create policy "archaios projects readable by authenticated users"
  on public.archaios_projects for select
  to authenticated
  using (true);

drop policy if exists "archaios agent runs readable by authenticated users" on public.archaios_agent_runs;
create policy "archaios agent runs readable by authenticated users"
  on public.archaios_agent_runs for select
  to authenticated
  using (true);

insert into public.archaios_command_entries (entry_type, title, detail, status, priority)
values
  ('mission_status', 'Mission Status', 'Archaios Command Dashboard V1 is ready for operational data ingestion.', 'green', 1),
  ('sitrep', 'Daily SITREP', 'Wire live division records, verify Supabase access, and prepare the production deployment path.', 'green', 2),
  ('priority', 'Launch /archaios command route', 'Use the client app as the first operational command surface.', 'green', 10),
  ('priority', 'Populate division snapshots', 'Seed every division with metrics, active items, and status flags.', 'amber', 20),
  ('active_project', 'AI Assassins subscription visibility', 'Expose subscription count, MRR, Stripe status, growth, and health checks.', 'amber', 30),
  ('strategic_risk', 'Live secrets and webhook alignment', 'Stripe and Supabase service-role values must be verified before scale.', 'red', 40)
on conflict do nothing;

insert into public.archaios_division_snapshots (division_key, name, call_sign, mission, status, metrics, items, sort_order)
values
  (
    'ai-assassins',
    'AI Assassins Division',
    'Revenue Engine',
    'Convert intelligence workflows into recurring SaaS revenue.',
    'amber',
    '[
      {"label":"Subscription Count","value":"Pending","detail":"Connect subscriptions table.","status":"amber"},
      {"label":"Revenue","value":"Pending","detail":"Compute MRR from active Stripe subscriptions.","status":"amber"},
      {"label":"Stripe Status","value":"Verify","detail":"Checkout and webhook events required.","status":"red"},
      {"label":"User Growth","value":"Tracked","detail":"Profiles and leads feed growth view.","status":"green"},
      {"label":"System Health","value":"Health first","detail":"Use /api/health before debugging checkout.","status":"green"}
    ]'::jsonb,
    '[{"title":"Checkout route","detail":"POST /api/stripe/checkout with bearer token.","status":"green"}]'::jsonb,
    10
  ),
  (
    'qx-technology',
    'QX Technology Division',
    'Research Lab',
    'Maintain research projects, active concepts, technical notes, and roadmaps.',
    'green',
    '[
      {"label":"Research Projects","value":"Seeded","detail":"Ready for structured project rows.","status":"green"},
      {"label":"Active Concepts","value":"Seeded","detail":"Score by maturity and impact.","status":"green"},
      {"label":"Technical Notes","value":"Indexing","detail":"Connect notes and notebooks.","status":"amber"},
      {"label":"Development Roadmap","value":"V1","detail":"Roadmap panel ready.","status":"green"}
    ]'::jsonb,
    '[{"title":"Research taxonomy","detail":"Normalize by domain, evidence, maturity, and impact.","status":"green"}]'::jsonb,
    20
  )
on conflict (division_key) do nothing;
