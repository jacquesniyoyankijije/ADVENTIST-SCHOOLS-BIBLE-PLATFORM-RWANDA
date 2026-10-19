-- 0004_sso_identity_support.sql
-- Prepares the platform for Google OAuth and SAML SSO sign-ins.
-- Apply AFTER 0001_initial.sql, 0002_auth_and_privilege_hardening.sql and
-- 0003_platform_schema.sql.

-- ============================================================
-- 1. Richer profile creation for provider sign-ins
-- ============================================================
-- Google and SAML users arrive without a password, but with identity
-- metadata (name, avatar, phone). Extend the existing trigger so their
-- profiles are created the same way as email sign-ups, keeping the
-- least-privilege Ordinary User role on first sign-in.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ordinary_role_id uuid;
  display_name text;
  avatar_url text;
  phone text;
begin
  select id into ordinary_role_id
  from public.roles
  where name = 'Ordinary User'
  limit 1;

  display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'New user'
  );

  avatar_url := nullif(
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    ),
    ''
  );

  phone := nullif(trim(new.raw_user_meta_data ->> 'phone'), '');

  insert into public.profiles (id, full_name, role_id, avatar_url, phone)
  values (new.id, display_name, ordinary_role_id, avatar_url, phone)
  on conflict (id) do nothing;

  return new;
end;
$$;

-- The trigger itself is recreated by 0002; only the function changes,
-- so the existing on_auth_user_created trigger picks this up automatically.

-- ============================================================
-- 2. Keep profile fields in sync when the identity provider
--    updates them (name or avatar changes on the Google side)
-- ============================================================
create or replace function public.sync_profile_from_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email = old.email
     and coalesce(new.raw_user_meta_data ->> 'full_name', '')
         = coalesce(old.raw_user_meta_data ->> 'full_name', '')
     and coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
         = coalesce(old.raw_user_meta_data ->> 'avatar_url', '')
  then
    return new;
  end if;

  update public.profiles
  set
    full_name := coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      full_name
    ),
    avatar_url := coalesce(
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(new.raw_user_meta_data ->> 'picture', ''),
      avatar_url
    ),
    updated_at := now()
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists profiles_sync_identity on auth.users;
create trigger profiles_sync_identity
after update on auth.users
for each row execute function public.sync_profile_from_identity();
