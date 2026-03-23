import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { ProfileProvider } from "@/components/profile-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME ?? "Viral Content Miner",
  description: "AI trend scanner, content queue, card suite, giveaways, and analytics.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white antialiased">
        <ProfileProvider>
          <AppShell>{children}</AppShell>
        </ProfileProvider>
      </body>
    </html>
  );
}
