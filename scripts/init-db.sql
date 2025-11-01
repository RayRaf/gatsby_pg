-- Initialize database for Gatsby Corporate Event application
-- This script replaces the Supabase-specific version with standard PostgreSQL

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_registrations_cookie_id ON public.registrations(cookie_id);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON public.registrations(created_at DESC);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_registrations_updated_at ON public.registrations;
CREATE TRIGGER update_registrations_updated_at 
  BEFORE UPDATE ON public.registrations 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some test data (optional, comment out if not needed)
-- INSERT INTO public.registrations (name, drinks, individual_wishes, cookie_id) VALUES
--   ('Тестовый Пользователь', ARRAY['Шампанское', 'Вино'], 'С наступающим!', 'test-cookie-1'),
--   ('Иван Иванов', ARRAY['Виски'], 'Хочу караоке!', 'test-cookie-2')
-- ON CONFLICT (cookie_id) DO NOTHING;
