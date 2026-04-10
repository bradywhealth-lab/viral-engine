type FirecrawlResult = {
  title?: string;
  description?: string;
  markdown?: string;
  url?: string;
};

export type SocialPlatform = "tiktok" | "instagram" | "youtube" | "twitter" | "all";

type EngagementSignals = {
  views: number[];
  likes: number[];
  comments: number[];
  shares: number[];
};

export type ViralContentExample = {
  title: string;
  url: string;
  platform: Exclude<SocialPlatform, "all">;
  format: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  hashtags: string[];
  sound: string | null;
  recencyLabel: string | null;
  snippet: string;
};

export type PlatformTrendResult = {
  platform: Exclude<SocialPlatform, "all">;
  query: string;
  resultCount: number;
  trendScore: number;
  hashtags: string[];
  sounds: string[];
  topFormats: string[];
  postingWindows: string[];
  engagement: {
    avgViews: number;
    avgLikes: number;
    avgComments: number;
    avgShares: number;
  };
  scoreBreakdown: {
    volume: number;
    engagement: number;
    recency: number;
    momentum: number;
  };
  examples: ViralContentExample[];
};

const PLATFORM_QUERIES: Record<Exclude<SocialPlatform, "all">, (keyword: string, niche: string) => string> = {
  tiktok: (keyword, niche) => `site:tiktok.com "${keyword}" "${niche}" (viral OR trending OR "for you")`,
  instagram: (keyword, niche) => `site:instagram.com "${keyword}" "${niche}" (reels OR viral OR trending)`,
  youtube: (keyword, niche) => `site:youtube.com "${keyword}" "${niche}" (shorts OR trending OR viral)`,
  twitter: (keyword, niche) => `(site:x.com OR site:twitter.com) "${keyword}" "${niche}" (viral OR trending OR thread)`,
};

const PLATFORM_ORDER: Array<Exclude<SocialPlatform, "all">> = ["tiktok", "instagram", "youtube", "twitter"];

const PLATFORM_FORMAT_KEYWORDS: Record<Exclude<SocialPlatform, "all">, string[]> = {
  tiktok: ["storytime", "reaction", "routine", "haul", "reveal", "before and after", "tutorial", "duet", "stitch", "original sound", "trend"],
  instagram: ["reel", "carousel", "story", "bts", "behind the scenes", "transformation", "before and after", "tutorial", "hook"],
  youtube: ["short", "challenge", "breakdown", "reaction", "live", "tutorial", "review", "compilation", "vlog"],
  twitter: ["thread", "clip", "quote tweet", "hot take", "reaction", "meme", "breakdown", "spaces"],
};

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function collectText(result: FirecrawlResult) {
  return normalizeWhitespace([result.title, result.description, result.markdown].filter(Boolean).join(" "));
}

function parseNumericToken(raw: string) {
  const cleaned = raw.replace(/,/g, "").trim().toLowerCase();
  const value = Number.parseFloat(cleaned);
  if (Number.isNaN(value)) {
    return null;
  }
  if (cleaned.endsWith("k")) return Math.round(value * 1_000);
  if (cleaned.endsWith("m")) return Math.round(value * 1_000_000);
  if (cleaned.endsWith("b")) return Math.round(value * 1_000_000_000);
  return Math.round(value);
}

function extractMetric(text: string, labels: string[]) {
  for (const label of labels) {
    const pattern = new RegExp(`(\\d+[\\d,]*(?:\\.\\d+)?\\s*[kmb]?)\\+?\\s*(?:${label})`, "i");
    const match = text.match(pattern);
    if (match?.[1]) {
      return parseNumericToken(match[1]);
    }
  }
  return null;
}

function extractHashtags(...sources: string[]) {
  const tags = new Set<string>();
  for (const source of sources) {
    const matches = source.match(/#[\w-]+/g) ?? [];
    for (const match of matches) {
      tags.add(match.replace(/^#/, "").toLowerCase());
    }
  }
  return Array.from(tags);
}

function extractSound(text: string) {
  const patterns = [
    /original sound\s*[-:–]\s*([^|,.]+)/i,
    /sound\s*[-:–]\s*([^|,.]+)/i,
    /audio\s*[-:–]\s*([^|,.]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return normalizeWhitespace(match[1]);
    }
  }

  return null;
}

function extractRecencyLabel(text: string) {
  const patterns = [
    /(\d+)\s*(minute|hour|day|week|month)s?\s+ago/i,
    /(today|yesterday)/i,
    /(posted\s+\d+\s*(minute|hour|day|week|month)s?\s+ago)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[0]) {
      return normalizeWhitespace(match[0]);
    }
  }
  return null;
}

function inferFormat(platform: Exclude<SocialPlatform, "all">, text: string) {
  const lowered = text.toLowerCase();
  const keywords = PLATFORM_FORMAT_KEYWORDS[platform];
  const found = keywords.find((keyword) => lowered.includes(keyword));
  if (found) {
    return found;
  }

  if (platform === "tiktok") return "short-form video";
  if (platform === "instagram") return "reel";
  if (platform === "youtube") return "short";
  return "post/thread";
}

function inferPostingWindow(text: string) {
  const hourMatch = text.match(/\b(\d{1,2})(?::\d{2})?\s?(am|pm)\b/i);
  if (!hourMatch) {
    return null;
  }

  const hour = Number.parseInt(hourMatch[1] ?? "0", 10);
  const meridiem = (hourMatch[2] ?? "").toLowerCase();
  const normalizedHour = meridiem === "pm" && hour !== 12 ? hour + 12 : meridiem === "am" && hour === 12 ? 0 : hour;

  if (normalizedHour >= 5 && normalizedHour < 12) return "Morning";
  if (normalizedHour >= 12 && normalizedHour < 17) return "Afternoon";
  if (normalizedHour >= 17 && normalizedHour < 22) return "Evening";
  return "Late Night";
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function cappedScore(value: number, maxValue: number) {
  return Math.max(0, Math.min(100, Math.round((value / maxValue) * 100)));
}

function extractEngagementSignals(text: string): EngagementSignals {
  const signals: EngagementSignals = {
    views: [],
    likes: [],
    comments: [],
    shares: [],
  };

  const metrics: Array<[keyof EngagementSignals, string[]]> = [
    ["views", ["views", "view", "plays"]],
    ["likes", ["likes", "like"]],
    ["comments", ["comments", "comment"]],
    ["shares", ["shares", "share", "retweets", "reposts"]],
  ];

  for (const [key, labels] of metrics) {
    const value = extractMetric(text, labels);
    if (value) {
      signals[key].push(value);
    }
  }

  return signals;
}

async function searchFirecrawl(query: string, firecrawlApiKey: string, limit = 8): Promise<FirecrawlResult[]> {
  const response = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firecrawlApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, limit }),
  });

  if (!response.ok) {
    throw new Error(`Firecrawl search failed with status ${response.status}`);
  }

  const data = (await response.json()) as { data?: FirecrawlResult[] };
  return data.data ?? [];
}

export async function minePlatformTrends(params: {
  keyword: string;
  niche: string;
  platform: Exclude<SocialPlatform, "all">;
  firecrawlApiKey: string;
}) {
  const query = PLATFORM_QUERIES[params.platform](params.keyword, params.niche);
  const results = await searchFirecrawl(query, params.firecrawlApiKey);

  const hashtags = new Set<string>();
  const sounds = new Set<string>();
  const formats = new Map<string, number>();
  const windows = new Map<string, number>();
  const engagementTotals: EngagementSignals = { views: [], likes: [], comments: [], shares: [] };

  const examples: ViralContentExample[] = results.slice(0, 6).map((result) => {
    const text = collectText(result);
    const extractedHashtags = extractHashtags(result.title ?? "", result.description ?? "", result.markdown ?? "");
    extractedHashtags.forEach((tag) => hashtags.add(tag));

    const sound = extractSound(text);
    if (sound) sounds.add(sound);

    const format = inferFormat(params.platform, text);
    formats.set(format, (formats.get(format) ?? 0) + 1);

    const postingWindow = inferPostingWindow(text);
    if (postingWindow) {
      windows.set(postingWindow, (windows.get(postingWindow) ?? 0) + 1);
    }

    const signals = extractEngagementSignals(text);
    engagementTotals.views.push(...signals.views);
    engagementTotals.likes.push(...signals.likes);
    engagementTotals.comments.push(...signals.comments);
    engagementTotals.shares.push(...signals.shares);

    return {
      title: result.title ?? "Untitled trend",
      url: result.url ?? "",
      platform: params.platform,
      format,
      views: signals.views[0] ?? null,
      likes: signals.likes[0] ?? null,
      comments: signals.comments[0] ?? null,
      shares: signals.shares[0] ?? null,
      hashtags: extractedHashtags.slice(0, 6),
      sound,
      recencyLabel: extractRecencyLabel(text),
      snippet: text.slice(0, 280),
    };
  });

  const avgViews = average(engagementTotals.views);
  const avgLikes = average(engagementTotals.likes);
  const avgComments = average(engagementTotals.comments);
  const avgShares = average(engagementTotals.shares);

  const recencyHits = examples.filter((example) => example.recencyLabel).length;
  const momentumHits = examples.filter((example) => (example.views ?? 0) > 50_000 || (example.likes ?? 0) > 5_000).length;

  const scoreBreakdown = {
    volume: cappedScore(results.length, 8),
    engagement: cappedScore(avgViews + avgLikes * 4 + avgComments * 8 + avgShares * 10, 1_500_000),
    recency: cappedScore(recencyHits, Math.max(1, examples.length)),
    momentum: cappedScore(momentumHits, Math.max(1, examples.length)),
  };

  const trendScore = Math.round(
    scoreBreakdown.volume * 0.25 +
      scoreBreakdown.engagement * 0.35 +
      scoreBreakdown.recency * 0.2 +
      scoreBreakdown.momentum * 0.2,
  );

  return {
    platform: params.platform,
    query,
    resultCount: results.length,
    trendScore,
    hashtags: Array.from(hashtags).slice(0, 12),
    sounds: Array.from(sounds).slice(0, 6),
    topFormats: Array.from(formats.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([format]) => format)
      .slice(0, 4),
    postingWindows: Array.from(windows.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([window]) => window)
      .slice(0, 3),
    engagement: {
      avgViews,
      avgLikes,
      avgComments,
      avgShares,
    },
    scoreBreakdown,
    examples,
  } satisfies PlatformTrendResult;
}

export async function mineViralTrends(params: {
  keyword: string;
  niche: string;
  platform: SocialPlatform;
  firecrawlApiKey?: string;
}) {
  if (!params.firecrawlApiKey) {
    return [] as PlatformTrendResult[];
  }

  const targets = params.platform === "all" ? PLATFORM_ORDER : [params.platform];
  return Promise.all(
    targets.map((platform) =>
      minePlatformTrends({
        keyword: params.keyword,
        niche: params.niche,
        platform,
        firecrawlApiKey: params.firecrawlApiKey as string,
      }),
    ),
  );
}
