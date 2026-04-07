"use client";

import { ChevronDown, Sparkles } from "lucide-react";

import { useProfile } from "@/components/profile-provider";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSwitcher() {
  const { profiles, selectedProfileId, setSelectedProfileId, isLoading } = useProfile();

  if (isLoading) {
    return <Skeleton className="h-12 w-full" />;
  }

  return (
    <div className="rounded-2xl border border-[#1e2d45] bg-[#0f1623]/80 p-3">
      <label htmlFor="profile-switcher" className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8899bb]">
        <Sparkles className="h-3.5 w-3.5" />
        Active Profile
      </label>
      <div className="relative">
        <select
          id="profile-switcher"
          className="h-11 w-full appearance-none rounded-xl border border-[#1e2d45] bg-[#141e2e] px-3 pr-10 text-sm text-[#f0f4ff] outline-none ring-0"
          value={selectedProfileId}
          onChange={(event) => setSelectedProfileId(event.target.value)}
        >
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-[#8899bb]" />
      </div>
    </div>
  );
}
