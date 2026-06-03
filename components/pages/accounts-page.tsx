"use client";

import { Instagram, Youtube, Twitch, Twitter, Globe, Plus, CheckCircle2, FileText, Radar, Gift } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { useProfile } from "@/components/profile-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const PLATFORM_OPTIONS = ["youtube", "tiktok", "instagram", "twitter"] as const;

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  youtube: Youtube,
  tiktok: Twitch,
  instagram: Instagram,
  twitter: Twitter,
};

function platformIcon(platform: string): React.ElementType {
  return PLATFORM_ICONS[platform.toLowerCase()] ?? Globe;
}

export function AccountsPage() {
  const { profiles, isLoading, refreshProfiles, selectedProfileId, setSelectedProfileId } = useProfile();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNiche, setNewNiche] = useState("");
  const [newPlatforms, setNewPlatforms] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  const handleAddProfile = () => {
    if (!newName.trim() || !newNiche.trim() || newPlatforms.length === 0) {
      toast.error("Please fill in all fields and select at least one platform");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newName.trim(),
            niche: newNiche.trim(),
            platforms: newPlatforms,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error ?? "Failed to create account");
        }

        await refreshProfiles();
        setNewName("");
        setNewNiche("");
        setNewPlatforms([]);
        setShowAddForm(false);
        toast.success("Account added successfully");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create account");
      }
    });
  };

  const togglePlatform = (platform: string) => {
    setNewPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform],
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#2f2418]">Accounts</h1>
          <p className="mt-1 text-sm text-[#8a7a67]">
            Each account is a profile that powers your content, trends, and campaigns. Select one to make it active across the app.
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Account</CardTitle>
            <CardDescription>Create a profile to organize a niche and its platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                placeholder="e.g., My Fitness Channel"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="niche">Niche</Label>
              <Input
                id="niche"
                placeholder="e.g., Fitness"
                value={newNiche}
                onChange={(e) => setNewNiche(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_OPTIONS.map((platform) => {
                  const Icon = platformIcon(platform);
                  return (
                    <Button
                      key={platform}
                      type="button"
                      variant={newPlatforms.includes(platform) ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePlatform(platform)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddProfile} disabled={pending}>
                {pending ? "Adding..." : "Add Account"}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-lg font-medium text-[#2f2418]">No accounts yet</p>
            <p className="mt-2 text-sm text-[#8a7a67]">Click &ldquo;Add Account&rdquo; above to create your first account.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => {
            const isActive = profile.id === selectedProfileId;
            return (
              <Card key={profile.id} className={isActive ? "border-[#d6a43d] shadow-sm" : undefined}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{profile.name}</CardTitle>
                      <CardDescription className="mt-1">
                        <Badge variant="default" className="text-xs">
                          {profile.niche}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      {profile.platforms.map((platform) => {
                        const Icon = platformIcon(platform);
                        return (
                          <div
                            key={platform}
                            title={platform}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3e8d4] text-[#4c4033]"
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-[#8a7a67]"><FileText className="h-4 w-4" /> Content</span>
                    <span className="text-[#2f2418]">{profile._count?.content ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-[#8a7a67]"><Radar className="h-4 w-4" /> Trend alerts</span>
                    <span className="text-[#2f2418]">{profile._count?.trends ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-[#8a7a67]"><Gift className="h-4 w-4" /> Giveaways</span>
                    <span className="text-[#2f2418]">{profile._count?.giveaways ?? 0}</span>
                  </div>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    disabled={isActive}
                    onClick={() => {
                      setSelectedProfileId(profile.id);
                      toast.success(`${profile.name} is now the active account`);
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {isActive ? "Active" : "Set active"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
