import ResponsiveFeed from "@/components/ResponsiveFeed";
import { Pitch } from "@/components/PitchCard";
import { createClient } from "@/utils/supabase/server";

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

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  // Fetch real pitches
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
      author:users(name),
      pitch_likes(user_id, vote_type)
    `)
    .order('created_at', { ascending: false });

  let pitches: Pitch[] = [];

  if (!error && pitchesData) {
    pitches = pitchesData.map((p: any) => {
      // author is returned as an object or array of objects depending on relation type, usually single object for many-to-one
      const authorName = Array.isArray(p.author) ? p.author[0]?.name : p.author?.name || "Unknown";
      
      // Determine if current user liked this pitch
      let userVoteStatus: "up" | "down" | null = null;
      if (user && p.pitch_likes) {
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
          name: authorName,
          username: authorName.toLowerCase().replace(/[^a-z0-9]/g, ''),
          avatar: "", // Can be updated if avatar URL is added to users table
        }
      };
    });
  }

  return (
    <div className="min-h-screen">
      <header className="gradient-border-bottom px-4 sm:px-6 py-5 sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Jobbanai Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight heading-gradient">
              Trending Pitches
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="pulse-dot"></div>
              <p className="text-[var(--muted)] text-xs font-medium">
                Live — discover opportunities and talent in tech
              </p>
            </div>
          </div>
        </div>
      </header>

      <ResponsiveFeed pitches={pitches} isAuthenticated={isAuthenticated} />
    </div>
  );
}
