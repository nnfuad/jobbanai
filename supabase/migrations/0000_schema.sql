-- supabase/migrations/0000_schema.sql

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  university_location TEXT,
  technical_skills TEXT[] DEFAULT '{}',
  looking_for TEXT
);

-- Table: pitches
CREATE TABLE IF NOT EXISTS public.pitches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;

-- Basic Policies for Users
CREATE POLICY "Users can view any profile" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Basic Policies for Pitches
CREATE POLICY "Anyone can view pitches" ON public.pitches FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create pitches" ON public.pitches FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own pitches" ON public.pitches FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own pitches" ON public.pitches FOR DELETE USING (auth.uid() = author_id);

-- Trigger to automatically create a public.users row upon auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'Unknown'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
