# Serendib Trading

Luxury vehicle showroom website and lightweight inventory admin for Serendib Trading.

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:

   ```bash
   npm install
   ```

2. Optional: copy `.env.example` to `.env.local` and set Supabase values for live inventory/admin features. Without Supabase env vars, the site uses static demo inventory from `src/data/cars.json`.

3. Run the app:

   ```bash
   npm run dev
   ```

## Checks

```bash
npm run lint
npm run build
npm run test:e2e
```

## Launch Hardening

Apply `supabase_launch_hardening_20260530.sql` in Supabase if the production database already has the earlier hardening script. The lead forms now post to `/api/leads`, so Vercel also needs these server-only environment variables:

```bash
SUPABASE_SERVICE_ROLE_KEY=...
LEAD_RATE_LIMIT_SALT=...
```

Keep leaked-password protection enabled in Supabase Auth, or disable password login entirely if Google OAuth is the only admin sign-in method.
