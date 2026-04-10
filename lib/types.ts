export type ProfileSummary = {
  id: string;
  name: string;
  niche: string;
  platforms: string[];
  avatarColor: string;
  createdAt: string;
  _count?: {
    content: number;
    trends: number;
    giveaways: number;
  };
};

export type ContentIdea = {
  title: string;
  caption: string;
  hashtags: string[];
  contentType: string;
  estimatedReach: string;
  platform: string;
  hook: string;
  format: string;
  recommendedSound?: string | null;
  bestPostingWindow?: string | null;
};

export type ViralContentExample = {
  title: string;
  url: string;
  platform: string;
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
  platform: string;
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

export type TrendScanResponse = {
  trendScore: number;
  hashtags: string[];
  ideas: ContentIdea[];
  alert: {
    id: string;
    keyword: string;
    platform: string;
    trendScore: number;
    detectedAt: string;
  } | null;
  platformsScanned: string[];
  platformResults: PlatformTrendResult[];
  summary: {
    topFormats: string[];
    sounds: string[];
    postingWindows: string[];
  };
};
