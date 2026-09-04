# SERENDIB TRADING

> **Imported Vehicles · Dehiwala & Colombo, Sri Lanka**
> UK & Japan imports — curated, inspected, and ready for Sri Lankan roads.

![Status](https://img.shields.io/badge/status-live-gold)
![Domain](https://img.shields.io/badge/serendibtrading.lk-DFFF?style=flat&logo=vercel&logoColor=black&label=production)
![Stack](https://img.shields.io/badge/React%2019%20%C2%B7%20Vite%20%C2%B7%20TypeScript-black)
![License](https://img.shields.io/badge/license-proprietary-black)

---

## The House of Serendib

Serendib Trading is a boutique vehicle importer and showroom in Dehiwala, minutes from Colombo. We hand-curate direct UK and Japan imports — every unit reviewed against its documents, mileage, and visible condition before it earns a place on our floor.

This repository powers our flagship digital showroom: a cinematic, gold-on-black experience where buyers can browse the collection, compare vehicles, estimate finance, request private viewings, and reach our concierge on WhatsApp — all in one seamless journey.

### The Collection

- **Curated Inventory** — every listing verified, photographed, and graded. Live from our showroom database.
- **Clear Histories** — JAAI / HPI reports, auction sheets, and service records available for review.
- **Trade-In Exchange** — honest evaluations against the model you want next.
- **Finance Guidance** — leasing comparisons with Sri Lanka's leading banks.
- **Private Viewings** — by-appointment showroom experiences in Dehiwala.
- **WhatsApp Concierge** — one-tap conversation with our team, islandwide.
- **Lightweight Admin** — the in-house dashboard to manage inventory, leads, and analytics.

---

## The Engine Room

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 · TypeScript · Vite 6 | Cinematic SPA with route-level code splitting |
| **Design** | Tailwind CSS 4 · framer-motion · lenis | Gold-on-black luxury theme, 60fps motion |
| **Backend** | Cloudflare Pages Functions (`functions/` + `api/`) | Leads, auth, inventory, analytics, sitemap, OG cards |
| **Database (records)** | **Neon Postgres** via `DATABASE_URL` | Live inventory, leads, traffic — the only source of truth for listings |
| **Identity** | Google OAuth → signed JWT session | Admin access, allow-listed emails only |
| **Media (photos)** | **Neon / Supabase Storage** (`vehicle-images`) | Image files stored via `/api/upload` and served from `/api/image` |
| **CDN & DNS** | Cloudflare Pages (Edge network) | Global edge caching, security headers, custom domain SSL |

---

## The Craft — Local Development

**Prerequisites:** Node.js 20+

```bash
# 1 · Install the dependencies
npm install

# 2 · Run the full stack with Cloudflare Pages Functions
npm run pages:dev
```

---

## The Keys — Environment Variables (Cloudflare Pages)

Set these under **Cloudflare Pages Dashboard → Project → Settings → Environment variables** (Production & Preview):

| Variable | Required | Serves |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon Postgres connection string |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | ✅ | Admin Google OAuth Credentials |
| `AUTH_SECRET` | ✅ ≥32 chars | JWT session signing secret |
| `LEAD_RATE_LIMIT_SALT` | ✅ ≥16 chars | Lead-form rate limiting salt |
| `ALLOWED_ADMIN_EMAILS` | optional | Comma-separated allowlist of admin emails |
| `SITE_URL` / `VITE_SITE_URL` | ✅ | Canonical, sitemap, OG & OAuth origins (`https://serendibtrading.lk`) |
| `NODE_ENV` | ✅ | `production` |

---

## Google Cloud Console OAuth Setup

In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials → OAuth 2.0 Client IDs**:

1. **Authorized JavaScript origins**:
   - `https://serendibtrading.lk`
   - `https://www.serendibtrading.lk`
   - `https://<your-project>.pages.dev`
   - `http://localhost:3000`
   - `http://127.0.0.1:8788`

2. **Authorized redirect URIs**:
   - `https://serendibtrading.lk/api/auth/callback`
   - `https://www.serendibtrading.lk/api/auth/callback`
   - `https://<your-project>.pages.dev/api/auth/callback`
   - `http://localhost:3000/api/auth/callback`
   - `http://127.0.0.1:8788/api/auth/callback`

---

## The Unveiling — Deployment

Deploy to Cloudflare Pages:

```bash
# Option A: Deploy via Wrangler CLI
npm run pages:deploy

# Option B: Connect GitHub repository to Cloudflare Pages
# Build Command: npm run build
# Build Output Directory: dist
```

---

## The Stewardship — Governance & Maintenance

- **Secrets are sacred.** Never commit a real `DATABASE_URL` (one was previously committed — rotate the Neon password if it ever touched git history).
- **One database, one media bucket.** Production records live on Neon. `supabase_*.sql` files are historical schema notes, not an active Supabase Postgres. Admin writes go through signed JWT sessions on Vercel functions.
- **Image uploads** flow to Supabase Storage behind the admin session. If the project exceeds its quota, storage returns HTTP 402 and cards fall back to a local showroom portrait. Fix quota or move files to R2 — do not put photos in Postgres (that is what burned egress on both Neon and Supabase).
- **Egress.** Public `/api/db/vehicles` selects card columns only and is CDN-cached for 60s. The admin dashboard uses `/api/db/vehicles?view=full` (auth required, uncached). Leave `VITE_ENABLE_SUPABASE_ANALYTICS` unset so every page view does not also write to Neon.
- **Leads & consent.** `/api/leads` validates, rate-limits by IP and phone, and requires explicit consent — compliant with Sri Lanka's PDPA and respectful of GDPR visitors.
- **Demo inventory** (`src/data/cars.json`) is a local-development courtesy only. The showroom floor in production is always live.

---

*Serendib Trading — founded on provenance, driven by passion.*

**47/A, S. De S. Jayasinghe Mawatha · Dehiwala-Mount Lavinia · Sri Lanka**

[serendibtrading.lk](https://serendibtrading.lk) · [+94 75 636 3427](tel:+94756363427) · [@serendib_trading](https://www.instagram.com/serendib_trading/)