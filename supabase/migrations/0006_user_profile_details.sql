-- supabase/migrations/0006_user_profile_details.sql

-- Add columns for education and experience as JSONB arrays
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]'::jsonb;
