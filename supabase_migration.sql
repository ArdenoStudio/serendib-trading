-- ============================================================
-- Serendib Trading — Supabase Schema Additions
-- Run this in your Supabase SQL Editor (one-time setup)
-- ============================================================

-- 1. Add missing columns to the 'cars' table
ALTER TABLE cars
  ADD COLUMN IF NOT EXISTS "bodyType"   TEXT,
  ADD COLUMN IF NOT EXISTS color        TEXT,
  ADD COLUMN IF NOT EXISTS gallery      JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS key_features JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS sold_at      TIMESTAMPTZ;

-- 2. Ensure is_sold defaults to false
ALTER TABLE cars
  ALTER COLUMN is_sold SET DEFAULT FALSE;

-- 3. Lead capture endpoint support
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS message TEXT;

-- 4. Enable Realtime on the cars table
-- (In Supabase Dashboard: Database → Replication → enable 'cars' table)
-- OR via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE cars;

-- 5. Create the vehicle-images Storage bucket
-- (Do this in Supabase Dashboard → Storage → New Bucket)
-- Bucket name: vehicle-images
-- Set to PUBLIC so uploaded images are accessible via URL

-- 6. Storage RLS policies
-- Storage access is locked down in supabase_security_hardening.sql.
-- Do not add broad authenticated upload or public list policies here.
