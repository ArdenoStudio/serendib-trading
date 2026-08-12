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
| **Backend** | Vercel Serverless Functions (`api/`) | Leads, auth, inventory, analytics, sitemap, OG cards |
| **Database** | Neon Postgres (Singapore) | Live inventory, leads, traffic |
| **Identity** | Google OAuth → signed JWT session | Admin access, allow-listed emails only |
| **Media** | Supabase Storage (`vehicle-images`) | Admin image uploads, public CDN |
| **Observability** | Vercel Analytics · page/car view logging | Gentle, privacy-respecting insight |

---

## The Craft — Local Development

**Prerequisites:** Node.js 20+

```bash
# 1 · Install the dependencies
npm install

# 2 · Prepare the environment
cp .env.example .env.local    # then fill in the values (table below)

# 3 · Run the full stack (API + SPA)
vercel dev
```

> **Note for connoisseurs:** `vite dev` / `vite preview` serve the SPA shell only — the serverless API lives under `vercel dev`. Without it, API calls fail gracefully and the site shows its refined empty states.

---

## The Keys — Environment Variables

| Variable | Required | Serves |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon Postgres connection (serverless API) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | ✅ | Admin Google OAuth |
| `AUTH_SECRET` | ✅ ≥32 chars | JWT session signing — **fails closed if missing** |
| `LEAD_RATE_LIMIT_SALT` | ✅ ≥16 chars | Lead-form rate limiting — **fails closed if missing** |
| `SITE_URL` / `VITE_SITE_URL` | ✅ | Canonical, sitemap, OG & OAuth origins — `https://serendibtrading.lk` |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | ✅ for uploads | Admin image uploads → Supabase Storage |
| `VITE_IMAGE_CDN_BASE_URL` | optional | Custom image CDN origin |

All are configured in Vercel (Production / Preview / Development).

---

## The Ritual — Checks

```bash
npm run lint          # TypeScript audit (tsc --noEmit)
npm run build         # vite build → Playwright Chromium install → prerender / & /inventory
npm run test:e2e      # Playwright — 18 tests, API stubbed for the preview sandbox
```

The build never fails on a missing browser — it gracefully falls back to the SPA shell.

---

## The Unveiling — Deployment

```bash
vercel --prod
```

The `serendibtrading.lk` domain is aliased to the production deployment.

---

## The Stewardship — Governance & Maintenance

- **Secrets are sacred.** Never commit a real `DATABASE_URL` (one was previously committed — rotate the Neon password if it ever touched git history).
- **RLS & SQL migrations** (`supabase_*.sql`) are historical Supabase artifacts. Production runs on Neon + serverless functions, where access is enforced by signed JWT sessions on every admin endpoint.
- **Image uploads** flow to Supabase Storage behind the admin session. If the project exceeds its quota, storage returns HTTP 402 and cards fall back to a local showroom portrait — watch the quota.
- **Leads & consent.** `/api/leads` validates, rate-limits by IP and phone, and requires explicit consent — compliant with Sri Lanka's PDPA and respectful of GDPR visitors.
- **Demo inventory** (`src/data/cars.json`) is a local-development courtesy only. The showroom floor in production is always live.

---

*Serendib Trading — founded on provenance, driven by passion.*

**47/A, S. De S. Jayasinghe Mawatha · Dehiwala-Mount Lavinia · Sri Lanka**

[serendibtrading.lk](https://serendibtrading.lk) · [+94 75 636 3427](tel:+94756363427) · [@serendib_trading](https://www.instagram.com/serendib_trading/)