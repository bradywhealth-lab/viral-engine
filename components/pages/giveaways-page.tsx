"use client";

import { useEffect, useState } from "react";

import { useProfile } from "@/components/profile-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Giveaway = {
  id: string;
  title: string;
  prize: string;
  entryMechanic: string;
  postCopy: string;
  hashtags: string[];
  status: string;
  createdAt: string;
};

export function GiveawaysPage() {
  const { selectedProfileId, selectedProfile } = useProfile();
  const [items, setItems] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!selectedProfileId) return;
      setLoading(true);
      const response = await fetch(`/api/giveaways?profileId=${selectedProfileId}`, { cache: "no-store" });
      setItems((await response.json()) as Giveaway[]);
      setLoading(false);
    };
    void load();
  }, [selectedProfileId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Giveaways</h1>
        <p className="mt-1 text-sm text-zinc-400">Generated campaign concepts and copy for {selectedProfile?.name ?? "the active profile"}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Library</CardTitle>
          <CardDescription>Use the Cards Suite or API endpoint to create more giveaway drafts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 w-full" />)
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-sm text-zinc-500">No giveaways yet for this profile.</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{item.prize}</p>
                  </div>
                  <Badge variant={item.status === "draft" ? "warning" : "secondary"} className="capitalize">
                    {item.status}
                  </Badge>
                </div>
                <p className="mt-4 text-sm leading-6 text-zinc-300">{item.postCopy}</p>
                <p className="mt-4 text-sm text-zinc-400">Entry mechanic: {item.entryMechanic}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.hashtags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
