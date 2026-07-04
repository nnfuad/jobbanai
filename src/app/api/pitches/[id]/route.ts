import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Pitch ID required' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // The RLS policy on the pitches table ensures that users can only delete their own pitches.
    const { error } = await supabase
      .from('pitches')
      .delete()
      .eq('id', id)
      .eq('author_id', user.id);

    if (error) {
      console.error('Error deleting pitch:', error);
      return NextResponse.json(
        { error: 'Failed to delete pitch' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete pitch API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Pitch ID required' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // The RLS policy ensures users can only update their own pitches.
    const { data: updatedPitch, error } = await supabase
      .from('pitches')
      .update({ description: content })
      .eq('id', id)
      .eq('author_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating pitch:', error);
      return NextResponse.json(
        { error: 'Failed to update pitch' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, pitch: updatedPitch });
  } catch (error) {
    console.error('Update pitch API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
