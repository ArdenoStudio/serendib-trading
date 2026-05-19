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
```
