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
  };
};
