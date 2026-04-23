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
CREATE POLICY "Allow public read on vehicle_knowledge" ON public.vehicle_knowledge
    FOR SELECT USING (true);

-- Allow authenticated users to insert/update (the learning part)
CREATE POLICY "Allow authenticated users to manage vehicle_knowledge" ON public.vehicle_knowledge
    FOR ALL USING (auth.role() = 'authenticated');
