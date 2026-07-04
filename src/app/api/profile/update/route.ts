import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, avatar_url, cover_url } = await request.json();

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    // Get current user profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("username, username_changes_count")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const updates: any = {
      avatar_url,
      cover_url,
    };

    // Check if username has changed
    if (username !== profile.username) {
      if (profile.username_changes_count >= 2) {
        return NextResponse.json(
          { error: "You have reached the maximum number of username changes (2)." },
          { status: 403 }
        );
      }
      
      updates.username = username;
      updates.username_changes_count = profile.username_changes_count + 1;
    }

    // Update user profile
    const { error: updateError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id);

    if (updateError) {
      // Handle unique constraint violation for username
      if (updateError.code === "23505") { // PostgreSQL unique violation code
        return NextResponse.json(
          { error: "Username is already taken. Please choose another one." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
