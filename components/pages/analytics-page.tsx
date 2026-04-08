"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const viewData = Array.from({ length: 30 }).map((_, index) => ({
  day: `${index + 1}`,
  KingCards: 1200 + index * 95,
  ChefsCorner: 900 + index * 65,
  BDUBB: 1400 + index * 110,
}));

const engagementData = [
  { platform: "TikTok", engagement: 78 },
  { platform: "Instagram", engagement: 63 },
  { platform: "YouTube", engagement: 49 },
];

const contentTypeData = [
  { type: "Reels", score: "32% share rate" },
  { type: "Market Intel", score: "28% save rate" },
  { type: "Giveaways", score: "3.4x comments" },
  { type: "Story Posts", score: "18% CTR" },
];

const ViewsChart = dynamic(() => import("@/components/analytics-charts").then((mod) => mod.ViewsChart), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

const EngagementChart = dynamic(() => import("@/components/analytics-charts").then((mod) => mod.EngagementChart), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export function AnalyticsPage() {
  const [bestTimes, setBestTimes] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const response = await fetch("/api/analytics/best-times", { cache: "no-store" });
      setBestTimes((await response.json()) as Record<string, string[]>);
      setLoading(false);
    };
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[#2f2418]">Analytics</h1>
        <p className="mt-1 text-sm text-[#8a7a67]">Mock dashboard signals for views, engagement, posting windows, and format performance.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Views Over Last 30 Days</CardTitle>
            <CardDescription>Mock performance trend by profile.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ViewsChart data={viewData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement by Platform</CardTitle>
            <CardDescription>Mock comparative performance score.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <EngagementChart data={engagementData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Best Times To Post</CardTitle>
            <CardDescription>Hardcoded response from the analytics API.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(bestTimes).map(([platform, times]) => (
                  <div key={platform} className="rounded-2xl border border-[#e2d6c2] bg-[#fffaf2] p-5">
                    <p className="text-sm font-medium capitalize text-[#2f2418]">{platform}</p>
                    <div className="mt-4 space-y-2 text-sm text-[#4c4033]">
                      {times.map((time) => (
                        <div key={time} className="rounded-xl bg-[#f3e8d4] px-3 py-2">
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Content Types</CardTitle>
            <CardDescription>Mock winners from recent campaigns.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {contentTypeData.map((item) => (
              <div key={item.type} className="rounded-2xl border border-[#e2d6c2] bg-[#fffaf2] p-4">
                <p className="font-medium text-[#2f2418]">{item.type}</p>
                <p className="mt-1 text-sm text-[#8a7a67]">{item.score}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
