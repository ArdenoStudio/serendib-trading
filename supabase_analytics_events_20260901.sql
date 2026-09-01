-- ============================================================
-- Serendib Trading - Analytics events hardening (2026-09-01)
-- Core + CTAs: page views + CTA clicks + car views in one table
-- Run once in Neon SQL Editor (safe, idempotent)
-- ============================================================

-- Ensure site_traffic exists as event log (Neon)
CREATE TABLE IF NOT EXISTS public.site_traffic (
  id BIGSERIAL PRIMARY KEY,
  path TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Guard older shapes missing created_at
ALTER TABLE public.site_traffic ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Extend for event tracking (non-breaking, nullable)
ALTER TABLE public.site_traffic ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'page_view';
ALTER TABLE public.site_traffic ADD COLUMN IF NOT EXISTS car_id TEXT;
ALTER TABLE public.site_traffic ADD COLUMN IF NOT EXISTS cta_name TEXT;
ALTER TABLE public.site_traffic ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE public.site_traffic ADD COLUMN IF NOT EXISTS ip_hash TEXT;

-- Backfill nulls to page_view for old rows
UPDATE public.site_traffic SET event_type = 'page_view' WHERE event_type IS NULL;

-- Helpful indexes for dashboard (30d queries)
CREATE INDEX IF NOT EXISTS site_traffic_created_at_idx ON public.site_traffic (created_at DESC);
CREATE INDEX IF NOT EXISTS site_traffic_event_type_idx ON public.site_traffic (event_type);
CREATE INDEX IF NOT EXISTS site_traffic_path_idx ON public.site_traffic (path);
CREATE INDEX IF NOT EXISTS site_traffic_car_id_idx ON public.site_traffic (car_id) WHERE car_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS site_traffic_cta_name_idx ON public.site_traffic (cta_name) WHERE cta_name IS NOT NULL;

-- Cars views already exists from earlier migration
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
