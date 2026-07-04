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

    const { education, experience, technical_skills } = await request.json();

    const updates: any = {};
    if (education !== undefined) updates.education = education;
    if (experience !== undefined) updates.experience = experience;
    if (technical_skills !== undefined) updates.technical_skills = technical_skills;

    // Update user profile details
    const { error: updateError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
