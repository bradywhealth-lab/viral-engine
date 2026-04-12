"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { useProfile } from "@/components/profile-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type Listing = {
  id: string;
  title: string;
  soldPrice: number;
  soldAt: string;
  sourceUrl: string;
  sourcePlatform: string;
};

type CardSearchResult = {
  listings: Listing[];
  averagePrice: number;
  trendDirection: "up" | "down";
};

type GiveawayResult = {
  postCopy: string;
  entryMechanic: string;
  hashtags: string[];
  callToAction: string;
};

export function CardsPage() {
  const { selectedProfile } = useProfile();
  const [player, setPlayer] = useState("");
  const [setName, setSetName] = useState("");
  const [year, setYear] = useState("2024");
  const [grade, setGrade] = useState("10");
  const [prize, setPrize] = useState("");
  const [audience, setAudience] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [giveawayLoading, setGiveawayLoading] = useState(false);
  const [result, setResult] = useState<CardSearchResult | null>(null);
  const [giveaway, setGiveaway] = useState<GiveawayResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[#2f2418]">Cards Suite</h1>
        <p className="mt-1 text-sm text-[#8a7a67]">Search sold comps, track average pricing, and generate a campaign-ready giveaway in one screen.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>eBay Sold Search</CardTitle>
          <CardDescription>Searches sold sports card listings through Firecrawl and estimates the current price direction.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-5">
          <Input placeholder="Player" value={player} onChange={(event) => setPlayer(event.target.value)} />
          <Input placeholder="Set" value={setName} onChange={(event) => setSetName(event.target.value)} />
          <Input placeholder="Year" value={year} onChange={(event) => setYear(event.target.value)} />
          <Input placeholder="Grade" value={grade} onChange={(event) => setGrade(event.target.value)} />
          <Button
            onClick={async () => {
              setSearchLoading(true);
              setError(null);
              try {
                const response = await fetch("/api/cards/search", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    player,
                    set: setName,
                    year: Number(year),
                    grade: Number(grade),
                  }),
                });
                const payload = (await response.json()) as CardSearchResult & { error?: string };
                if (!response.ok) {
                  throw new Error(payload.error ?? "Failed to search listings");
                }
                setResult(payload);
              } catch (searchError) {
                setResult(null);
                setError(searchError instanceof Error ? searchError.message : "Failed to search listings");
              } finally {
                setSearchLoading(false);
              }
            }}
            disabled={searchLoading || !player.trim() || !setName.trim()}
          >
            {searchLoading ? "Searching..." : "Search Listings"}
          </Button>
        </CardContent>
      </Card>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {searchLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : result ? (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardHeader>
              <CardTitle>Market Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-[#e2d6c2] bg-[#fffaf2] p-5">
                <p className="text-sm text-[#8a7a67]">Average Price</p>
                <p className="mt-2 text-4xl font-semibold text-[#2f2418]">${result.averagePrice.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl border border-[#e2d6c2] bg-[#fffaf2] p-5">
                <p className="text-sm text-[#8a7a67]">Trend Direction</p>
                <div className="mt-2 flex items-center gap-3">
                  {result.trendDirection === "up" ? (
                    <ArrowUpRight className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="h-6 w-6 text-red-400" />
                  )}
                  <span className="text-xl font-medium capitalize text-[#2f2418]">{result.trendDirection}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sold Listings</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-[#8a7a67]">
                  <tr>
                    <th className="pb-3">Listing</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2d6c2]">
                  {result.listings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="py-4 pr-4 text-[#2f2418]/90">{listing.title}</td>
                      <td className="py-4 pr-4 text-[#2f2418]">${listing.soldPrice.toFixed(2)}</td>
                      <td className="py-4 pr-4 text-[#8a7a67]">{new Date(listing.soldAt).toLocaleDateString()}</td>
                      <td className="py-4">
                        <a className="text-[#c49332] hover:text-[#b8842c]/80" href={listing.sourceUrl} target="_blank" rel="noreferrer">
                          {listing.sourcePlatform}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Giveaway Builder</CardTitle>
          <CardDescription>Generate audience-specific giveaway copy for the active profile.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="prize">Prize</Label>
              <Input id="prize" value={prize} onChange={(event) => setPrize(event.target.value)} placeholder="PSA 10 rookie slab" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="audience">Audience</Label>
              <Input id="audience" value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="Collectors chasing rookies" />
            </div>
            <Button
              onClick={async () => {
                if (!selectedProfile) return;
                setGiveawayLoading(true);
                setError(null);
                try {
                  const response = await fetch("/api/giveaways/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      profileId: selectedProfile.id,
                      prize,
                      targetAudience: audience,
                      platform: selectedProfile.platforms[0] ?? "instagram",
                    }),
                  });
                  const payload = (await response.json()) as GiveawayResult & { error?: string };
                  if (!response.ok) {
                    throw new Error(payload.error ?? "Failed to generate giveaway copy");
                  }
                  setGiveaway(payload);
                } catch (giveawayError) {
                  setGiveaway(null);
                  setError(giveawayError instanceof Error ? giveawayError.message : "Failed to generate giveaway copy");
                } finally {
                  setGiveawayLoading(false);
                }
              }}
              disabled={!selectedProfile || !prize.trim() || !audience.trim() || giveawayLoading}
            >
              {giveawayLoading ? "Generating..." : "Generate Giveaway Copy"}
            </Button>
          </div>
          <div>
            {giveawayLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : giveaway ? (
              <div className="rounded-2xl border border-[#e2d6c2] bg-[#fffaf2] p-5">
                <Textarea value={giveaway.postCopy} readOnly className="min-h-[180px]" />
                <p className="mt-4 text-sm text-[#4c4033]">
                  <span className="font-medium text-[#2f2418]">Entry:</span> {giveaway.entryMechanic}
                </p>
                <p className="mt-2 text-sm text-[#4c4033]">
                  <span className="font-medium text-[#2f2418]">CTA:</span> {giveaway.callToAction}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {giveaway.hashtags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#e2d6c2] p-6 text-sm text-[#8a7a67]">Generated giveaway copy will appear here.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
