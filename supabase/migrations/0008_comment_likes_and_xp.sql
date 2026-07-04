-- supabase/migrations/0008_comment_likes_and_xp.sql

-- Add likes column to comments table
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Policies for comment_likes
CREATE POLICY "Anyone can view comment_likes" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert comment_likes" ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comment_likes" ON public.comment_likes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comment_likes" ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Create RPC to handle comment voting and XP updates
CREATE OR REPLACE FUNCTION handle_comment_vote(p_comment_id UUID, p_user_id UUID, p_vote_type INTEGER)
RETURNS VOID AS $$
DECLARE
  v_old_vote INTEGER;
  v_author_id UUID;
BEGIN
  -- Get existing vote if any
  SELECT vote_type INTO v_old_vote FROM public.comment_likes WHERE comment_id = p_comment_id AND user_id = p_user_id;
  
  -- Get the author of the comment
  SELECT author_id INTO v_author_id FROM public.comments WHERE id = p_comment_id;

  IF p_vote_type = 0 THEN
    -- Remove vote
    IF v_old_vote IS NOT NULL THEN
      DELETE FROM public.comment_likes WHERE comment_id = p_comment_id AND user_id = p_user_id;
      UPDATE public.comments SET likes = likes - v_old_vote WHERE id = p_comment_id;
      
      -- Revert XP (Wait, if someone removes an upvote, we take the XP back)
      UPDATE public.users SET xp = xp - v_old_vote WHERE id = v_author_id;
    END IF;
  ELSIF v_old_vote IS NULL THEN
    -- Insert new vote
    INSERT INTO public.comment_likes (comment_id, user_id, vote_type) VALUES (p_comment_id, p_user_id, p_vote_type);
    UPDATE public.comments SET likes = likes + p_vote_type WHERE id = p_comment_id;
    
    -- Add XP based on the vote_type
    UPDATE public.users SET xp = xp + p_vote_type WHERE id = v_author_id;
  ELSIF v_old_vote != p_vote_type THEN
    -- Update existing vote
    UPDATE public.comment_likes SET vote_type = p_vote_type WHERE comment_id = p_comment_id AND user_id = p_user_id;
    -- changing from downvote (-1) to upvote (1) means difference is +2
    UPDATE public.comments SET likes = likes + (p_vote_type - v_old_vote) WHERE id = p_comment_id;
    
    -- Update XP similarly
    UPDATE public.users SET xp = xp + (p_vote_type - v_old_vote) WHERE id = v_author_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
