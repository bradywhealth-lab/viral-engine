"use client";

import { useMemo, useState } from "react";

import { useProfile } from "@/components/profile-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlatformTrendResult, TrendScanResponse } from "@/lib/types";

const PLATFORM_OPTIONS = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "Twitter / X" },
  { value: "all", label: "Scan all platforms" },
] as const;

function formatCompactNumber(value: number | null) {
  if (!value) return "N/A";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatPlatformName(platform: string) {
  return PLATFORM_OPTIONS.find((option) => option.value === platform)?.label ?? platform;
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e2d6c2] bg-white px-4 py-3">
      <div className="text-xs uppercase tracking-[0.2em] text-[#8a7a67]">{label}</div>
      <div className="mt-1 text-lg font-semibold text-[#2f2418]">{value}</div>
    </div>
  );
}

function PlatformCard({ result }: { result: PlatformTrendResult }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{formatPlatformName(result.platform)}</CardTitle>
            <CardDescription>{result.resultCount} surfaced viral signals from platform-specific search mining.</CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            Trend Score {result.trendScore}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricPill label="Avg Views" value={formatCompactNumber(result.engagement.avgViews)} />
          <MetricPill label="Avg Likes" value={formatCompactNumber(result.engagement.avgLikes)} />
          <MetricPill label="Top Format" value={result.topFormats[0] ?? "N/A"} />
          <MetricPill label="Best Window" value={result.postingWindows[0] ?? "N/A"} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <div className="text-sm font-medium text-[#2f2418]">Winning hashtags</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.hashtags.length ? result.hashtags.map((tag) => <Badge key={`${result.platform}-${tag}`} variant="outline">#{tag}</Badge>) : <span className="text-sm text-[#8a7a67]">No hashtags surfaced</span>}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-[#2f2418]">Trending sounds</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.sounds.length ? result.sounds.map((sound) => <Badge key={`${result.platform}-${sound}`} variant="outline">{sound}</Badge>) : <span className="text-sm text-[#8a7a67]">No sound mentions surfaced</span>}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-[#2f2418]">Score breakdown</div>
            <div className="mt-2 grid gap-2 text-sm text-[#4c4033]">
              <div>Volume: {result.scoreBreakdown.volume}</div>
              <div>Engagement: {result.scoreBreakdown.engagement}</div>
              <div>Recency: {result.scoreBreakdown.recency}</div>
              <div>Momentum: {result.scoreBreakdown.momentum}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-[#2f2418]">Trending now</div>
          <div className="grid gap-3">
            {result.examples.length ? (
              result.examples.map((example) => (
                <div key={`${result.platform}-${example.url}-${example.title}`} className="rounded-2xl border border-[#e2d6c2] bg-[#fffaf2] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-[#2f2418]">{example.title}</div>
                      <div className="mt-1 text-sm text-[#8a7a67]">{example.format}{example.recencyLabel ? ` • ${example.recencyLabel}` : ""}</div>
                    </div>
                    {example.url ? (
                      <a className="text-sm font-medium text-[#a06d19] underline-offset-4 hover:underline" href={example.url} target="_blank" rel="noreferrer">
                        Open source
                      </a>
                    ) : null}
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-[#4c4033] sm:grid-cols-2 xl:grid-cols-4">
                    <div>Views: {formatCompactNumber(example.views)}</div>
                    <div>Likes: {formatCompactNumber(example.likes)}</div>
                    <div>Comments: {formatCompactNumber(example.comments)}</div>
                    <div>Shares: {formatCompactNumber(example.shares)}</div>
                  </div>
                  <p className="mt-3 text-sm text-[#4c4033]">{example.snippet}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {example.sound ? <Badge variant="secondary">Sound: {example.sound}</Badge> : null}
                    {example.hashtags.map((tag) => (
                      <Badge key={`${example.title}-${tag}`} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[#e2d6c2] p-4 text-sm text-[#8a7a67]">No platform examples surfaced from the current search query.</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TrendScannerPage() {
  const { selectedProfile } = useProfile();
  const [keyword, setKeyword] = useState("");
  const [niche, setNiche] = useState("Sports Cards");
  const [platform, setPlatform] = useState("tiktok");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrendScanResponse | null>(null);

  const selectedPlatformLabel = useMemo(() => formatPlatformName(platform), [platform]);

  const runScan = async (targetPlatform = platform) => {
    if (!selectedProfile) return;
    setLoading(true);
    try {
      const response = await fetch("/api/trends/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword,
          niche,
          platform: targetPlatform,
          profileId: selectedProfile.id,
        }),
      });
      setResult((await response.json()) as TrendScanResponse);
      setPlatform(targetPlatform);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[#2f2418]">Trend Scanner</h1>
        <p className="mt-1 text-sm text-[#8a7a67]">Mine live public viral signals from TikTok, Instagram, YouTube, and Twitter/X, then turn them into content angles you can ship fast.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Trends</CardTitle>
          <CardDescription>Uses platform-specific Firecrawl mining plus AI synthesis to reveal what is actually moving now.</CardDescription>
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
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORM_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <Button className="w-full" onClick={() => void runScan()} disabled={!selectedProfile || !keyword.trim() || loading}>
              {loading ? "Mining trends..." : `Scan ${selectedPlatformLabel}`}
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => void runScan("all")}
              disabled={!selectedProfile || !keyword.trim() || loading}
            >
              Scan All Platforms
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Skeleton className="h-[34rem] w-full" />
      ) : result ? (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <Card>
              <CardHeader>
                <CardTitle>Trend Score</CardTitle>
                <CardDescription>Weighted by volume, engagement, recency, and momentum across mined platform results.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-3xl border border-[#e2d6c2] bg-[#fffaf2] p-6">
                  <div className="text-6xl font-semibold text-[#2f2418]">{result.trendScore}</div>
                  <div className="mt-4 h-4 overflow-hidden rounded-full bg-[#f3e8d4]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#d6a43d] via-[#f0c96a] to-[#d6a43d]" style={{ width: `${result.trendScore}%` }} />
                  </div>
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-[#8a7a67]">Formats winning</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.summary.topFormats.map((format) => (
                          <Badge key={format} variant="outline">
                            {format}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-[#8a7a67]">Sounds popping</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.summary.sounds.length ? result.summary.sounds.map((sound) => <Badge key={sound} variant="outline">{sound}</Badge>) : <span className="text-sm text-[#8a7a67]">No sound signals found</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-[#8a7a67]">Best posting windows</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.summary.postingWindows.length ? result.summary.postingWindows.map((window) => <Badge key={window} variant="outline">{window}</Badge>) : <span className="text-sm text-[#8a7a67]">No posting window signals found</span>}
                      </div>
                    </div>
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
                <CardDescription>Ideas derived from mined viral patterns, not generic keyword brainstorming.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {result.ideas.map((idea) => (
                  <div key={idea.title} className="rounded-2xl border border-[#e2d6c2] bg-[#fffaf2] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[#2f2418]">{idea.title}</h3>
                        <div className="mt-1 text-sm text-[#8a7a67]">{formatPlatformName(idea.platform)} • {idea.format}</div>
                      </div>
                      <Badge variant="secondary">{idea.estimatedReach}</Badge>
                    </div>
                    <p className="mt-3 text-sm font-medium text-[#4c4033]">Hook: {idea.hook}</p>
                    <p className="mt-2 text-sm text-[#4c4033]">{idea.caption}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {idea.hashtags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-[#4c4033] md:grid-cols-2">
                      <div>Type: {idea.contentType}</div>
                      <div>Best window: {idea.bestPostingWindow ?? "Use platform peak time"}</div>
                      <div className="md:col-span-2">Sound: {idea.recommendedSound ?? "Use a currently rising sound matched to the niche"}</div>
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
                              caption: `${idea.title}\n\nHook: ${idea.hook}\n\n${idea.caption}`,
                              hashtags: idea.hashtags,
                              platform: idea.platform,
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

          <div className="grid gap-6">
            {result.platformResults.map((platformResult) => (
              <PlatformCard key={platformResult.platform} result={platformResult} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
