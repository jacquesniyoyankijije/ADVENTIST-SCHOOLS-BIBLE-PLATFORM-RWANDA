# Adventist Schools & Bible Platform — Rwanda

A Vite + JavaScript frontend intended for deployment as a **Render Static Site**. Supabase provides PostgreSQL and authentication; Render serves the compiled frontend.

## Run locally
1. Install Node.js LTS.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and enter your Supabase project URL and public anon/publishable key.
4. Run `npm run dev` and open the URL printed in the terminal.

## Deploy to Render
1. Push this repository to GitHub.
2. In Render, choose **New + → Static Site** and connect this repository.
3. Set branch to `main`.
4. Build command: `npm install && npm run build`
5. Publish directory: `dist`
6. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Render.
7. Deploy. The included `render.yaml` defines the static site and SPA rewrite if you choose Render Blueprint deployment.

## Important
- This is the deployable frontend foundation, not a claim that every school, finance, discipline, Bible and EGW workflow is complete.
- Create/configure a Supabase project and apply the SQL migrations before connecting real data.
- Only use the public anon/publishable key in browser variables. Never put a Supabase `service_role` key in frontend code or Render's public build variables.
- Protect student, discipline and financial records with PostgreSQL Row Level Security (RLS) and server-side permission checks before using real data.
- Only publish Bible/EGW text for which you have the necessary rights.
