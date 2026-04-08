import type { Metadata } from "next";

import { ConditionalShell } from "@/components/conditional-shell";
import { ProfileProvider } from "@/components/profile-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME ?? "Viral Engine Views",
  description: "Track trends, create content, and organize campaigns in one reusable workspace.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-[#f7f1e6] text-[#2f2418] antialiased">
        <ProfileProvider>
          <ConditionalShell>{children}</ConditionalShell>
        </ProfileProvider>
      </body>
    </html>
  );
}
