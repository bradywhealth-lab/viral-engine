import type { ProfileSummary } from "@/lib/types";

let fallbackProfiles: ProfileSummary[] = [];

export function getFallbackProfiles() {
  return fallbackProfiles;
}

export function addFallbackProfile(profile: {
  name: string;
  niche: string;
  platforms: string[];
  avatarColor?: string;
}) {
  const nextProfile: ProfileSummary = {
    id: `fallback-${Date.now()}`,
    name: profile.name,
    niche: profile.niche,
    platforms: [...profile.platforms],
    avatarColor: profile.avatarColor ?? "#c084fc",
    createdAt: new Date().toISOString(),
    _count: {
      content: 0,
      trends: 0,
      giveaways: 0,
    },
  };

  fallbackProfiles = [...fallbackProfiles, nextProfile];
  return nextProfile;
}
