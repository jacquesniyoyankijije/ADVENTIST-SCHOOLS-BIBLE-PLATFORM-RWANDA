# Adventist Schools & Bible Platform — Rwanda

A premium, responsive React frontend for the Adventist education network in
Rwanda, deployed as a **Render Static Site**, with **Supabase** providing
PostgreSQL, authentication, and row-level security for the backend.

## What's inside

- **Public landing page** with the Adventist identity, mission and stats
- **Sign in / Register** with validation, live Supabase auth when configured
- **Dashboard** with role-aware metrics, charts and activity feed
- **Bible Reader** with book/chapter navigation and reading controls
- **Ellen G. White Library** with search, filters and reading progress
- **Bible Lessons** with term-based tabs and progress
- **Schools Directory, Students, Results & Grades, Discipline, Fees & Bursar**
  with searchable tables, modals, forms and empty/loading/error states
- **Announcements, Messages, Notifications** for community communication
- **Users & Roles, Audit Logs, Settings, Profile** for administration
- **Role-based access**: Super Administrator, Head of Union, Head of Field,
  Pastor, Church Leader, School Administrator, Teacher, Bursar, Student —
  the dashboard navigation and permissions adapt to the selected role

The frontend currently runs on realistic demo data. Supabase auth is wired in;
data modules switch to live queries once the backend is connected.

## Tech stack

- Vite + React 19 + TypeScript
- Tailwind CSS 4 with custom design tokens (navy, teal, gold)
- React Router 7 (SPA — Render rewrites all routes to `index.html`)
- Supabase JS client, pre-wired for auth (demo mode when unconfigured)
- Supabase SQL migrations define the full database schema with RLS

## Run locally

1. Install Node.js LTS.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add your Supabase Project URL and
   public anon/publishable key (optional — the app runs in demo mode
   without them).
4. Run `npm run dev` and open the URL printed in the terminal.

## Render deployment

1. Connect this GitHub repository to Render as a **Static Site** (or use the
   included `render.yaml` blueprint).
2. Use branch `main`, auto-deploy enabled.
3. Build command: `npm install && npm run build`.
4. Publish directory: `dist`.
5. In Render → Static Site → **Environment**, add:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your public anon/publishable key
6. Save and redeploy. Commits to `main` deploy automatically.

## Supabase setup

Follow [supabase/README.md](supabase/README.md). In short:

1. Create a Supabase project.
2. Run the migrations in order in the Supabase SQL Editor:
   1. `supabase/migrations/0001_initial.sql` — foundation (roles, schools,
      profiles, audit logs)
   2. `supabase/migrations/0002_auth_and_privilege_hardening.sql` —
      privilege guard, signup trigger, core RLS policies
   3. `supabase/migrations/0003_platform_schema.sql` — the full platform
      model: fields, classes, students, subjects, results, discipline
      incidents, fee invoices and payments, Bible books/chapters, lessons and
      progress, EGW library, announcements, messaging threads,
      notifications — every table protected by Row Level Security
3. Add the two public client environment variables in Render and redeploy.
4. Register the intended administrator account on the website, then use the
   documented trusted SQL procedure to assign the Super Administrator role.

## Security and scope

- Never put a Supabase `service_role` or secret key in Vite/browser code.
- New registrations are assigned the Ordinary User role by default.
- The profile trigger blocks users from changing their own role or school
  assignment.
- Promote a Super Administrator only through a trusted Supabase SQL Editor
  session; never through a public browser form.
- PostgreSQL RLS (migrations 0002 and 0003) is the authoritative security
  boundary for student, discipline and financial records — the UI merely
  hides controls.
- Only publish Bible/EGW texts for which you have the necessary rights.
