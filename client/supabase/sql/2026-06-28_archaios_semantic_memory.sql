create extension if not exists vector;

create table if not exists public.archaios_memory_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  source_path text not null,
  title text not null,
  source_type text not null default 'document',
  sensitivity text not null default 'internal',
  metadata jsonb not null default '{}'::jsonb,
  summary text,
  checksum text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.archaios_memory_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.archaios_memory_documents(id) on delete cascade,
  owner_id uuid references auth.users(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  token_count integer not null default 0,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create table if not exists public.archaios_conversation_turns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  conversation_id text not null,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null,
  summary text,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists archaios_memory_documents_owner_idx
  on public.archaios_memory_documents(owner_id);

create index if not exists archaios_memory_documents_source_type_idx
  on public.archaios_memory_documents(source_type);

create index if not exists archaios_memory_chunks_owner_idx
  on public.archaios_memory_chunks(owner_id);

create index if not exists archaios_memory_chunks_embedding_idx
  on public.archaios_memory_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists archaios_conversation_turns_owner_idx
  on public.archaios_conversation_turns(owner_id);

create index if not exists archaios_conversation_turns_embedding_idx
  on public.archaios_conversation_turns
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

alter table public.archaios_memory_documents enable row level security;
alter table public.archaios_memory_chunks enable row level security;
alter table public.archaios_conversation_turns enable row level security;

create policy "memory documents are owner readable"
  on public.archaios_memory_documents
  for select
  using (auth.uid() = owner_id);

create policy "memory chunks are owner readable"
  on public.archaios_memory_chunks
  for select
  using (auth.uid() = owner_id);

create policy "conversation turns are owner readable"
  on public.archaios_conversation_turns
  for select
  using (auth.uid() = owner_id);

create or replace function public.match_archaios_memory_chunks(
  query_embedding vector(1536),
  match_owner_id uuid,
  match_count integer default 8,
  min_similarity double precision default 0.72
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  similarity double precision,
  metadata jsonb
)
language sql
stable
as $$
  select
    c.id,
    c.document_id,
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity,
    c.metadata
  from public.archaios_memory_chunks c
  where c.owner_id = match_owner_id
    and c.embedding is not null
    and 1 - (c.embedding <=> query_embedding) >= min_similarity
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
