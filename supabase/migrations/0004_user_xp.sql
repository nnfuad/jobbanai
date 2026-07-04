-- supabase/migrations/0004_user_xp.sql

-- Add xp column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;

-- Update the handle_vote function to also increment XP of the pitch author
CREATE OR REPLACE FUNCTION handle_vote(p_pitch_id UUID, p_user_id UUID, p_vote_type INTEGER)
RETURNS VOID AS $$
DECLARE
  v_old_vote INTEGER;
  v_author_id UUID;
BEGIN
  -- Get existing vote if any
  SELECT vote_type INTO v_old_vote FROM public.pitch_likes WHERE pitch_id = p_pitch_id AND user_id = p_user_id;
  
  -- Get the author of the pitch
  SELECT author_id INTO v_author_id FROM public.pitches WHERE id = p_pitch_id;

  IF p_vote_type = 0 THEN
    -- Remove vote
    IF v_old_vote IS NOT NULL THEN
      DELETE FROM public.pitch_likes WHERE pitch_id = p_pitch_id AND user_id = p_user_id;
      UPDATE public.pitches SET likes = likes - v_old_vote WHERE id = p_pitch_id;
      
      -- Decrease XP (assuming each point of vote is 1 XP, so +1 gives 1, -1 gives -1)
      -- Wait, the requirement says "add points to profile for each upvote user receives". 
      -- Let's say XP = XP - v_old_vote to revert it.
      UPDATE public.users SET xp = xp - v_old_vote WHERE id = v_author_id;
    END IF;
  ELSIF v_old_vote IS NULL THEN
    -- Insert new vote
    INSERT INTO public.pitch_likes (pitch_id, user_id, vote_type) VALUES (p_pitch_id, p_user_id, p_vote_type);
    UPDATE public.pitches SET likes = likes + p_vote_type WHERE id = p_pitch_id;
    
    -- Add XP based on the vote_type
    UPDATE public.users SET xp = xp + p_vote_type WHERE id = v_author_id;
  ELSIF v_old_vote != p_vote_type THEN
    -- Update existing vote
    UPDATE public.pitch_likes SET vote_type = p_vote_type WHERE pitch_id = p_pitch_id AND user_id = p_user_id;
    -- e.g., changing from downvote (-1) to upvote (1) means difference is +2
    UPDATE public.pitches SET likes = likes + (p_vote_type - v_old_vote) WHERE id = p_pitch_id;
    
    -- Update XP similarly
    UPDATE public.users SET xp = xp + (p_vote_type - v_old_vote) WHERE id = v_author_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
