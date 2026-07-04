-- supabase/migrations/0003_likes_and_comments.sql

-- Create pitch_likes table
CREATE TABLE IF NOT EXISTS public.pitch_likes (
  pitch_id UUID REFERENCES public.pitches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (pitch_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pitch_id UUID REFERENCES public.pitches(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pitch_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policies for pitch_likes
CREATE POLICY "Anyone can view pitch_likes" ON public.pitch_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert pitch_likes" ON public.pitch_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pitch_likes" ON public.pitch_likes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pitch_likes" ON public.pitch_likes FOR DELETE USING (auth.uid() = user_id);

-- Policies for comments
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = author_id);

-- Create RPC to handle voting (insert, update, or delete) and atomically update pitch likes
CREATE OR REPLACE FUNCTION handle_vote(p_pitch_id UUID, p_user_id UUID, p_vote_type INTEGER)
RETURNS VOID AS $$
DECLARE
  v_old_vote INTEGER;
BEGIN
  -- Get existing vote if any
  SELECT vote_type INTO v_old_vote FROM public.pitch_likes WHERE pitch_id = p_pitch_id AND user_id = p_user_id;

  IF p_vote_type = 0 THEN
    -- Remove vote
    IF v_old_vote IS NOT NULL THEN
      DELETE FROM public.pitch_likes WHERE pitch_id = p_pitch_id AND user_id = p_user_id;
      UPDATE public.pitches SET likes = likes - v_old_vote WHERE id = p_pitch_id;
    END IF;
  ELSIF v_old_vote IS NULL THEN
    -- Insert new vote
    INSERT INTO public.pitch_likes (pitch_id, user_id, vote_type) VALUES (p_pitch_id, p_user_id, p_vote_type);
    UPDATE public.pitches SET likes = likes + p_vote_type WHERE id = p_pitch_id;
  ELSIF v_old_vote != p_vote_type THEN
    -- Update existing vote
    UPDATE public.pitch_likes SET vote_type = p_vote_type WHERE pitch_id = p_pitch_id AND user_id = p_user_id;
    -- e.g., changing from downvote (-1) to upvote (1) means difference is +2
    UPDATE public.pitches SET likes = likes + (p_vote_type - v_old_vote) WHERE id = p_pitch_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
