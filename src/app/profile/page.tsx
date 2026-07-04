import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Settings, Mail, Calendar } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import ResponsiveFeed from "@/components/ResponsiveFeed";
import { Pitch } from "@/components/PitchCard";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileDetails from "@/components/ProfileDetails";

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m";
  return Math.floor(seconds) + "s";
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = user.user_metadata?.name || user.email?.split("@")[0] || "User";
  const username = user.email?.split("@")[0] || "user";
  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Fetch the user's profile data (XP, etc.)
  const { data: profileData } = await supabase
    .from("users")
    .select("xp, username, avatar_url, cover_url, username_changes_count, education, experience, technical_skills")
    .eq("id", user.id)
    .single();
  
  const xp = profileData?.xp || 0;
  
  // Create user object for the header
  const headerUser = {
    id: user.id,
    name: name,
    username: profileData?.username || user.email?.split("@")[0] || "user",
    email: user.email || "",
    joinDate: joinDate,
    avatar_url: profileData?.avatar_url || null,
    cover_url: profileData?.cover_url || null,
    username_changes_count: profileData?.username_changes_count || 0
  };

  const detailsUser = {
    education: profileData?.education || [],
    experience: profileData?.experience || [],
    technical_skills: profileData?.technical_skills || []
  };

  // Fetch the user's pitches
  const { data: pitchesData, error } = await supabase
    .from("pitches")
    .select(`
      id,
      description,
      image_url,
      tags,
      likes,
      comments,
      created_at,
      author_id,
      author:users(name),
      pitch_likes(user_id, vote_type)
    `)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });

  let pitches: Pitch[] = [];

  if (!error && pitchesData) {
    pitches = pitchesData.map((p: any) => {
      const authorName = Array.isArray(p.author) ? p.author[0]?.name : p.author?.name || "Unknown";
      
      let userVoteStatus: "up" | "down" | null = null;
      if (p.pitch_likes) {
        const userLike = p.pitch_likes.find((l: any) => l.user_id === user.id);
        if (userLike) {
          userVoteStatus = userLike.vote_type === 1 ? "up" : "down";
        }
      }

      return {
        id: p.id,
        content: p.description,
        image_url: p.image_url,
        tags: p.tags || [],
        likes: p.likes || 0,
        comments: p.comments || 0,
        timeAgo: p.created_at ? formatTimeAgo(p.created_at) : "just now",
        userVoteStatus,
        author: {
          id: p.author_id,
          name: authorName,
          username: authorName.toLowerCase().replace(/[^a-z0-9]/g, ''),
          avatar: "", 
        }
      };
    });
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <ProfileHeader user={headerUser} />

      <div className="px-4 sm:px-6 max-w-3xl mx-auto">

        <div className="flex gap-5 mt-5 pb-4 border-b border-[var(--border)]">
          <div className="flex flex-col">
            <span className="font-bold text-lg">{pitches.length}</span>
            <span className="text-xs text-[var(--muted)]">Pitches</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg">0</span>
            <span className="text-xs text-[var(--muted)]">Followers</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-[var(--accent)]">{xp}</span>
            <span className="text-xs text-[var(--muted)]">XP</span>
          </div>
        </div>

        <div className="mt-8">
          <ProfileDetails user={detailsUser} isOwner={true} />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4 px-1">Pitches</h2>
          {pitches.length > 0 ? (
            <ResponsiveFeed 
              pitches={pitches} 
              isAuthenticated={true} 
              currentUserId={user.id}
            />
          ) : (
            <div className="flex justify-center text-[var(--muted)] py-12">
              <p className="text-sm">No pitches yet. Start sharing!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
