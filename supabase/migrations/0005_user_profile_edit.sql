-- supabase/migrations/0005_user_profile_edit.sql

-- Add new columns for profile editing
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS username_changes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Backfill usernames for existing users so we can add UNIQUE constraint safely
UPDATE public.users
SET username = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '', 'g')) || '_' || substr(id::text, 1, 8)
WHERE username IS NULL;

-- Make sure username is not null and add UNIQUE constraint
ALTER TABLE public.users
ALTER COLUMN username SET NOT NULL;

-- Add UNIQUE constraint to username
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_username_key;

ALTER TABLE public.users
ADD CONSTRAINT users_username_key UNIQUE (username);

-- Update the handle_new_user function to auto-generate a unique username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
BEGIN
  -- Generate a base username from the name or email
  base_username := LOWER(REGEXP_REPLACE(COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'user'), '[^a-zA-Z0-9]', '', 'g'));
  -- Append a short uuid part to ensure uniqueness at sign up
  final_username := base_username || '_' || substr(new.id::text, 1, 8);

  INSERT INTO public.users (id, name, username)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', 'Unknown'),
    final_username
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Storage Buckets for Avatars and Covers
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatars
CREATE POLICY "Public Access avatars" ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' );
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'avatars' );
CREATE POLICY "Users can update their own avatars" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'avatars' AND auth.uid() = owner );
CREATE POLICY "Users can delete their own avatars" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'avatars' AND auth.uid() = owner );

-- RLS policies for covers
CREATE POLICY "Public Access covers" ON storage.objects FOR SELECT USING ( bucket_id = 'covers' );
CREATE POLICY "Authenticated users can upload covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'covers' );
CREATE POLICY "Users can update their own covers" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'covers' AND auth.uid() = owner );
CREATE POLICY "Users can delete their own covers" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'covers' AND auth.uid() = owner );
