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
        const profilesResponse = await fetch("/api/profiles", { cache: "no-store" });
        if (cancelled) return;
        const profilesPayload: unknown = await profilesResponse.json();
        setProfiles(Array.isArray(profilesPayload) ? (profilesPayload as ProfileSummary[]) : []);

        const alertsResponse = await fetch("/api/trends", { cache: "no-store" });
        if (cancelled) return;
        const alertsPayload: unknown = await alertsResponse.json();
        setAlerts(Array.isArray(alertsPayload) ? (alertsPayload as TrendAlert[]) : []);

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
      <section className="rounded-[2rem] border border-[#e6dcc9] bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.12),transparent_35%),linear-gradient(135deg,rgba(255,251,245,0.98),rgba(248,241,229,0.98))] p-6 md:p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-[#9a7b39]">Creative workspace</p>
        <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#2f2418] md:text-5xl">Start with a blank slate, then build your workflow.</h1>
            <p className="mt-3 max-w-2xl text-sm text-[#6f6254] md:text-base">
              Track trends, shape ideas, and manage content across any niche from one clean, reusable workspace.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-[#4c4033]">
            <div className="rounded-2xl border border-[#eadfcd] bg-white/70 px-4 py-3">Create profiles only when you need them</div>
            <div className="rounded-2xl border border-[#eadfcd] bg-white/70 px-4 py-3">Generate ideas, schedule posts, and review alerts</div>
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
                      <p className="text-sm text-[#8a7a67]">{stat.label}</p>
                      <p className="mt-2 text-3xl font-semibold text-[#2f2418]">{stat.value}</p>
                    </div>
                    <div className="rounded-2xl bg-[#f4e7c8] p-3 text-[#9a7b39]">
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
            <CardTitle>Profiles</CardTitle>
            <CardDescription>Create your first profile to personalize this workspace.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-48 w-full" />)
              : profiles.length > 0
                ? profiles.map((profile) => (
                    <div key={profile.id} className="rounded-2xl border border-[#eadfcd] bg-[#fffaf2] p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl" style={{ backgroundColor: profile.avatarColor }} />
                        <div>
                          <h3 className="font-semibold text-[#2f2418]">{profile.name}</h3>
                          <p className="text-sm text-[#8a7a67]">{profile.niche}</p>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {profile.platforms.map((platform) => (
                          <Badge key={platform} variant="outline" className="capitalize">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-5 text-sm text-[#6f6254]">{profile._count?.content ?? 0} content items queued</div>
                    </div>
                  ))
                : (
                  <div className="md:col-span-3 rounded-2xl border border-dashed border-[#d9ccb7] bg-[#fffaf2] p-8 text-sm text-[#6f6254]">
                    No profiles yet. Add one from the sidebar to get started.
                  </div>
                )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into the core workflows when you are ready.</CardDescription>
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
                <div key={alert.id} className="flex flex-col gap-2 rounded-2xl border border-[#eadfcd] bg-[#fffaf2] p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-[#2f2418]">{alert.keyword}</p>
                    <p className="text-sm text-[#8a7a67] capitalize">
                      {alert.platform} • {new Date(alert.detectedAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={alert.trendScore >= 60 ? "secondary" : "warning"}>Trend score {alert.trendScore}</Badge>
                </div>
              ))}
          {!isLoading && alerts.length === 0 ? <div className="text-sm text-[#8a7a67]">No alerts yet. Run the Trend Scanner to start capturing opportunities.</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}
