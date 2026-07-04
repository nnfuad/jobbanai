"use client";

import { useState } from "react";
import { Settings, Mail, Calendar } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import EditProfileModal from "./EditProfileModal";
import { useRouter } from "next/navigation";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    joinDate: string;
    avatar_url: string | null;
    cover_url: string | null;
    bio: string | null;
    username_changes_count: number;
  };
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();

  const handleUpdateSuccess = () => {
    // Refresh the page data
    router.refresh();
  };

  return (
    <>
      {/* Cover */}
      <div className="h-28 sm:h-40 bg-[var(--background)] w-full relative">
        {user.cover_url ? (
          <img src={user.cover_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[var(--accent)] to-cyan-500" />
        )}
      </div>

      <div className="px-4 sm:px-6 max-w-3xl mx-auto -mt-10 sm:-mt-14 relative z-10">
        <div className="flex justify-between items-end mb-4">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-[var(--background)] bg-[var(--card)] overflow-hidden flex items-center justify-center">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl sm:text-4xl font-bold text-[var(--muted)]">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="px-3 py-1.5 border border-[var(--border)] bg-[var(--background)] rounded-lg font-medium text-sm hover:bg-[var(--card-hover)] transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              Edit
            </button>
            <form action={logout}>
              <button
                type="submit"
                className="px-3 py-1.5 border border-rose-500/30 bg-[var(--background)] text-rose-500 rounded-lg font-medium text-sm hover:bg-rose-500/10 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-[var(--muted)] text-sm">@{user.username}</p>
        </div>

        {user.bio && (
          <div className="mt-3 text-sm text-[var(--foreground)] max-w-lg leading-relaxed">
            {user.bio}
          </div>
        )}

        <div className="flex flex-wrap gap-4 mt-4 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" />
            {user.email}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Joined {user.joinDate}
          </div>
        </div>
      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={user}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </>
  );
}
