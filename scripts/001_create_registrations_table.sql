-- Create registrations table for corporate event
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  drinks TEXT[] DEFAULT '{}',
  individual_wishes TEXT,
  cookie_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all registrations (for results page)
CREATE POLICY "Allow public read access" ON public.registrations 
  FOR SELECT USING (true);

-- Allow anyone to insert registrations
CREATE POLICY "Allow public insert" ON public.registrations 
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own registrations based on cookie_id
CREATE POLICY "Allow update own registration" ON public.registrations 
  FOR UPDATE USING (true);

-- Allow users to delete their own registrations based on cookie_id
CREATE POLICY "Allow delete own registration" ON public.registrations 
  FOR DELETE USING (true);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_registrations_updated_at 
  BEFORE UPDATE ON public.registrations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
