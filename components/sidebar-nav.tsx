"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Flame, Gift, LayoutDashboard, LibraryBig, ListTodo, Radar, Search, Settings, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/content", label: "Content Queue", icon: ListTodo },
  { href: "/trends", label: "Trend Scanner", icon: Radar },
  { href: "/cards", label: "Cards Suite", icon: LibraryBig },
  { href: "/giveaways", label: "Giveaways", icon: Gift },
  { href: "/accounts", label: "Accounts", icon: Users },
  { href: "/research", label: "Research", icon: Search },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
              isActive ? "bg-[#4f8ef7] text-white" : "text-[#8899bb] hover:bg-[#1a2540] hover:text-[#f0f4ff]",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#1e2d45] bg-[#0f1623]/80 p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4f8ef7] via-[#38bdf8] to-[#4f8ef7] text-white">
        <Flame className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[#8899bb]">Creator OS</p>
        <h1 className="font-semibold text-[#f0f4ff]">{process.env.NEXT_PUBLIC_APP_NAME ?? "Viral Engine Views"}</h1>
      </div>
    </div>
  );
}
