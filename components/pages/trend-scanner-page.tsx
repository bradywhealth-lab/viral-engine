"use client";

import { useState } from "react";

import { useProfile } from "@/components/profile-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { TrendScanResponse } from "@/lib/types";

export function TrendScannerPage() {
  const { selectedProfile } = useProfile();
  const [keyword, setKeyword] = useState("");
  const [niche, setNiche] = useState("Sports Cards");
  const [platform, setPlatform] = useState("tiktok");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrendScanResponse | null>(null);

  const runScan = async () => {
    if (!selectedProfile) return;
    setLoading(true);
    try {
      const response = await fetch("/api/trends/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword,
          niche,
          platform,
          profileId: selectedProfile.id,
        }),
      });
      setResult((await response.json()) as TrendScanResponse);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[#2f2418]">Trend Scanner</h1>
        <p className="mt-1 text-sm text-[#8a7a67]">Search by keyword, niche, and platform to capture current momentum and convert it into ideas.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Trends</CardTitle>
          <CardDescription>Uses Firecrawl for recent result discovery and AI for idea synthesis.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="keyword">Keyword</Label>
            <Input id="keyword" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="rookie cards" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="niche">Niche</Label>
            <Input id="niche" value={niche} onChange={(event) => setNiche(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="platform">Platform</Label>
            <Input id="platform" value={platform} onChange={(event) => setPlatform(event.target.value)} />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={runScan} disabled={!selectedProfile || !keyword.trim() || loading}>
              {loading ? "Scanning..." : "Scan Trends"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Skeleton className="h-80 w-full" />
      ) : result ? (
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Card>
            <CardHeader>
              <CardTitle>Trend Score</CardTitle>
              <CardDescription>Calculated from Firecrawl result volume for the scan query.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-3xl border border-[#e2d6c2] bg-[#fffaf2] p-6">
                <div className="text-6xl font-semibold text-[#2f2418]">{result.trendScore}</div>
                <div className="mt-4 h-4 overflow-hidden rounded-full bg-[#f3e8d4]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#d6a43d] via-[#f0c96a] to-[#d6a43d]" style={{ width: `${result.trendScore}%` }} />
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {result.hashtags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Opportunities</CardTitle>
              <CardDescription>Actionable creative angles generated from the scan signals.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {result.ideas.map((idea) => (
                <div key={idea.title} className="rounded-2xl border border-[#e2d6c2] bg-[#fffaf2] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-[#2f2418]">{idea.title}</h3>
                    <Badge variant="secondary">{idea.estimatedReach}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-[#4c4033]">{idea.caption}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {idea.hashtags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (!selectedProfile) return;
                        await fetch("/api/content", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            profileId: selectedProfile.id,
                            caption: `${idea.title}\n\n${idea.caption}`,
                            hashtags: idea.hashtags,
                            platform,
                            contentType: idea.contentType,
                            status: "draft",
                          }),
                        });
                      }}
                    >
                      Save to Queue
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
