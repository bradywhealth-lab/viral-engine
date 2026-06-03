"use client";

import { useEffect, useState } from "react";
import { Megaphone, Sparkles, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

import { useProfile } from "@/components/profile-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Campaign = {
  id: string;
  title: string;
  prize: string;
  entryMechanic: string;
  postCopy: string;
  hashtags: string[];
  status: string;
  createdAt: string;
};

const STATUS_ORDER = ["active", "draft", "completed"] as const;

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; badge: string; next: string | null; nextLabel: string | null }> = {
  draft: {
    label: "Draft",
    icon: Clock,
    badge: "secondary",
    next: "active",
    nextLabel: "Launch",
  },
  active: {
    label: "Active",
    icon: Megaphone,
    badge: "default",
    next: "completed",
    nextLabel: "Complete",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    badge: "outline",
    next: null,
    nextLabel: null,
  },
};

function CampaignCard({ campaign, onStatusChange }: { campaign: Campaign; onStatusChange: (id: string, status: string) => void }) {
  const [updating, setUpdating] = useState(false);
  const config = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.draft;
  const Icon = config.icon;

  const handleAdvance = async () => {
    if (!config.next) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/giveaways/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: config.next }),
      });
      if (res.ok) onStatusChange(campaign.id, config.next);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#e2d6c2] bg-[#fffaf2] p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-[#e2d6c2]">
              <Icon className="h-4 w-4 text-[#9a7b39]" />
            </span>
            <h3 className="font-semibold text-[#2f2418]">{campaign.title}</h3>
          </div>
          <p className="mt-1 text-sm text-[#8a7a67]">Prize: {campaign.prize}</p>
        </div>
        <Badge variant={config.badge as "default" | "secondary" | "outline"}>{config.label}</Badge>
      </div>

      <p className="text-sm text-[#4c4033] line-clamp-3">{campaign.postCopy}</p>

      <div>
        <p className="text-xs text-[#8a7a67] font-medium uppercase tracking-wider mb-1">Entry</p>
        <p className="text-sm text-[#4c4033]">{campaign.entryMechanic}</p>
      </div>

      {campaign.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {campaign.hashtags.slice(0, 6).map((tag) => (
            <span key={tag} className="rounded-full bg-white border border-[#e2d6c2] px-2 py-0.5 text-xs text-[#6f6254]">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {config.next && (
        <div className="flex justify-end pt-1">
          <Button size="sm" onClick={handleAdvance} disabled={updating}>
            {updating ? "Updating…" : config.nextLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

function StatusColumn({ status, campaigns, onStatusChange }: { status: string; campaigns: Campaign[]; onStatusChange: (id: string, status: string) => void }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  const Icon = config.icon;

  return (
    <div className="flex-1 min-w-0">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e2d6c2] bg-white">
          <Icon className="h-4 w-4 text-[#9a7b39]" />
        </span>
        <span className="font-semibold text-[#2f2418]">{config.label}</span>
        <span className="ml-auto rounded-full bg-[#f4e7c8] px-2 py-0.5 text-xs font-medium text-[#9a7b39]">{campaigns.length}</span>
      </div>
      <div className="space-y-3">
        {campaigns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e2d6c2] p-6 text-sm text-[#8a7a67] text-center">No {config.label.toLowerCase()} campaigns</div>
        ) : (
          campaigns.map((c) => <CampaignCard key={c.id} campaign={c} onStatusChange={onStatusChange} />)
        )}
      </div>
    </div>
  );
}

export function CampaignsPage() {
  const { selectedProfileId } = useProfile();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!selectedProfileId) return;
      setLoading(true);
      const res = await fetch(`/api/giveaways?profileId=${selectedProfileId}`, { cache: "no-store" });
      setCampaigns((await res.json()) as Campaign[]);
      setLoading(false);
    };
    void load();
  }, [selectedProfileId]);

  const handleStatusChange = (id: string, status: string) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const grouped = STATUS_ORDER.reduce<Record<string, Campaign[]>>((acc, status) => {
    acc[status] = campaigns.filter((c) => c.status === status);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold text-[#2f2418]">Campaigns</h1>
          <p className="mt-1 text-sm text-[#8a7a67]">Track your giveaway campaigns through their lifecycle.</p>
        </div>
        <Link href="/giveaways">
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate New Campaign
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {STATUS_ORDER.map((s) => (
            <div key={s} className="space-y-3">
              <Skeleton className="h-8 w-32" />
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {STATUS_ORDER.map((status) => (
            <StatusColumn key={status} status={status} campaigns={grouped[status] ?? []} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
