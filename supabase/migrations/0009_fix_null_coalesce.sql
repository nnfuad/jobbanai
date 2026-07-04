-- supabase/migrations/0009_fix_null_coalesce.sql

-- Backfill NULLs to 0 just in case there are any
UPDATE public.users SET xp = 0 WHERE xp IS NULL;
UPDATE public.pitches SET likes = 0 WHERE likes IS NULL;
UPDATE public.comments SET likes = 0 WHERE likes IS NULL;

-- Redefine handle_vote to use COALESCE to prevent NULL + 1 = NULL bugs
CREATE OR REPLACE FUNCTION handle_vote(p_pitch_id UUID, p_user_id UUID, p_vote_type INTEGER)
RETURNS VOID AS $$
DECLARE
  v_old_vote INTEGER;
  v_author_id UUID;
BEGIN
  SELECT vote_type INTO v_old_vote FROM public.pitch_likes WHERE pitch_id = p_pitch_id AND user_id = p_user_id;
  SELECT author_id INTO v_author_id FROM public.pitches WHERE id = p_pitch_id;

  IF p_vote_type = 0 THEN
    IF v_old_vote IS NOT NULL THEN
      DELETE FROM public.pitch_likes WHERE pitch_id = p_pitch_id AND user_id = p_user_id;
      UPDATE public.pitches SET likes = COALESCE(likes, 0) - v_old_vote WHERE id = p_pitch_id;
      UPDATE public.users SET xp = COALESCE(xp, 0) - v_old_vote WHERE id = v_author_id;
    END IF;
  ELSIF v_old_vote IS NULL THEN
    INSERT INTO public.pitch_likes (pitch_id, user_id, vote_type) VALUES (p_pitch_id, p_user_id, p_vote_type);
    UPDATE public.pitches SET likes = COALESCE(likes, 0) + p_vote_type WHERE id = p_pitch_id;
    UPDATE public.users SET xp = COALESCE(xp, 0) + p_vote_type WHERE id = v_author_id;
  ELSIF v_old_vote != p_vote_type THEN
    UPDATE public.pitch_likes SET vote_type = p_vote_type WHERE pitch_id = p_pitch_id AND user_id = p_user_id;
    UPDATE public.pitches SET likes = COALESCE(likes, 0) + (p_vote_type - v_old_vote) WHERE id = p_pitch_id;
    UPDATE public.users SET xp = COALESCE(xp, 0) + (p_vote_type - v_old_vote) WHERE id = v_author_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Redefine handle_comment_vote to use COALESCE
CREATE OR REPLACE FUNCTION handle_comment_vote(p_comment_id UUID, p_user_id UUID, p_vote_type INTEGER)
RETURNS VOID AS $$
DECLARE
  v_old_vote INTEGER;
  v_author_id UUID;
BEGIN
  SELECT vote_type INTO v_old_vote FROM public.comment_likes WHERE comment_id = p_comment_id AND user_id = p_user_id;
  SELECT author_id INTO v_author_id FROM public.comments WHERE id = p_comment_id;

  IF p_vote_type = 0 THEN
    IF v_old_vote IS NOT NULL THEN
      DELETE FROM public.comment_likes WHERE comment_id = p_comment_id AND user_id = p_user_id;
      UPDATE public.comments SET likes = COALESCE(likes, 0) - v_old_vote WHERE id = p_comment_id;
      UPDATE public.users SET xp = COALESCE(xp, 0) - v_old_vote WHERE id = v_author_id;
    END IF;
  ELSIF v_old_vote IS NULL THEN
    INSERT INTO public.comment_likes (comment_id, user_id, vote_type) VALUES (p_comment_id, p_user_id, p_vote_type);
    UPDATE public.comments SET likes = COALESCE(likes, 0) + p_vote_type WHERE id = p_comment_id;
    UPDATE public.users SET xp = COALESCE(xp, 0) + p_vote_type WHERE id = v_author_id;
  ELSIF v_old_vote != p_vote_type THEN
    UPDATE public.comment_likes SET vote_type = p_vote_type WHERE comment_id = p_comment_id AND user_id = p_user_id;
    UPDATE public.comments SET likes = COALESCE(likes, 0) + (p_vote_type - v_old_vote) WHERE id = p_comment_id;
    UPDATE public.users SET xp = COALESCE(xp, 0) + (p_vote_type - v_old_vote) WHERE id = v_author_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
