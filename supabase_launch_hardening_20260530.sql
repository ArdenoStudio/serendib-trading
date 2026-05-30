-- ============================================================
-- Serendib Trading - Launch hardening delta (2026-05-30)
-- Apply this in Supabase SQL Editor if the full hardening file
-- has already been applied in production.
-- ============================================================

INSERT INTO public.admin_users (email)
VALUES
  ('bilalikras1@gmail.com'),
  ('ardenostudio@gmail.com'),
  ('suvenseoras@gmail.com')
ON CONFLICT (email) DO NOTHING;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS message TEXT;

DROP POLICY IF EXISTS "Allow public insert" ON public.leads;
DROP POLICY IF EXISTS "Public can submit valid leads" ON public.leads;

CREATE TABLE IF NOT EXISTS public.lead_rate_limits (
  id BIGSERIAL PRIMARY KEY,
  key_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lead_rate_limits ENABLE ROW LEVEL SECURITY;

DROP INDEX IF EXISTS public.leads_vehicle_id_idx;
DROP INDEX IF EXISTS public.lead_rate_limits_key_hash_created_at_idx;
CREATE INDEX lead_rate_limits_key_hash_created_at_idx
  ON public.lead_rate_limits (key_hash, created_at DESC);
