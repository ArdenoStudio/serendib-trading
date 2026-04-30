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

-- 3. Enable Realtime on the cars table
-- (In Supabase Dashboard: Database → Replication → enable 'cars' table)
-- OR via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE cars;

-- 4. Create the vehicle-images Storage bucket
-- (Do this in Supabase Dashboard → Storage → New Bucket)
-- Bucket name: vehicle-images
-- Set to PUBLIC so uploaded images are accessible via URL

-- 5. Storage RLS policy — allow authenticated users to upload
-- Run after creating the bucket:
CREATE POLICY "Authenticated users can upload vehicle images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'vehicle-images');

CREATE POLICY "Anyone can read vehicle images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'vehicle-images');
