"use client";

import { Instagram, Youtube, Twitch, Plus, Eye } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

type Platform = "youtube" | "tiktok" | "instagram";

interface Account {
  id: string;
  name: string;
  niche: string;
  platforms: Platform[];
  postCount: number;
  followerCount: number;
}

type AutomationMode = "full" | "semi" | "manual";

const PLATFORM_ICONS: Record<Platform, React.ElementType> = {
  youtube: Youtube,
  tiktok: Twitch,
  instagram: Instagram,
};

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountNiche, setNewAccountNiche] = useState("");
  const [newAccountPlatforms, setNewAccountPlatforms] = useState<Platform[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/accounts");
      if (!response.ok) throw new Error("Failed to load accounts");
      const data = await response.json();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const getAutomationMode = (accountId: string): AutomationMode => {
    if (typeof window === "undefined") return "manual";
    const saved = localStorage.getItem(`automation_mode_${accountId}`);
    return (saved as AutomationMode) ?? "manual";
  };

  const setAutomationMode = (accountId: string, mode: AutomationMode) => {
    localStorage.setItem(`automation_mode_${accountId}`, mode);
    toast.success(`Automation mode for ${accounts.find((a) => a.id === accountId)?.name} set to ${mode}`);
  };

  const handleAddAccount = async () => {
    if (!newAccountName.trim() || !newAccountNiche.trim() || newAccountPlatforms.length === 0) {
      toast.error("Please fill in all fields and select at least one platform");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newAccountName,
            niche: newAccountNiche,
            platforms: newAccountPlatforms,
          }),
        });

        if (!response.ok) throw new Error("Failed to create account");

        const newAccount = await response.json();
        setAccounts([...accounts, newAccount]);
        setNewAccountName("");
        setNewAccountNiche("");
        setNewAccountPlatforms([]);
        setShowAddForm(false);
        toast.success("Account added successfully");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create account");
      }
    });
  };

  const togglePlatform = (platform: Platform) => {
    setNewAccountPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform],
    );
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#2f2418]">Accounts</h1>
          <p className="mt-1 text-sm text-[#8a7a67]">Manage your social media accounts and automation settings.</p>
        </div>
        <Card className="border-red-500/30 bg-red-900/10">
          <CardContent className="p-6">
            <p className="text-red-300">Error: {error}</p>
            <Button onClick={loadAccounts} variant="outline" className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#2f2418]">Accounts</h1>
          <p className="mt-1 text-sm text-[#8a7a67]">Manage your social media accounts and automation settings.</p>
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
            <CardDescription>Connect a new social media account to manage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                placeholder="e.g., My Fitness Channel"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="niche">Niche</Label>
              <Input
                id="niche"
                placeholder="e.g., Fitness"
                value={newAccountNiche}
                onChange={(e) => setNewAccountNiche(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Platforms</Label>
              <div className="flex gap-2">
                {(["youtube", "tiktok", "instagram"] as Platform[]).map((platform) => {
                  const Icon = PLATFORM_ICONS[platform];
                  return (
                    <Button
                      key={platform}
                      type="button"
                      variant={newAccountPlatforms.includes(platform) ? "default" : "outline"}
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
              <Button onClick={handleAddAccount} disabled={pending}>
                Add Account
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-lg font-medium text-[#2f2418]">No accounts yet</p>
            <p className="mt-2 text-sm text-[#8a7a67]">Click &ldquo;Add Account&rdquo; above to create your first social media account.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                    <CardDescription className="mt-1">
                      <Badge variant="default" className="text-xs">
                        {account.niche}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    {account.platforms.map((platform) => {
                      const Icon = PLATFORM_ICONS[platform];
                      return (
                        <div
                          key={platform}
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
                  <span className="text-[#8a7a67]">Posts</span>
                  <span className="text-[#2f2418]">{account.postCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8a7a67]">Followers</span>
                  <span className="text-[#2f2418]">{account.followerCount.toLocaleString()}</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-[#8a7a67]">Automation Mode</Label>
                  <div className="flex gap-1">
                    {(["full", "semi", "manual"] as AutomationMode[]).map((mode) => (
                      <Button
                        key={mode}
                        variant={getAutomationMode(account.id) === mode ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setAutomationMode(account.id, mode)}
                      >
                        {mode === "full" ? "Full Auto" : mode === "semi" ? "Semi" : "Manual"}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
