# Serendib Trading

Luxury vehicle showroom website and lightweight inventory admin for Serendib Trading.

**Production:** https://serendibtrading.lk

## Stack

- **Frontend:** React 19 + TypeScript, Vite 6, Tailwind CSS 4, framer-motion, lenis
- **Backend:** Vercel serverless functions (`api/`) — leads, auth, inventory, analytics, sitemap, OG, uploads
- **Database:** Neon Postgres (Singapore region)
- **Admin auth:** Google OAuth → JWT session cookie (allow-listed emails)
- **Images:** Supabase Storage (`vehicle-images` bucket, public)
- **Analytics:** Vercel Analytics + lightweight page/car view logging

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the values (see table below).

3. Run the app:

   ```bash
   npm run dev
   ```

   > The serverless API (`/api/*`) only runs under `vercel dev` — plain `vite dev`/`vite preview` serves the SPA shell and the API calls fail gracefully (empty states shown). Use `vercel dev` for full-stack local development.

## Environment Variables

| Variable | Required | Used by |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon Postgres connection (serverless API) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | ✅ | Admin Google OAuth login |
| `AUTH_SECRET` | ✅ (≥32 chars) | JWT session cookie signing — **fails closed if missing** |
| `LEAD_RATE_LIMIT_SALT` | ✅ (≥16 chars) | Lead-form rate limiting — **fails closed if missing** |
| `SITE_URL` / `VITE_SITE_URL` | ✅ | Canonical, sitemap, OG and OAuth redirect origins (`https://serendibtrading.lk`) |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | ✅ for image uploads | Admin image upload → Supabase Storage |
| `VITE_IMAGE_CDN_BASE_URL` | optional | Custom image CDN origin |

All of the above are already configured in Vercel (Production/Preview/Development).

## Checks

```bash
npm run lint                 # tsc --noEmit
npm run build                # vite build + playwright chromium install + prerender
npm run test:e2e             # Playwright (18 tests, API stubbed — vite preview can't run serverless functions)
```

`npm run build` also prerenders `/` and `/inventory` to static HTML for crawlers. The build never fails if Chromium can't be installed or launched — it falls back to the SPA shell.

## Deployment

```bash
vercel --prod
```

The `serendibtrading.lk` domain is aliased to the production deployment in Vercel.

## Maintenance Notes

- **Secrets:** never commit a real `DATABASE_URL` (a live credential was previously committed in `.env.example` — rotate the Neon password if it has ever been exposed in git history).
- **RLS / Supabase SQL migrations:** the SQL files in the repo root (`supabase_*.sql`) are historical Supabase config. The production data plane is Neon + serverless functions, so those migrations are **not** applied anywhere. Table access is enforced by the API code (JWT admin sessions on every admin endpoint).
- **Image uploads:** admin uploads are stored in Supabase Storage via the service role key. If the Supabase project hits its quota, storage URLs return HTTP 402 and cards fall back to a local showroom placeholder — check the project's storage quota before blaming the UI.
- **Lead forms:** `/api/leads` validates input, enforces a per-IP + per-phone rate limit, and requires a consent checkbox (Sri Lanka PDPA / GDPR). Data is stored in Neon; conversations continue on WhatsApp only when the visitor chooses to.
- **Demo data:** `src/data/cars.json` is local-dev-only and never served in production.
