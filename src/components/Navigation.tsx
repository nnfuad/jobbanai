"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, PlusCircle, User, LogIn, LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { ThemeToggle } from "./ThemeToggle";

interface NavigationProps {
  user: SupabaseUser | null;
}

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const mainNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/matchmaker", label: "Matchmaker", icon: Sparkles },
    { href: "/create", label: "Create", icon: PlusCircle },
  ];

  const authNavItem = user
    ? { href: "/profile", label: "Profile", icon: User }
    : { href: "/login", label: "Sign in", icon: LogIn };

  const allNavItems = [...mainNavItems, authNavItem];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:border-r lg:border-[var(--border)] lg:bg-[var(--background)] lg:z-50 lg:px-5 lg:py-8">
        <Link href="/" className="flex items-center gap-3 mb-10 px-3 group">
          <div className="relative w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Jobbanai Logo" className="w-full h-full object-contain" />
          </div>
          <span className="logo-text hidden lg:block">jobbanai</span>
        </Link>

        <ul className="flex flex-col gap-1 flex-1">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[15px] font-medium ${
                    isActive
                      ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto flex flex-col gap-2 pt-4">
          <div className="px-3 flex items-center justify-between">
            <span className="text-[13px] font-medium text-[var(--muted)]">Theme</span>
            <ThemeToggle />
          </div>
          
          {user && (
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[15px] font-medium text-[var(--muted)] hover:bg-rose-500/10 hover:text-rose-500 w-full"
              >
                <LogOut className="w-5 h-5" strokeWidth={1.8} />
                Sign out
              </button>
            </form>
          )}
        </div>
      </nav>

      {/* Mobile Top Right Theme Toggle */}
      <div className="lg:hidden fixed top-4 right-4 z-50 bg-[var(--background)]/80 backdrop-blur-md rounded-full p-2 border border-[var(--border)] shadow-sm">
        <ThemeToggle />
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[var(--background)]/90 backdrop-blur-xl border-t border-[var(--border)] z-50">
        <ul className="flex justify-around items-center h-14">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] min-w-[44px] transition-colors ${
                    isActive
                      ? "text-[var(--accent)]"
                      : "text-[var(--muted)]"
                  }`}
                >
                  <Icon className="w-5 h-5 mb-0.5" strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
