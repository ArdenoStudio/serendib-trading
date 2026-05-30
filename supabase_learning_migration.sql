-- Table to store learned vehicle knowledge
CREATE TABLE IF NOT EXISTS public.vehicle_knowledge (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    model_key TEXT UNIQUE NOT NULL,
    make TEXT,
    body_type TEXT,
    fuel TEXT,
    transmission TEXT,
    confidence INTEGER DEFAULT 1,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.vehicle_knowledge ENABLE ROW LEVEL SECURITY;

-- Allow public read (for the parser)
DROP POLICY IF EXISTS "Allow public read on vehicle_knowledge" ON public.vehicle_knowledge;

CREATE POLICY "Allow public read on vehicle_knowledge" ON public.vehicle_knowledge
    FOR SELECT USING (true);

-- Allow only known admins to insert/update learned knowledge.
DROP POLICY IF EXISTS "Allow authenticated users to manage vehicle_knowledge" ON public.vehicle_knowledge;
DROP POLICY IF EXISTS "Allow admins to manage vehicle_knowledge" ON public.vehicle_knowledge;

CREATE POLICY "Allow admins to manage vehicle_knowledge" ON public.vehicle_knowledge
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'email') IN ('bilalikras1@gmail.com', 'ardenostudio@gmail.com', 'suvenseoras@gmail.com'))
    WITH CHECK ((auth.jwt() ->> 'email') IN ('bilalikras1@gmail.com', 'ardenostudio@gmail.com', 'suvenseoras@gmail.com'));
