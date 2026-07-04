"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Send, Sparkles, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateForm() {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setError(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !agreedToTerms) return;

    setLoading(true);
    setError(null);

    try {
      let imageUrl = null;

      // 1. Upload image if exists
      if (imageFile) {
        const supabase = createClient();
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('pitch_images')
          .upload(filePath, imageFile);

        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('pitch_images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // 2. Submit to API
      const res = await fetch("/api/pitches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          image_url: imageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create pitch");
      }

      // 3. Success
      setContent("");
      setAgreedToTerms(false);
      removeImage();
      router.push("/");
      router.refresh();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6">
          <h1 className="text-xl font-bold tracking-tight">Create Pitch</h1>
          <p className="text-[var(--muted)] mt-1 text-sm">
            Share an idea, look for a co-founder, or broadcast your skills.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 sm:p-5"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
              {error}
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are you working on or looking for?"
            className="w-full min-h-[150px] sm:min-h-[200px] bg-transparent text-[15px] placeholder:text-[var(--muted)] resize-none outline-none mb-4 disabled:opacity-50"
            disabled={loading}
            required
          />

          {imagePreview && (
            <div className="relative inline-block mb-4">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-64 rounded-lg object-contain border border-[var(--border)]"
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={loading}
                className="absolute -top-2 -right-2 p-1 bg-black/80 hover:bg-black text-white rounded-full border border-[var(--border)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="mb-4 flex items-start gap-2">
            <input 
              type="checkbox" 
              id="terms" 
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              disabled={loading}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <label htmlFor="terms" className="text-sm text-[var(--muted)]">
              I agree to the <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Terms and Conditions</Link> and confirm this post follows the platform guidelines.
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
            <div className="flex gap-1">
              <input 
                type="file" 
                accept="image/*"
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageSelect}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="p-2 text-[var(--accent)] hover:bg-[var(--accent)]/8 rounded-lg transition-colors disabled:opacity-50"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                disabled={loading}
                className="p-2 text-purple-500 hover:bg-purple-500/8 rounded-lg transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!content.trim() || !agreedToTerms || loading}
              className="px-5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
            >
              <span className="hidden sm:inline">
                {loading ? "Posting..." : "Post Pitch"}
              </span>
              {loading ? <Loader2 className="w-4 h-4 animate-spin sm:hidden" /> : <Send className="w-4 h-4 sm:hidden" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
