"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { ProfileSwitcher } from "@/components/profile-switcher";
import { SidebarBrand, SidebarNav } from "@/components/sidebar-nav";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Toaster />
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden w-80 border-r border-zinc-900 bg-zinc-900/80 px-5 py-6 lg:flex lg:flex-col">
          <SidebarBrand />
          <div className="mt-6">
            <ProfileSwitcher />
          </div>
          <div className="mt-6 flex-1">
            <SidebarNav />
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/90 px-4 py-4 backdrop-blur md:px-6 lg:hidden">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="left-0 top-0 h-screen max-w-sm translate-x-0 translate-y-0 rounded-none border-r border-zinc-800">
                <SidebarBrand />
                <div className="mt-6">
                  <ProfileSwitcher />
                </div>
                <div className="mt-6">
                  <SidebarNav onNavigate={() => setOpen(false)} />
                </div>
              </DialogContent>
            </Dialog>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Dashboard</p>
              <p className="font-semibold text-white">{process.env.NEXT_PUBLIC_APP_NAME ?? "Viral Content Miner"}</p>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
