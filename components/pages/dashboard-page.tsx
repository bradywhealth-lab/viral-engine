"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Radar, Sparkles, SquarePen } from "lucide-react";

import { useProfile } from "@/components/profile-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProfileSummary } from "@/lib/types";

type TrendAlert = {
  id: string;
  keyword: string;
  platform: string;
  trendScore: number;
  detectedAt: string;
};

export function DashboardPage() {
  const { refreshProfiles } = useProfile();
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [alerts, setAlerts] = useState<TrendAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        // Seed only if profiles are empty — checked via profiles API first
        const profilesResponse = await fetch("/api/profiles", { cache: "no-store" });
        if (cancelled) return;
        const profilesPayload: unknown = await profilesResponse.json();
        const existingProfiles = Array.isArray(profilesPayload) ? (profilesPayload as ProfileSummary[]) : [];

        // Only seed if no profiles exist yet
        if (existingProfiles.length === 0) {
          await fetch("/api/seed", { method: "POST" });
          if (cancelled) return;
          // Refresh profiles after seeding
          const seededResponse = await fetch("/api/profiles", { cache: "no-store" });
          if (cancelled) return;
          const seededPayload: unknown = await seededResponse.json();
          setProfiles(Array.isArray(seededPayload) ? (seededPayload as ProfileSummary[]) : []);
        } else {
          setProfiles(existingProfiles);
        }

        // Load alerts independently
        const alertsResponse = await fetch("/api/trends", { cache: "no-store" });
        if (cancelled) return;
        const alertsPayload: unknown = await alertsResponse.json();
        setAlerts(Array.isArray(alertsPayload) ? (alertsPayload as TrendAlert[]) : []);

        // Sync profile provider without triggering extra re-renders
        await refreshProfiles();
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load dashboard data", error);
          setProfiles([]);
          setAlerts([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [refreshProfiles]);

  const stats = {
    scheduled: profiles.reduce((sum, profile) => sum + (profile._count?.content ?? 0), 0),
    alerts: alerts.length,
    activeProfiles: profiles.length,
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-[#1e2d45] bg-[radial-gradient(circle_at_top_right,rgba(79,142,247,0.12),transparent_35%),linear-gradient(135deg,rgba(20,30,46,0.95),rgba(15,22,35,0.95))] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-[#38bdf8]">Viral Engine Views</p>
        <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">Mine trends. Ship content. Track what converts.</h1>
            <p className="mt-3 max-w-2xl text-sm text-[#f0f4ff]/80 md:text-base">
              One operating system for cards, cooking, and faceless growth accounts with AI-backed ideas, queue management, and campaign tools.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-[#f0f4ff]/90">
            <div className="rounded-2xl border border-[#1e2d45]/80 bg-[#0f1623]/50 px-4 py-3">Trend velocity meter and hashtag extraction</div>
            <div className="rounded-2xl border border-[#1e2d45]/80 bg-[#0f1623]/50 px-4 py-3">Cards resale intelligence and giveaway builder</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-28 w-full" />)
          : [
              { label: "Total Scheduled Posts", value: stats.scheduled, icon: CalendarClock },
              { label: "Total Alerts", value: stats.alerts, icon: Radar },
              { label: "Profiles Active", value: stats.activeProfiles, icon: Sparkles },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-sm text-[#8899bb]">{stat.label}</p>
                      <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
                    </div>
                    <div className="rounded-2xl bg-[#1a2540] p-3 text-[#38bdf8]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile Cards</CardTitle>
            <CardDescription>Default profiles are seeded on mount and ready for switching in the sidebar.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-48 w-full" />)
              : profiles.map((profile) => (
                  <div key={profile.id} className="rounded-2xl border border-[#1e2d45] bg-[#0f1623]/80 p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl" style={{ backgroundColor: profile.avatarColor }} />
                      <div>
                        <h3 className="font-semibold text-white">{profile.name}</h3>
                        <p className="text-sm text-[#8899bb]">{profile.niche}</p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {profile.platforms.map((platform) => (
                        <Badge key={platform} variant="outline" className="capitalize">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-5 text-sm text-[#f0f4ff]/80">{profile._count?.content ?? 0} content items queued</div>
                  </div>
                ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Fast paths into the highest-value workflows.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button className="justify-start gap-2" variant="secondary">
              <Radar className="h-4 w-4" /> Scan Trends
            </Button>
            <Button className="justify-start gap-2" variant="secondary">
              <Sparkles className="h-4 w-4" /> Generate Content
            </Button>
            <Button className="justify-start gap-2" variant="secondary">
              <SquarePen className="h-4 w-4" /> Add Post
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent Trend Alerts</CardTitle>
          <CardDescription>Latest scans saved across all profiles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-16 w-full" />)
            : alerts.map((alert) => (
                <div key={alert.id} className="flex flex-col gap-2 rounded-2xl border border-[#1e2d45] bg-[#0f1623]/70 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-white">{alert.keyword}</p>
                    <p className="text-sm text-[#8899bb] capitalize">
                      {alert.platform} • {new Date(alert.detectedAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={alert.trendScore >= 60 ? "secondary" : "warning"}>Trend score {alert.trendScore}</Badge>
                </div>
              ))}
          {!isLoading && alerts.length === 0 ? <div className="text-sm text-[#8899bb]">No alerts yet. Run the Trend Scanner to start capturing opportunities.</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}
