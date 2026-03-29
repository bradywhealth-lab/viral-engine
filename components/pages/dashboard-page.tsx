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
        const seedResponse = await fetch("/api/seed", { method: "POST" });
        if (!seedResponse.ok) {
          console.error("Failed to seed default profiles", await seedResponse.json());
        }

        await refreshProfiles();
        const [profilesResponse, alertsResponse] = await Promise.all([
          fetch("/api/profiles", { cache: "no-store" }),
          fetch("/api/trends", { cache: "no-store" }),
        ]);

        if (cancelled) return;

        const profilesPayload: unknown = await profilesResponse.json();
        const alertsPayload: unknown = await alertsResponse.json();
        setProfiles(Array.isArray(profilesPayload) ? (profilesPayload as ProfileSummary[]) : []);
        setAlerts(Array.isArray(alertsPayload) ? (alertsPayload as TrendAlert[]) : []);
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
      <section className="rounded-[2rem] border border-zinc-800 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_35%),linear-gradient(135deg,rgba(24,24,27,0.95),rgba(9,9,11,0.95))] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Viral Command Center</p>
        <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">Mine trends. Ship content. Track what converts.</h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-300 md:text-base">
              One operating system for cards, cooking, and faceless growth accounts with AI-backed ideas, queue management, and campaign tools.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-zinc-200">
            <div className="rounded-2xl border border-zinc-700/80 bg-zinc-950/50 px-4 py-3">Trend velocity meter and hashtag extraction</div>
            <div className="rounded-2xl border border-zinc-700/80 bg-zinc-950/50 px-4 py-3">Cards resale intelligence and giveaway builder</div>
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
                      <p className="text-sm text-zinc-400">{stat.label}</p>
                      <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
                    </div>
                    <div className="rounded-2xl bg-zinc-800 p-3 text-amber-300">
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
                  <div key={profile.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl" style={{ backgroundColor: profile.avatarColor }} />
                      <div>
                        <h3 className="font-semibold text-white">{profile.name}</h3>
                        <p className="text-sm text-zinc-400">{profile.niche}</p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {profile.platforms.map((platform) => (
                        <Badge key={platform} variant="outline" className="capitalize">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-5 text-sm text-zinc-300">{profile._count?.content ?? 0} content items queued</div>
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
                <div key={alert.id} className="flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-white">{alert.keyword}</p>
                    <p className="text-sm text-zinc-400 capitalize">
                      {alert.platform} • {new Date(alert.detectedAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={alert.trendScore >= 60 ? "secondary" : "warning"}>Trend score {alert.trendScore}</Badge>
                </div>
              ))}
          {!isLoading && alerts.length === 0 ? <div className="text-sm text-zinc-500">No alerts yet. Run the Trend Scanner to start capturing opportunities.</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}
