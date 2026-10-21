# Supabase setup

This repository uses Supabase Auth and PostgreSQL. Apply migrations in order from the Supabase Dashboard → SQL Editor.

## First setup

1. Create a Supabase project.
2. Open **SQL Editor → New query**.
3. Copy and run `supabase/migrations/0001_initial.sql`.
4. In a separate query, copy and run `supabase/migrations/0002_auth_and_privilege_hardening.sql`.
5. In another query, copy and run `supabase/migrations/0003_platform_schema.sql` (full platform tables: classes, students, results, discipline, fees, Bible and lesson content, messaging, notifications — all with Row Level Security).
6. In another query, copy and run `supabase/migrations/0004_sso_identity_support.sql` (provider sign-in profile support).
7. Finally, copy and run `supabase/migrations/0005_security_and_data_fixes.sql` — forward-only corrections:
   - canonical role names matching the frontend (`School Leader`/`DOS Officer`/`Discipline Officer` → `School Administrator`, `Bursar Officer` → `Bursar`; adds `Church Leader`)
   - the table GRANTs 0003 was missing (authenticated users could not read the new tables)
   - the `thread_participants` RLS recursion fix via a SECURITY DEFINER helper
   - thread/participant creation policies and scoped policies rewritten for the canonical role names
   The file ends with verification queries you should run after applying it.
8. In **Project Settings → API** (or the API keys page), copy the Project URL and the public anon/publishable key.
9. In Render → your Static Site → **Environment**, add:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your public anon/publishable key
8. Save changes and trigger a new deploy. These `VITE_` values are bundled into the public frontend; only use the public key, never a service_role/secret key.

## Enable sign-in with Google (OAuth)

1. In Supabase → **Authentication → Providers → Google**, enable the provider.
2. Follow the link on that page to the Google Cloud Console:
   - Create an **OAuth consent screen** (External) and a **Web application** credential.
   - Add `https://YOUR-PROJECT.supabase.co/auth/v1/callback` as an authorized redirect URI.
   - Copy the Google **Client ID** and **Client Secret** into the Supabase provider settings.
3. In Supabase → **Authentication → URL Configuration**, set the **Site URL** and add your deployed site (e.g. `https://adventist-schools-platform.onrender.com`) to **Redirect URLs**.
4. Deployed with the `VITE_SUPABASE_*` variables set, the sign-in page automatically switches to live mode: the **Google** button redirects through Google and returns signed in, landing on the page the visitor originally requested.

## Enable single sign-on (SAML SSO)

SAML SSO requires a Supabase plan that includes it (Team or higher), plus your identity provider (e.g. Okta, Azure AD, or any SAML 2.0 IdP):

1. In Supabase → **Authentication → SSO Providers**, add a provider and connect it with your IdP's metadata (or follow the Supabase SAML connection wizard).
2. Register the domains that are allowed to use it (e.g. `adventist.rw`) in the same section.
3. Add the deployed site to **Redirect URLs** as above.
4. Users enter their work email on the sign-in page and press **Continue with SSO** — Supabase resolves the provider from the email domain and redirects through the IdP.

## How provider accounts are stored

Migration `0004_sso_identity_support.sql` makes Google and SAML sign-ups first-class accounts:

- The existing `on_auth_user_created` trigger now also stores the provider-supplied **name and avatar** in `public.profiles`.
- A new `profiles_sync_identity` trigger keeps the profile name/avatar in sync when the identity provider updates them.
- Every new account — email, Google or SSO — still starts as the least-privilege **Ordinary User** role; promote administrators with the SQL below.

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

## Migration order (reference)

0001_initial.sql → 0002_auth_and_privilege_hardening.sql → 0003_platform_schema.sql → 0004_sso_identity_support.sql → 0005_security_and_data_fixes.sql

Never edit an applied migration; corrections go in a new numbered file.

## Security notes

- Never expose the Supabase service_role/secret key in browser code.
- New registrations receive the Ordinary User role by default.
- The profile trigger blocks users from changing their own role or school assignment.
- Migration 0003 adds the student results, discipline and finance tables with carefully scoped RLS policies; review them before using real records.
- Apply later migrations only after reviewing them and keeping a safe copy of important data.

## Optional: sample data

To load illustrative sample records (5 fields, 8 schools, classes, 20
students, results, discipline incidents, fee invoices and payments, Bible
chapters from the KJV, lessons, EGW links and announcements), run
`supabase/seed.sql` in the SQL Editor. It is safe to re-run — it skips
itself if student records already exist.
