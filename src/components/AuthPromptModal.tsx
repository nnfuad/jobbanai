"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, LogIn, UserPlus } from "lucide-react";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string; // e.g. "like", "comment", "post"
}

export default function AuthPromptModal({
  isOpen,
  onClose,
  action,
}: AuthPromptModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div className="relative w-full sm:max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 animate-slide-up shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)] rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-mid)] flex items-center justify-center shadow-lg shadow-[var(--gradient-mid)]/25">
            <LogIn className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold tracking-tight mb-1.5">
            Sign in to {action}
          </h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Join the jobbanai community to {action} pitches, connect with
            founders, and build your network.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2.5">
          <Link
            href="/login"
            className="w-full bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-mid)] hover:opacity-90 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98] shadow-lg shadow-[var(--gradient-mid)]/20"
          >
            <LogIn className="w-4 h-4" />
            Sign in
          </Link>
          <Link
            href="/signup"
            className="w-full bg-[var(--card-hover)] border border-[var(--border)] hover:border-[var(--muted)]/40 text-[var(--foreground)] font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            Create account
          </Link>
        </div>

        {/* Subtle divider */}
        <p className="text-center text-[11px] text-[var(--muted)] mt-5">
          You can still browse and share without an account
        </p>
      </div>
    </div>
  );
}
