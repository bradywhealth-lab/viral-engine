import type { ProfileSummary } from "@/lib/types";

const defaultProfilesSeed = [
  {
    name: "King Cards",
    niche: "Sports Cards",
    platforms: ["tiktok", "instagram", "youtube"],
    avatarColor: "#f59e0b",
  },
  {
    name: "Chefs Corner",
    niche: "Cooking & Baking",
    platforms: ["instagram", "tiktok"],
    avatarColor: "#10b981",
  },
  {
    name: "BDUBB Faceless",
    niche: "Finance & AI Tools",
    platforms: ["tiktok", "instagram", "youtube"],
    avatarColor: "#6366f1",
  },
];

let fallbackProfiles: ProfileSummary[] = defaultProfilesSeed.map((profile, index) => ({
  ...profile,
  id: `fallback-${index + 1}`,
  createdAt: new Date(0).toISOString(),
  _count: {
    content: 0,
    trends: 0,
    giveaways: 0,
  },
}));

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
    avatarColor: profile.avatarColor ?? "#6366f1",
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
