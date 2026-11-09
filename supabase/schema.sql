-- ============================================================
--  Birthday Victorine Nabino : schéma Supabase
--  À exécuter une fois dans Supabase > SQL Editor.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  author_name text not null check (char_length(author_name) between 1 and 80),
  relation    text not null default 'autre',
  lang        text not null default 'fr' check (lang in ('fr', 'en', 'sw')),
  body        text not null default '' check (char_length(body) <= 2000),
  photo_path  text,
  video_path  text,
  city        text,
  lat         double precision,
  lng         double precision,
  hearts      int  not null default 0,
  hidden      boolean not null default false,
  ip_hash     text,
  created_at  timestamptz not null default now()
);

create index if not exists messages_created_at_idx on public.messages (created_at);
create index if not exists messages_ip_hash_idx on public.messages (ip_hash, created_at);

-- Sécurité : RLS activée SANS aucune policy.
-- => la clé publique "anon" ne peut rien lire ni écrire.
-- => seules les fonctions serverless (clé service_role) accèdent aux données.
alter table public.messages enable row level security;

-- Réaction ❤️ atomique
create or replace function public.increment_hearts(message_id uuid)
returns int
language sql
security definer
set search_path = public
as $$
  update public.messages
     set hearts = hearts + 1
   where id = message_id and hidden = false
  returning hearts;
$$;

revoke all on function public.increment_hearts(uuid) from public, anon, authenticated;

-- ------------------------------------------------------------
--  Buckets de stockage (tous deux PRIVÉS : lecture via URL signées)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('souvenirs', 'souvenirs', false, 10485760,
     array['image/jpeg','image/png','image/webp']),
  ('mon-amour', 'mon-amour', false, 104857600, null)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
