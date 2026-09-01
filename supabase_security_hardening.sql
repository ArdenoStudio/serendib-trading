-- ============================================================
-- Serendib Trading - Supabase Security Hardening
-- Apply with the Supabase migration runner after the base schema exists.
-- ============================================================

-- Central server-side admin allowlist used by RLS policies.
CREATE TABLE IF NOT EXISTS public.admin_users (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.admin_users (email)
VALUES
  ('bilalikras1@gmail.com'),
  ('ardenostudio@gmail.com'),
  ('suvenseoras@gmail.com'),
  ('karunaratneovindu@gmail.com')
ON CONFLICT (email) DO NOTHING;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA app_private TO authenticated;

CREATE OR REPLACE FUNCTION app_private.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

REVOKE ALL ON FUNCTION app_private.is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.is_admin() TO authenticated;

DROP POLICY IF EXISTS "Admins can read admin_users" ON public.admin_users;
CREATE POLICY "Admins can read admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING ((SELECT app_private.is_admin()));

-- Cars: public read stays open; all mutations require server-side admin identity.
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow Public Read" ON public.cars;
DROP POLICY IF EXISTS "Allow public read-only access" ON public.cars;
DROP POLICY IF EXISTS "Allow only specific admins to manage inventory" ON public.cars;
DROP POLICY IF EXISTS "Public can read inventory" ON public.cars;
DROP POLICY IF EXISTS "Admins can manage inventory" ON public.cars;
DROP POLICY IF EXISTS "Admins can add inventory" ON public.cars;
DROP POLICY IF EXISTS "Admins can update inventory" ON public.cars;
DROP POLICY IF EXISTS "Admins can delete inventory" ON public.cars;

CREATE POLICY "Public can read inventory"
  ON public.cars
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can add inventory"
  ON public.cars
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT app_private.is_admin()));

CREATE POLICY "Admins can update inventory"
  ON public.cars
  FOR UPDATE
  TO authenticated
  USING ((SELECT app_private.is_admin()))
  WITH CHECK ((SELECT app_private.is_admin()));

CREATE POLICY "Admins can delete inventory"
  ON public.cars
  FOR DELETE
  TO authenticated
  USING ((SELECT app_private.is_admin()));

-- Leads: anonymous visitors can submit only bounded lead payloads; only admins can read/update.
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS message TEXT;

DROP POLICY IF EXISTS "Allow public insert" ON public.leads;
DROP POLICY IF EXISTS "Allow admin select" ON public.leads;
DROP POLICY IF EXISTS "Allow admin update" ON public.leads;
DROP POLICY IF EXISTS "Public can submit valid leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can read leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;

-- Public lead writes go through /api/leads with the service role key and rate limiting.
-- Do not recreate an anon/authenticated INSERT policy here.

CREATE POLICY "Admins can read leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING ((SELECT app_private.is_admin()));

CREATE POLICY "Admins can update leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING ((SELECT app_private.is_admin()))
  WITH CHECK (
    (SELECT app_private.is_admin())
    AND status IN ('New', 'Contacted', 'Closed')
  );

DROP INDEX IF EXISTS public.leads_vehicle_id_idx;

CREATE TABLE IF NOT EXISTS public.lead_rate_limits (
  id BIGSERIAL PRIMARY KEY,
  key_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lead_rate_limits ENABLE ROW LEVEL SECURITY;
DROP INDEX IF EXISTS public.lead_rate_limits_key_hash_created_at_idx;
CREATE INDEX lead_rate_limits_key_hash_created_at_idx
  ON public.lead_rate_limits (key_hash, created_at DESC);

-- Vehicle knowledge: public read is needed for parsing; learning writes are admin-only.
ALTER TABLE public.vehicle_knowledge ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on vehicle_knowledge" ON public.vehicle_knowledge;
DROP POLICY IF EXISTS "Allow authenticated users to manage vehicle_knowledge" ON public.vehicle_knowledge;
DROP POLICY IF EXISTS "Public can read vehicle knowledge" ON public.vehicle_knowledge;
DROP POLICY IF EXISTS "Admins can manage vehicle knowledge" ON public.vehicle_knowledge;
DROP POLICY IF EXISTS "Admins can add vehicle knowledge" ON public.vehicle_knowledge;
DROP POLICY IF EXISTS "Admins can update vehicle knowledge" ON public.vehicle_knowledge;
DROP POLICY IF EXISTS "Admins can delete vehicle knowledge" ON public.vehicle_knowledge;

CREATE POLICY "Public can read vehicle knowledge"
  ON public.vehicle_knowledge
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can add vehicle knowledge"
  ON public.vehicle_knowledge
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT app_private.is_admin()));

CREATE POLICY "Admins can update vehicle knowledge"
  ON public.vehicle_knowledge
  FOR UPDATE
  TO authenticated
  USING ((SELECT app_private.is_admin()))
  WITH CHECK ((SELECT app_private.is_admin()));

CREATE POLICY "Admins can delete vehicle knowledge"
  ON public.vehicle_knowledge
  FOR DELETE
  TO authenticated
  USING ((SELECT app_private.is_admin()));

-- Site traffic: prevent direct public writes. Public analytics should go through Vercel
-- Analytics or a server/Edge Function with rate limiting.
ALTER TABLE public.site_traffic ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert/update on site_traffic" ON public.site_traffic;
DROP POLICY IF EXISTS "Authenticated users can read site_traffic" ON public.site_traffic;
DROP POLICY IF EXISTS "Admins can read site traffic" ON public.site_traffic;

CREATE POLICY "Admins can read site traffic"
  ON public.site_traffic
  FOR SELECT
  TO authenticated
  USING ((SELECT app_private.is_admin()));

-- Storage: bucket remains public for object URLs, but object listing/upload metadata is admin-only.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-images',
  'vehicle-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Anyone can read vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read vehicle image metadata" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete vehicle images" ON storage.objects;

CREATE POLICY "Admins can read vehicle image metadata"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'vehicle-images'
    AND (SELECT app_private.is_admin())
  );

CREATE POLICY "Admins can upload vehicle images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'vehicle-images'
    AND (storage.foldername(name))[1] = 'vehicles'
    AND (SELECT app_private.is_admin())
  );

CREATE POLICY "Admins can update vehicle images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'vehicle-images'
    AND (SELECT app_private.is_admin())
  )
  WITH CHECK (
    bucket_id = 'vehicle-images'
    AND (storage.foldername(name))[1] = 'vehicles'
    AND (SELECT app_private.is_admin())
  );

CREATE POLICY "Admins can delete vehicle images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'vehicle-images'
    AND (SELECT app_private.is_admin())
  );

-- Analytics RPCs: no direct anon/authenticated execution.
CREATE OR REPLACE FUNCTION public.increment_car_view(car_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.cars
  SET views = COALESCE(views, 0) + 1
  WHERE id = car_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.track_site_visit()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.site_traffic (date, visitor_count, page_views)
  VALUES (CURRENT_DATE, 1, 1)
  ON CONFLICT (date)
  DO UPDATE SET
    visitor_count = public.site_traffic.visitor_count + 1,
    page_views = public.site_traffic.page_views + 1;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_car_view(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.track_site_visit() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.increment_car_view(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.track_site_visit() TO service_role;

DO $$
BEGIN
  IF to_regprocedure('public.handle_sold_timestamp()') IS NOT NULL THEN
    ALTER FUNCTION public.handle_sold_timestamp() SET search_path = public, pg_catalog;
    REVOKE ALL ON FUNCTION public.handle_sold_timestamp() FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.handle_sold_timestamp() TO service_role;
  END IF;

  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO service_role;
  END IF;
END;
$$;

DROP FUNCTION IF EXISTS public.is_admin();
