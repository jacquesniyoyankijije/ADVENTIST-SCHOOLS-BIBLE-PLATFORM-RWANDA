-- Initial schema foundation.
-- Apply through Supabase migrations/SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  is_full_access boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  district text,
  sector text,
  field_name text,
  union_name text,
  school_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role_id uuid references public.roles(id),
  school_id uuid references public.schools(id) on delete set null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.system_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table public.roles enable row level security;
alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.system_audit_logs enable row level security;

insert into public.roles(name, description, is_full_access) values
('Super Administrator','Full system access',true),
('Head of Union','Union-level access',false),
('Head of Field','Field-level access',false),
('Pastor','Pastoral access',false),
('School Leader','School administration',false),
('DOS Officer','Academic management',false),
('Discipline Officer','Discipline management',false),
('Bursar Officer','Fees and finance management',false),
('Teacher','Teaching access',false),
('Student','Student access',false),
('Parent/Guardian','Linked-child access',false),
('Ordinary User','Learning/library access',false)
on conflict(name) do nothing;

revoke all on public.profiles from anon;
revoke all on public.profiles from authenticated;
grant select, insert, update on public.profiles to authenticated;

create policy profiles_select_own on public.profiles
for select to authenticated
using (auth.uid() = id);

create policy profiles_insert_own on public.profiles
for insert to authenticated
with check (auth.uid() = id);

create policy profiles_update_own on public.profiles
for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Additional admin policies will be added after the authoritative role-check helper is implemented.
