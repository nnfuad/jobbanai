import ResponsiveFeed from "@/components/ResponsiveFeed";
import { Pitch } from "@/components/PitchCard";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

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

export default async function Home(props: { searchParams: Promise<{ sort?: string }> }) {
  const searchParams = await props.searchParams;
  const sort = searchParams?.sort || 'recent';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  let query = supabase
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
    `);

  if (sort === 'popular') {
    query = query.order('likes', { ascending: false }).order('created_at', { ascending: false }).limit(50);
  } else if (sort === 'recent') {
    query = query.order('created_at', { ascending: false }).limit(50);
  } else if (sort === 'random') {
    query = query.limit(50); // Fetch without specific order, shuffle in JS
  }

  const { data: pitchesData, error } = await query;

  let pitches: Pitch[] = [];

  if (!error && pitchesData) {
    pitches = pitchesData.map((p: any) => {
      const authorName = Array.isArray(p.author) ? p.author[0]?.name : p.author?.name || "Unknown";
      
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
          id: p.author_id,
          name: authorName,
          username: authorName.toLowerCase().replace(/[^a-z0-9]/g, ''),
          avatar: "", 
        }
      };
    });

    if (sort === 'random') {
      pitches = pitches.sort(() => Math.random() - 0.5);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="gradient-border-bottom px-4 sm:px-6 py-5 sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-lg">
        <div className="flex flex-col gap-4">
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
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Link 
              href="/?sort=recent" 
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${sort === 'recent' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
            >
              Recent
            </Link>
            <Link 
              href="/?sort=popular" 
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${sort === 'popular' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
            >
              Popular
            </Link>
            <Link 
              href="/?sort=random" 
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${sort === 'random' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
            >
              Random
            </Link>
          </div>
        </div>
      </header>

      <ResponsiveFeed 
        pitches={pitches} 
        isAuthenticated={isAuthenticated} 
        currentUserId={user?.id}
      />
    </div>
  );
}
