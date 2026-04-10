"use client";

import { Lightbulb, Search, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NicheRecommendation {
  name: string;
  growthScore: number;
  competition: "Low" | "Medium" | "High";
  platformFit: string[];
  contentIdeas: string[];
}

interface AuctionResult {
  id: string;
  player: string;
  set: string;
  year: number;
  grade: string;
  soldPrice: number;
  soldAt: string;
  sourceUrl: string;
}

export function ResearchPage() {
  const [niches, setNiches] = useState<NicheRecommendation[]>([]);
  const [nichesLoading, setNichesLoading] = useState(false);
  const [auctionQuery, setAuctionQuery] = useState("");
  const [auctionResults, setAuctionResults] = useState<AuctionResult[]>([]);
  const [auctionsLoading, setAuctionsLoading] = useState(false);

  const findNiches = async () => {
    setNichesLoading(true);
    try {
      const response = await fetch("/api/research/niches", { method: "POST" });
      if (!response.ok) throw new Error("Failed to find niches");
      const data = await response.json();
      setNiches(data);
      toast.success("Found 3 untapped niches!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to find niches");
    } finally {
      setNichesLoading(false);
    }
  };

  const searchAuctions = async () => {
    if (!auctionQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    setAuctionsLoading(true);
    try {
      const response = await fetch(`/api/research/auctions?q=${encodeURIComponent(auctionQuery)}`);
      if (!response.ok) throw new Error("Failed to search auctions");
      const data = await response.json();
      setAuctionResults(data);
      toast.success(`Found ${data.length} auction results`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to search auctions");
    } finally {
      setAuctionsLoading(false);
    }
  };

  const getCompetitionBadgeVariant = (competition: string) => {
    switch (competition) {
      case "Low":
        return "secondary";
      case "Medium":
        return "warning";
      case "High":
        return "destructive";
      default:
        return "default";
    }
  };

  const getGrowthScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-[#d6a43d]";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[#2f2418]">Research</h1>
        <p className="mt-1 text-sm text-[#8a7a67]">Discover untapped niches and find content opportunities in your space.</p>
      </div>

      <Tabs defaultValue="niches">
        <TabsList>
          <TabsTrigger value="niches">
            <Lightbulb className="mr-2 h-4 w-4" />
            Niche Finder
          </TabsTrigger>
          <TabsTrigger value="auctions">
            <Search className="mr-2 h-4 w-4" />
            Auction Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="niches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Untapped Niches</CardTitle>
              <CardDescription>Use AI to discover high-growth, low-competition social media niches.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={findNiches} disabled={nichesLoading} size="lg">
                <Lightbulb className="mr-2 h-4 w-4" />
                Find Top 3 Untapped Niches
              </Button>
            </CardContent>
          </Card>

          {nichesLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          ) : niches.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {niches.map((niche, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{niche.name}</CardTitle>
                      <Badge variant={getCompetitionBadgeVariant(niche.competition)}>{niche.competition}</Badge>
                    </div>
                    <CardDescription>
                      <div className="mt-2">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-[#8a7a67]">Growth Score</span>
                          <span className="text-[#2f2418]">{niche.growthScore}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#f3e8d4]">
                          <div
                            className={`h-full ${getGrowthScoreColor(niche.growthScore)}`}
                            style={{ width: `${niche.growthScore}%` }}
                          />
                        </div>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm font-medium text-[#2f2418]">Platform Fit</p>
                      <div className="flex flex-wrap gap-2">
                        {niche.platformFit.map((platform) => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-[#2f2418]">Content Ideas</p>
                      <ul className="space-y-1">
                        {niche.contentIdeas.map((idea, i) => (
                          <li key={i} className="flex items-start text-sm text-[#4c4033]">
                            <span className="mr-2 text-[#d6a43d]">•</span>
                            {idea}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="auctions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Auctions</CardTitle>
              <CardDescription>Find recent sports card sales across eBay and other platforms.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Michael Jordan, Tom Brady, Mickey Mantle..."
                  value={auctionQuery}
                  onChange={(e) => setAuctionQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchAuctions()}
                />
                <Button onClick={searchAuctions} disabled={auctionsLoading}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {auctionsLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : auctionResults.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>Found {auctionResults.length} auction results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e2d6c2] text-left text-sm text-[#8a7a67]">
                        <th className="pb-3 pr-4">Card Name</th>
                        <th className="pb-3 pr-4">Set</th>
                        <th className="pb-3 pr-4">Year</th>
                        <th className="pb-3 pr-4">Grade</th>
                        <th className="pb-3 pr-4">Price</th>
                        <th className="pb-3 pr-4">Date</th>
                        <th className="pb-3">Source</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {auctionResults.map((result) => (
                        <tr key={result.id} className="border-b border-[#e2d6c2]/50">
                          <td className="py-3 pr-4 font-medium text-[#2f2418]">{result.player}</td>
                          <td className="py-3 pr-4 text-[#4c4033]">{result.set}</td>
                          <td className="py-3 pr-4 text-[#4c4033]">{result.year}</td>
                          <td className="py-3 pr-4 text-[#4c4033]">{result.grade}</td>
                          <td className="py-3 pr-4 font-medium text-emerald-400">${result.soldPrice.toLocaleString()}</td>
                          <td className="py-3 pr-4 text-[#4c4033]">{result.soldAt}</td>
                          <td className="py-3">
                            <a
                              href={result.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-[#d6a43d] hover:text-[#b8842c]"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
