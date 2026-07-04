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

    const body = await request.json();
    const { content, image_url } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Insert into Supabase
    const title = content.split(' ').slice(0, 5).join(' ') + '...';

    const { data: pitch, error } = await supabase
      .from('pitches')
      .insert({
        title: title,
        description: content,
        author_id: user.id,
        image_url: image_url || null,
        likes: 0,
        comments: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create pitch' },
        { status: 500 }
      );
    }

    return NextResponse.json({ pitch });
  } catch (error) {
    console.error('Create pitch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
