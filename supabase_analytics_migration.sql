-- Add view tracking to cars table
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Table to store daily traffic stats
CREATE TABLE IF NOT EXISTS public.site_traffic (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    date DATE UNIQUE DEFAULT CURRENT_DATE,
    visitor_count INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.site_traffic ENABLE ROW LEVEL SECURITY;

-- Policies for site_traffic
DROP POLICY IF EXISTS "Allow public insert/update on site_traffic" ON public.site_traffic;
DROP POLICY IF EXISTS "Authenticated users can read site_traffic" ON public.site_traffic;

CREATE POLICY "Authenticated users can read site_traffic" ON public.site_traffic
    FOR SELECT TO authenticated
    USING ((auth.jwt() ->> 'email') IN ('bilalikras1@gmail.com', 'ardenostudio@gmail.com', 'suvenseoras@gmail.com'));

-- Function to increment car views
CREATE OR REPLACE FUNCTION increment_car_view(car_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.cars
    SET views = views + 1
    WHERE id = car_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to track site visit
CREATE OR REPLACE FUNCTION track_site_visit()
RETURNS void AS $$
BEGIN
    INSERT INTO public.site_traffic (date, visitor_count, page_views)
    VALUES (CURRENT_DATE, 1, 1)
    ON CONFLICT (date)
    DO UPDATE SET 
        visitor_count = public.site_traffic.visitor_count + 1,
        page_views = public.site_traffic.page_views + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION increment_car_view(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION track_site_visit() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_car_view(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION track_site_visit() TO service_role;
