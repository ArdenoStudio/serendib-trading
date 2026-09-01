-- ============================================================
-- Serendib Trading - Add Ovindu to admin allowlist (2026-09-01)
-- Apply this in Supabase SQL Editor if production already has
-- the base hardening migrations applied.
-- ============================================================

INSERT INTO public.admin_users (email)
VALUES ('karunaratneovindu@gmail.com')
ON CONFLICT (email) DO NOTHING;
