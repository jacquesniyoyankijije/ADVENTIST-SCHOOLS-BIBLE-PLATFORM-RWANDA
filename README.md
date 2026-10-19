# Adventist Schools & Bible Platform — Rwanda

A Vite + JavaScript frontend deployed as a Render Static Site. Supabase provides authentication and PostgreSQL. This is an active foundation build; not all school, finance, discipline, communication, Bible and EGW workflows are complete yet.

## Run locally

1. Install Node.js LTS.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add your Supabase Project URL and public anon/publishable key.
4. Run `npm run dev` and open the URL printed in the terminal.

## Render deployment

1. Connect this GitHub repository to Render as a **Static Site**.
2. Use branch `main`.
3. Build command: `npm install && npm run build`.
4. Publish directory: `dist`.
5. In Render → Static Site → **Environment**, add:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your public anon/publishable key
6. Save and redeploy. Commits to `main` should deploy automatically when auto-deploy is enabled.

## Supabase setup

Follow [supabase/README.md](supabase/README.md). In short:

1. Create a Supabase project.
2. Run `supabase/migrations/0001_initial.sql` in the Supabase SQL Editor.
3. Run `supabase/migrations/0002_auth_and_privilege_hardening.sql` in a second query.
4. Add the two public client environment variables in Render and redeploy.
5. Register the intended administrator account on the website, then use the documented trusted SQL procedure to assign the Super Administrator role.

## Security and scope

- Never put a Supabase `service_role` or secret key in Vite/browser code.
- New registrations are assigned the Ordinary User role by default.
- The profile trigger blocks users from changing their own role or school assignment.
- Promote a Super Administrator only through a trusted Supabase SQL Editor session; never through a public browser form.
- Protect student, discipline and financial records with their own PostgreSQL Row Level Security (RLS) rules before using real data.
- Only publish Bible/EGW texts for which you have the necessary rights.
