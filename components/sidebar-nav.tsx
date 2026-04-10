"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Flame, Gift, LayoutDashboard, LogOut, Megaphone, Newspaper, Users2 } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/content", label: "Content Queue", icon: Newspaper },
  { href: "/trends", label: "Trend Scanner", icon: BarChart3 },
  { href: "/accounts", label: "Accounts", icon: Users2 },
  { href: "/giveaways", label: "Giveaways", icon: Gift },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
];

export function SidebarBrand() {
  return (
    <div className="rounded-[2rem] border border-[#e2d6c2] bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.14),transparent_45%),linear-gradient(135deg,#fffaf2,#f3e8d4)] p-5 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d6a43d] to-[#f0c96a] text-white shadow-md">
        <Flame className="h-5 w-5" />
      </div>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.24em] text-[#8a7a67]">Viral engine</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#2f2418]">Reusable creator OS</h1>
        <p className="mt-2 text-sm text-[#6f6254]">A clean workspace for trends, content, campaigns, and profile management.</p>
      </div>
    </div>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    localStorage.removeItem("vev-auth");
    router.push("/auth");
  };

  return (
    <nav className="flex h-full flex-col">
    <div className="space-y-2 flex-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
              isActive
                ? "bg-[#f4e7c8] text-[#2f2418] shadow-sm"
                : "text-[#6f6254] hover:bg-white/70 hover:text-[#2f2418]",
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl border transition-all",
                isActive
                  ? "border-[#e2c989] bg-white text-[#9a7b39]"
                  : "border-[#e6dcc9] bg-[#fffaf2] text-[#8a7a67]",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
    <div className="mt-4 border-t border-[#e2d6c2] pt-4">
      <button
        onClick={handleSignOut}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#6f6254] transition-all hover:bg-white/70 hover:text-[#2f2418]"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#e6dcc9] bg-[#fffaf2] text-[#8a7a67]">
          <LogOut className="h-4 w-4" />
        </span>
        <span>Sign Out</span>
      </button>
    </div>
    </nav>
  );
}
