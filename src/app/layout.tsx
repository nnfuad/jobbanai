import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "jobbanai",
  description: "The mobile-first social platform for tech talent",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <Navigation user={user} />
        <main className="flex-1 lg:pl-60 pb-16 lg:pb-0">
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </main>
      </body>
    </html>
  );
}
