create extension if not exists pgcrypto;

create table if not exists public.archivist_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  item_type text not null default 'research' check (item_type in ('research', 'mission_log', 'document', 'agent_output', 'decision', 'timeline_event')),
  title text not null,
  body text not null default '',
  summary text,
  source_type text not null default 'manual',
  source_ref text,
  category text not null default 'research',
  tags text[] not null default '{}',
  importance text not null default 'medium' check (importance in ('low', 'medium', 'high', 'critical')),
  status text not null default 'active' check (status in ('active', 'needs_review', 'superseded', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists archivist_items_owner_updated_idx
  on public.archivist_items (owner_id, updated_at desc);

create index if not exists archivist_items_tags_idx
  on public.archivist_items using gin (tags);

create table if not exists public.archivist_summaries (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.archivist_items (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  summary_text text not null,
  model text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists archivist_summaries_item_created_idx
  on public.archivist_summaries (item_id, created_at desc);

create or replace function public.handle_archivist_item_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists archivist_items_set_updated_at on public.archivist_items;
create trigger archivist_items_set_updated_at
before update on public.archivist_items
for each row
execute function public.handle_archivist_item_updated_at();

alter table public.archivist_items enable row level security;
alter table public.archivist_summaries enable row level security;

drop policy if exists archivist_items_select_own on public.archivist_items;
create policy archivist_items_select_own
on public.archivist_items
for select to authenticated
using (auth.uid() = owner_id);

drop policy if exists archivist_items_insert_own on public.archivist_items;
create policy archivist_items_insert_own
on public.archivist_items
for insert to authenticated
with check (auth.uid() = owner_id);

drop policy if exists archivist_items_update_own on public.archivist_items;
create policy archivist_items_update_own
on public.archivist_items
for update to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists archivist_summaries_select_own on public.archivist_summaries;
create policy archivist_summaries_select_own
on public.archivist_summaries
for select to authenticated
using (auth.uid() = owner_id);

drop policy if exists archivist_summaries_insert_own on public.archivist_summaries;
create policy archivist_summaries_insert_own
on public.archivist_summaries
for insert to authenticated
with check (auth.uid() = owner_id);
