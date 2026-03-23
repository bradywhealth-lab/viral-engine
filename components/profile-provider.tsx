"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { ProfileSummary } from "@/lib/types";

type ProfileContextValue = {
  profiles: ProfileSummary[];
  selectedProfileId: string;
  selectedProfile: ProfileSummary | null;
  isLoading: boolean;
  refreshProfiles: () => Promise<void>;
  setSelectedProfileId: (profileId: string) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [selectedProfileId, setSelectedProfileIdState] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profiles", { cache: "no-store" });
      const data = (await response.json()) as ProfileSummary[];
      setProfiles(data);

      const storedId = window.localStorage.getItem("selectedProfileId");
      const nextId = data.some((profile) => profile.id === storedId) ? storedId ?? "" : data[0]?.id ?? "";
      if (nextId) {
        setSelectedProfileIdState(nextId);
        window.localStorage.setItem("selectedProfileId", nextId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshProfiles();
  }, []);

  const setSelectedProfileId = (profileId: string) => {
    setSelectedProfileIdState(profileId);
    window.localStorage.setItem("selectedProfileId", profileId);
  };

  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId) ?? null;

  const value = useMemo(
    () => ({
      profiles,
      selectedProfileId,
      selectedProfile,
      isLoading,
      refreshProfiles,
      setSelectedProfileId,
    }),
    [profiles, selectedProfileId, selectedProfile, isLoading],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }

  return context;
}
