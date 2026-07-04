-- supabase/migrations/0002_add_images_and_metrics.sql

-- Add image_url, likes, and comments to pitches table
ALTER TABLE public.pitches
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments INTEGER DEFAULT 0;

-- Create pitch_images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('pitch_images', 'pitch_images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up Storage RLS policies for the new bucket
-- Enable RLS on objects (it should be by default, but just in case)
-- (Objects table already has RLS enabled by Supabase setup, we just need policies)

-- Public read access to pitch_images
CREATE POLICY "Public Access pitch_images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'pitch_images' );

-- Authenticated insert access to pitch_images
CREATE POLICY "Authenticated users can upload pitch_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'pitch_images' );

-- Allow users to update/delete their own images
CREATE POLICY "Users can update their own pitch_images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'pitch_images' AND auth.uid() = owner );

CREATE POLICY "Users can delete their own pitch_images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'pitch_images' AND auth.uid() = owner );
