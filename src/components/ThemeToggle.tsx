"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-12 h-6 rounded-full bg-[var(--border)] flex items-center px-1">
        <div className="w-4 h-4 rounded-full bg-[var(--background)]" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-6 w-12 items-center rounded-full bg-[var(--border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      aria-label="Toggle theme"
    >
      <span
        className={`${
          isDark ? "translate-x-7" : "translate-x-1"
        } inline-block h-4 w-4 transform rounded-full bg-[var(--background)] transition-transform duration-200 ease-in-out shadow-sm`}
      >
        <span className="absolute inset-0 flex items-center justify-center">
          {isDark ? (
            <Moon className="h-3 w-3 text-[var(--foreground)]" />
          ) : (
            <Sun className="h-3 w-3 text-[var(--foreground)]" />
          )}
        </span>
      </span>
    </button>
  );
}
