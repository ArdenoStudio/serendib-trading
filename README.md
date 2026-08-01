# Serendib Trading

Luxury vehicle showroom website and lightweight inventory admin for Serendib Trading.

## Run Locally

**Prerequisites:** Node.js 20+, and Google Chrome (or `npx playwright install chromium`) if you want prerender snapshots / e2e.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Optional: copy `.env.example` to `.env.local`.
   - Leave `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` **empty** for static demo inventory from `src/data/cars.json`.
   - Set them to your Supabase project values for live inventory/admin features.

3. Run the app:

   ```bash
   npm run dev
   ```

## Checks

```bash
npm run lint
npm run build
npx playwright install chromium   # once per machine, required for e2e + local prerender
npm run test:e2e
```

## Launch Hardening

Apply SQL migrations in this order on a fresh Supabase project:

1. Base `cars` / `leads` schema (must already exist; not checked into this repo)
2. `supabase_analytics_migration.sql` (adds `cars.views`, `site_traffic`)
3. `supabase_learning_migration.sql` (adds `vehicle_knowledge`)
4. `supabase_security_hardening.sql` (RLS + `app_private.is_admin()`)
5. `supabase_launch_hardening_20260530.sql` if the production database already had an earlier hardening pass

Confirm RLS is enforced before launch: anon `GET /rest/v1/leads` must return zero rows / permission error.

The lead forms post to `/api/leads`, so Vercel also needs these server-only environment variables:

```bash
SUPABASE_SERVICE_ROLE_KEY=...
LEAD_RATE_LIMIT_SALT=...
SITE_URL=https://your-production-domain.example
```

`/sitemap.xml` is generated dynamically from live inventory (`api/sitemap.js`). Production never serves demo cars from `src/data/cars.json` — that JSON is local-dev fallback only when Supabase env vars are missing.

Keep leaked-password protection enabled in Supabase Auth, or disable password login entirely if Google OAuth is the only admin sign-in method.
