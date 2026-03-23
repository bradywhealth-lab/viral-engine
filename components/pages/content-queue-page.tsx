"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { WandSparkles } from "lucide-react";

import { ContentFormDrawer } from "@/components/content-form-drawer";
import { useProfile } from "@/components/profile-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { ContentIdea } from "@/lib/types";
import { formatHashtags } from "@/lib/utils";

type ContentItem = {
  id: string;
  caption: string;
  hashtags: string[];
  platform: string;
  status: string;
  scheduledAt: string | null;
  contentType: string;
};

export function ContentQueuePage() {
  const { selectedProfile, selectedProfileId, isLoading: profileLoading } = useProfile();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [keyword, setKeyword] = useState("");
  const [tone, setTone] = useState("Bold");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadContent = useCallback(async () => {
    if (!selectedProfileId) return;
    setLoading(true);
    const response = await fetch(`/api/content?profileId=${selectedProfileId}`, { cache: "no-store" });
    setItems((await response.json()) as ContentItem[]);
    setLoading(false);
  }, [selectedProfileId]);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const filteredItems = items.filter((item) => filter === "all" || item.status === filter);

  const generateIdeas = async () => {
    if (!selectedProfile) return;
    setGenerating(true);
    try {
      const response = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: selectedProfile.id,
          niche: selectedProfile.niche,
          keyword: keyword || selectedProfile.niche,
          platform: selectedProfile.platforms[0] ?? "tiktok",
          tone,
        }),
      });
      setIdeas((await response.json()) as ContentIdea[]);
    } finally {
      setGenerating(false);
    }
  };

  const saveIdea = async (idea: ContentIdea) => {
    if (!selectedProfileId) return;
    await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: selectedProfileId,
        caption: `${idea.title}\n\n${idea.caption}`,
        hashtags: idea.hashtags,
        platform: selectedProfile?.platforms[0] ?? "tiktok",
        contentType: idea.contentType,
        status: "draft",
      }),
    });
    await loadContent();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Content Queue</h1>
          <p className="mt-1 text-sm text-zinc-400">Draft, schedule, and generate ideas for the selected profile.</p>
        </div>
        {selectedProfileId ? <ContentFormDrawer profileId={selectedProfileId} onCreated={loadContent} /> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Idea Generator</CardTitle>
          <CardDescription>Generate 10 niche-specific ideas with titles, captions, hashtags, and reach estimates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_220px_140px]">
            <Input placeholder="Keyword or campaign angle" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
            <Input placeholder="Tone" value={tone} onChange={(event) => setTone(event.target.value)} />
            <Button onClick={generateIdeas} disabled={!selectedProfile || generating}>
              <WandSparkles className="mr-2 h-4 w-4" />
              {generating ? "Generating..." : "Generate Ideas"}
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {ideas.map((idea) => (
              <div key={idea.title} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-white">{idea.title}</h3>
                  <Badge variant="secondary">{idea.estimatedReach}</Badge>
                </div>
                <Textarea className="mt-3 min-h-[110px]" value={idea.caption} readOnly />
                <p className="mt-3 text-sm text-zinc-400">{formatHashtags(idea.hashtags)}</p>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="outline" className="capitalize">
                    {idea.contentType}
                  </Badge>
                  <Button size="sm" onClick={() => saveIdea(idea)}>
                    Save to Queue
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Queued Content</CardTitle>
            <CardDescription>
              {profileLoading || !selectedProfile ? "Loading profile..." : `Showing items for ${selectedProfile.name}.`}
            </CardDescription>
          </div>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-zinc-500">
                  <tr>
                    <th className="pb-3">Caption</th>
                    <th className="pb-3">Platform</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Scheduled At</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4 pr-4 text-zinc-200">{item.caption.slice(0, 84)}{item.caption.length > 84 ? "..." : ""}</td>
                      <td className="py-4 pr-4">
                        <Badge variant="outline" className="capitalize">
                          {item.platform}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4">
                        <Badge variant={item.status === "published" ? "secondary" : item.status === "scheduled" ? "warning" : "default"} className="capitalize">
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4 text-zinc-400">{item.scheduledAt ? format(new Date(item.scheduledAt), "MMM d, yyyy h:mm a") : "Not set"}</td>
                      <td className="py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            await fetch(`/api/content/${item.id}`, { method: "DELETE" });
                            await loadContent();
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredItems.length === 0 ? <div className="py-8 text-center text-zinc-500">No content found for this status.</div> : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
