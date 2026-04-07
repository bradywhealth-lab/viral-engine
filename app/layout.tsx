import type { Metadata } from "next";

import { ConditionalShell } from "@/components/conditional-shell";
import { ProfileProvider } from "@/components/profile-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME ?? "Viral Engine Views",
  description: "Mine trends. Create content. Dominate your niche.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-[#0f1623] text-[#f0f4ff] antialiased">
        <ProfileProvider>
          <ConditionalShell>{children}</ConditionalShell>
        </ProfileProvider>
      </body>
    </html>
  );
}
