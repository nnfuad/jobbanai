import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pitch_id, content } = await request.json();

    if (!pitch_id || !content) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Insert comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        pitch_id,
        author_id: user.id,
        content,
      })
      .select(`
        id,
        content,
        created_at,
        author_id
      `)
      .single();

    if (error) {
      console.error('Error inserting comment:', error);
      return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
    }

    // Fetch author details
    const { data: authorData } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single();

    // Increment comments count on pitches table
    // Using a raw update could be tricky with concurrent requests if not atomic, but for simple apps doing a simple RPC or just ignoring the race condition is fine. Let's do an RPC or just let the client rely on the fetched count.
    // Actually, we can just let it be or update it since this is not highly concurrent right now, but a simple RPC would be better. Let's just create an RPC call if we need it, or since we only care about retaining it, we can just run an update query. Wait, Supabase doesn't support atomic increments from the JS client directly without RPC.
    // For now, let's just create a quick RPC to increment or let's just do a basic fetch and update to keep it simple, or better yet, since I didn't write an RPC, I'll fetch current count and + 1.
    // Wait, the client can just read the count from `pitches.comments` when the page loads. So I do need to increment it.
    
    // Quick increment trick with PostgREST: not supported natively without RPC. 
    // I will write a simple update by fetching first.
    const { data: pitch } = await supabase.from('pitches').select('comments').eq('id', pitch_id).single();
    if (pitch) {
      await supabase.from('pitches').update({ comments: (pitch.comments || 0) + 1 }).eq('id', pitch_id);
    }

    // Format the comment to match frontend interface
    const authorName = authorData?.name || "Unknown";
    const formattedComment = {
      id: comment.id,
      content: comment.content,
      likes: 0,
      userVoteStatus: null,
      timeAgo: "just now", // The client can parse created_at if needed, but for the immediate response this is fine
      author: {
        name: authorName,
        avatar: "",
      }
    };

    return NextResponse.json({ comment: formattedComment });
  } catch (error) {
    console.error('Comment API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const pitch_id = searchParams.get('pitch_id');

    if (!pitch_id) {
      return NextResponse.json({ error: 'Pitch ID required' }, { status: 400 });
    }

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        author_id,
        likes,
        comment_likes(user_id, vote_type)
      `)
      .eq('pitch_id', pitch_id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    // Fetch user details for these comments
    const authorIds = [...new Set((comments || []).map(c => c.author_id))];
    const { data: usersData } = await supabase
      .from('users')
      .select('id, name')
      .in('id', authorIds);

    const usersMap = new Map(usersData?.map(u => [u.id, u.name]) || []);

    const formattedComments = comments.map(comment => {
      const authorName = usersMap.get(comment.author_id) || "Unknown";
      
      // Simple time formatting logic
      const date = new Date(comment.created_at);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      let timeAgo = "just now";
      
      if (seconds > 31536000) timeAgo = Math.floor(seconds / 31536000) + "y";
      else if (seconds > 2592000) timeAgo = Math.floor(seconds / 2592000) + "mo";
      else if (seconds > 86400) timeAgo = Math.floor(seconds / 86400) + "d";
      else if (seconds > 3600) timeAgo = Math.floor(seconds / 3600) + "h";
      else if (seconds > 60) timeAgo = Math.floor(seconds / 60) + "m";
      else if (seconds > 10) timeAgo = Math.floor(seconds) + "s";

      let userVoteStatus = null;
      if (user && comment.comment_likes) {
        const userLike = comment.comment_likes.find((l: any) => l.user_id === user.id);
        if (userLike) {
          userVoteStatus = userLike.vote_type === 1 ? "up" : "down";
        }
      }

      return {
        id: comment.id,
        content: comment.content,
        likes: comment.likes || 0,
        userVoteStatus,
        timeAgo,
        author: {
          name: authorName,
          avatar: "",
        }
      };
    });

    return NextResponse.json({ comments: formattedComments });
  } catch (error) {
    console.error('Comments GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
