"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    username: string;
    avatar_url: string | null;
    cover_url: string | null;
    bio: string | null;
    username_changes_count: number;
  };
  onUpdateSuccess: () => void;
}

export default function EditProfileModal({ isOpen, onClose, user, onUpdateSuccess }: EditProfileModalProps) {
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar_url);
  const [coverPreview, setCoverPreview] = useState(user.cover_url);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();
  const maxUsernameChanges = 2;
  const canChangeUsername = user.username_changes_count < maxUsernameChanges;

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (bucket: string, file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      throw new Error(`Failed to upload to ${bucket}: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let finalAvatarUrl = user.avatar_url;
      let finalCoverUrl = user.cover_url;

      if (avatarFile) {
        finalAvatarUrl = await uploadImage('avatars', avatarFile, user.id);
      }

      if (coverFile) {
        finalCoverUrl = await uploadImage('covers', coverFile, user.id);
      }

      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          bio,
          avatar_url: finalAvatarUrl,
          cover_url: finalCoverUrl
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      onUpdateSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-md overflow-hidden relative">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="font-bold text-lg">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--card-hover)] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[var(--muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Cover Page</label>
            <div 
              className="h-28 w-full bg-gradient-to-r from-[var(--accent)] to-cyan-500 rounded-xl overflow-hidden relative group cursor-pointer border border-[var(--border)]"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview && (
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={coverInputRef} 
              onChange={handleCoverChange} 
            />
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div 
                className="w-20 h-20 rounded-full border-2 border-[var(--border)] bg-[var(--background)] overflow-hidden relative group cursor-pointer flex-shrink-0"
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-[var(--muted)]">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
              </div>
              <button 
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Change photo
              </button>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={avatarInputRef} 
                onChange={handleAvatarChange} 
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-[var(--muted)]">Username</label>
              <span className="text-xs text-[var(--muted)]">
                Changes: {user.username_changes_count}/{maxUsernameChanges}
              </span>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim().toLowerCase())}
              disabled={!canChangeUsername}
              className={`w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-sm ${!canChangeUsername ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="username"
              required
            />
            {!canChangeUsername && (
              <p className="text-xs text-rose-500 mt-1">
                You have reached the maximum number of username changes.
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-sm resize-none h-24"
              placeholder="Tell us a little bit about yourself..."
              maxLength={160}
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-[var(--muted)]">{bio.length}/160</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-[var(--card-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium bg-[var(--accent)] text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
