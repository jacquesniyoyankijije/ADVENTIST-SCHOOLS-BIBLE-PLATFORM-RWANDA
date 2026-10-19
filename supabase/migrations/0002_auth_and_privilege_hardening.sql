-- Authentication and privilege hardening for the first usable release.
-- Apply after 0001_initial.sql in the Supabase SQL Editor.
-- Never expose a service_role key in browser code.

create or replace function public.current_user_is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = auth.uid()
      and r.name = 'Super Administrator'
      and r.is_full_access = true
  );
$$;

revoke all on function public.current_user_is_super_admin() from public;
revoke all on function public.current_user_is_super_admin() from anon;
grant execute on function public.current_user_is_super_admin() to authenticated;

-- Prevent a user from granting themselves a role or moving their own account
-- to a different school. A trusted admin/service database session can manage it.
create or replace function public.guard_profile_privilege_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ordinary_role_id uuid;
begin
  if auth.uid() is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.id <> auth.uid() or public.current_user_is_super_admin() then
      return new;
    end if;

    select id into ordinary_role_id
    from public.roles
    where name = 'Ordinary User'
    limit 1;

    if new.role_id is distinct from ordinary_role_id then
      raise exception 'New accounts can only receive the Ordinary User role';
    end if;

    if new.school_id is not null then
      raise exception 'A new account cannot assign itself to a school';
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE'
     and old.id = auth.uid()
     and not public.current_user_is_super_admin()
     and (
       new.role_id is distinct from old.role_id
       or new.school_id is distinct from old.school_id
     ) then
    raise exception 'You cannot change your own role or school assignment';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_privileges on public.profiles;
create trigger profiles_guard_privileges
before insert or update on public.profiles
for each row execute function public.guard_profile_privilege_changes();

-- Replace broad profile policies with explicit own-profile and admin access.
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_select_admin on public.profiles;
drop policy if exists profiles_update_admin on public.profiles;

revoke all on public.profiles from anon;
revoke all on public.profiles from authenticated;
grant select, insert on public.profiles to authenticated;
grant update (full_name, phone, avatar_url, role_id, school_id) on public.profiles to authenticated;

create policy profiles_select_own on public.profiles
for select to authenticated
using (auth.uid() = id);

create policy profiles_select_admin on public.profiles
for select to authenticated
using (public.current_user_is_super_admin());

create policy profiles_insert_own on public.profiles
for insert to authenticated
with check (
  auth.uid() = id
  and role_id = (select id from public.roles where name = 'Ordinary User' limit 1)
  and school_id is null
);

create policy profiles_update_own on public.profiles
for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy profiles_update_admin on public.profiles
for update to authenticated
using (public.current_user_is_super_admin())
with check (public.current_user_is_super_admin());

-- Roles are non-sensitive configuration, readable to signed-in users only.
drop policy if exists roles_read_authenticated on public.roles;
create policy roles_read_authenticated on public.roles
for select to authenticated using (true);
grant select on public.roles to authenticated;
revoke all on public.roles from anon;

-- School directory information is available to signed-in users. Mutations are
-- reserved for the Super Administrator until scoped school-admin rules are added.
drop policy if exists schools_read_authenticated on public.schools;
drop policy if exists schools_admin_insert on public.schools;
drop policy if exists schools_admin_update on public.schools;
drop policy if exists schools_admin_delete on public.schools;
grant select on public.schools to authenticated;
grant insert, update, delete on public.schools to authenticated;
create policy schools_read_authenticated on public.schools
for select to authenticated using (true);
create policy schools_admin_insert on public.schools
for insert to authenticated with check (public.current_user_is_super_admin());
create policy schools_admin_update on public.schools
for update to authenticated
using (public.current_user_is_super_admin())
with check (public.current_user_is_super_admin());
create policy schools_admin_delete on public.schools
for delete to authenticated using (public.current_user_is_super_admin());

-- Audit records are visible only to the Super Administrator. Client-side
-- users are not granted direct insert/update/delete privileges.
drop policy if exists audit_logs_select_admin on public.system_audit_logs;
revoke all on public.system_audit_logs from anon;
revoke all on public.system_audit_logs from authenticated;
grant select on public.system_audit_logs to authenticated;
create policy audit_logs_select_admin on public.system_audit_logs
for select to authenticated using (public.current_user_is_super_admin());

-- Create a least-privilege profile whenever a new Supabase Auth user registers.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ordinary_role_id uuid;
  display_name text;
begin
  select id into ordinary_role_id
  from public.roles
  where name = 'Ordinary User'
  limit 1;

  display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'New user'
  );

  insert into public.profiles (id, full_name, role_id)
  values (new.id, display_name, ordinary_role_id)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- NOTE: After creating your account, promote the intended administrator using
-- the Supabase SQL Editor with the account's verified auth.users UUID:
-- update public.profiles
-- set role_id = (select id from public.roles where name = 'Super Administrator' limit 1)
-- where id = 'PASTE-VERIFIED-AUTH-USER-UUID-HERE';
-- Do not make this promotion endpoint available to ordinary browser users.
