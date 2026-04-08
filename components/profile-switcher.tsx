"use client";

import { ChevronDown, Sparkles } from "lucide-react";

import { useProfile } from "@/components/profile-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProfileSwitcher() {
  const { profiles, selectedProfileId, setSelectedProfileId, isLoading } = useProfile();

  return (
    <div className="rounded-3xl border border-[#e2d6c2] bg-white/80 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#8a7a67]">Workspace</p>
          <h2 className="mt-2 text-lg font-semibold text-[#2f2418]">Active profile</h2>
        </div>
        <div className="rounded-2xl bg-[#f4e7c8] p-3 text-[#9a7b39]">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4">
        <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
          <SelectTrigger className="h-12 rounded-2xl border-[#decfb7] bg-[#fffaf2] text-[#2f2418]">
            <SelectValue placeholder={isLoading ? "Loading profiles..." : profiles.length ? "Select a profile" : "No profiles yet"} />
            <ChevronDown className="h-4 w-4 text-[#8a7a67]" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="mt-3 text-sm text-[#6f6254]">
        {profiles.length
          ? "Switch between profiles to update dashboard data, content, and trends."
          : "Create a profile to start organizing content and trend workflows."}
      </p>
    </div>
  );
}
