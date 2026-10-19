# Supabase setup

This repository uses Supabase Auth and PostgreSQL. Apply migrations in order from the Supabase Dashboard → SQL Editor.

## First setup

1. Create a Supabase project.
2. Open **SQL Editor → New query**.
3. Copy and run `supabase/migrations/0001_initial.sql`.
4. In a separate query, copy and run `supabase/migrations/0002_auth_and_privilege_hardening.sql`.
5. In another query, copy and run `supabase/migrations/0003_platform_schema.sql` (full platform tables: classes, students, results, discipline, fees, Bible and lesson content, messaging, notifications — all with Row Level Security).
6. In **Project Settings → API** (or the API keys page), copy the Project URL and the public anon/publishable key.
7. In Render → your Static Site → **Environment**, add:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your public anon/publishable key
8. Save changes and trigger a new deploy. These `VITE_` values are bundled into the public frontend; only use the public key, never a service_role/secret key.

## Create and promote the Super Administrator

1. Open your deployed website and use **Sign in → Create an account** with the intended administrator email.
2. If Supabase email confirmation is enabled, confirm the email before signing in.
3. In Supabase → **Authentication → Users**, find the verified account and copy its user UUID.
4. Open SQL Editor and run the following after replacing the placeholder with that exact UUID:

```sql
update public.profiles
set role_id = (
  select id from public.roles
  where name = 'Super Administrator'
  limit 1
)
where id = 'PASTE-VERIFIED-AUTH-USER-UUID-HERE';
```

5. Confirm exactly one row was updated. Sign out and sign in again so the UI reloads the profile and role.

Only a trusted project owner should run the promotion SQL. Do not add a browser button or public endpoint that lets users grant themselves administrator access.

## Security notes

- Never expose the Supabase service_role/secret key in browser code.
- New registrations receive the Ordinary User role by default.
- The profile trigger blocks users from changing their own role or school assignment.
- Migration 0003 adds the student results, discipline and finance tables with carefully scoped RLS policies; review them before using real records.
- Apply later migrations only after reviewing them and keeping a safe copy of important data.
