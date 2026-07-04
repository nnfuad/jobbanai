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

    const { pitch_id, vote_type } = await request.json();

    if (!pitch_id || vote_type === undefined) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Call the RPC function to handle the vote transaction
    const { error } = await supabase.rpc('handle_vote', {
      p_pitch_id: pitch_id,
      p_user_id: user.id,
      p_vote_type: vote_type,
    });

    if (error) {
      console.error('Error handling vote:', error);
      return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vote API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
