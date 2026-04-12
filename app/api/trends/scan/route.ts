import type { TrendAlert } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth, AuthError } from "@/lib/api-auth";
import { isDatabaseUnavailable } from "@/lib/database-errors";
import { mineViralTrends } from "@/lib/viral-miner";
import { getOpenAI } from "@/lib/openai";
import { getPrisma } from "@/lib/prisma";
import { verifyProfileOwnership } from "@/lib/profile-ownership";

const schema = z.object({
  keyword: z.string().min(1),
  niche: z.string().min(1),
  platform: z.enum(["tiktok", "instagram", "youtube", "twitter", "all"]),
  profileId: z.string().min(1),
});

const ideaSchema = z.object({
  ideas: z.array(
    z.object({
      title: z.string(),
      caption: z.string(),
      hashtags: z.array(z.string()),
      contentType: z.string(),
      estimatedReach: z.string(),
      platform: z.string(),
      hook: z.string(),
      format: z.string(),
      recommendedSound: z.string().nullable().optional(),
      bestPostingWindow: z.string().nullable().optional(),
    }),
  ),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = schema.parse(await request.json());

    const owns = await verifyProfileOwnership(body.profileId, user.userId);
    if (!owns) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const platformResults = await mineViralTrends({
      keyword: body.keyword,
      niche: body.niche,
      platform: body.platform,
      firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
    });

    const trendScore =
      platformResults.length > 0
        ? Math.round(platformResults.reduce((sum, result) => sum + result.trendScore, 0) / platformResults.length)
        : 0;

    const hashtags = Array.from(new Set(platformResults.flatMap((result) => result.hashtags))).slice(0, 16);
    const topFormats = Array.from(new Set(platformResults.flatMap((result) => result.topFormats))).slice(0, 6);
    const sounds = Array.from(new Set(platformResults.flatMap((result) => result.sounds))).slice(0, 6);
    const postingWindows = Array.from(new Set(platformResults.flatMap((result) => result.postingWindows))).slice(0, 4);

    let ideas = ideaSchema.parse('{"ideas":[]}').ideas;

    try {
      const openai = getOpenAI();
      const ideaCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Return JSON with an `ideas` array of 4 actionable viral content opportunities. Each idea must include title, caption, hashtags, contentType, estimatedReach, platform, hook, format, recommendedSound, and bestPostingWindow. Base ideas only on the supplied mined trend evidence.",
          },
          {
            role: "user",
            content: JSON.stringify({
              keyword: body.keyword,
              niche: body.niche,
              requestedPlatform: body.platform,
              minedTrendSummary: platformResults.map((result) => ({
                platform: result.platform,
                trendScore: result.trendScore,
                hashtags: result.hashtags,
                sounds: result.sounds,
                topFormats: result.topFormats,
                postingWindows: result.postingWindows,
                avgViews: result.engagement.avgViews,
                avgLikes: result.engagement.avgLikes,
                examples: result.examples.map((example) => ({
                  title: example.title,
                  format: example.format,
                  views: example.views,
                  likes: example.likes,
                  hashtags: example.hashtags,
                  sound: example.sound,
                  recencyLabel: example.recencyLabel,
                })),
              })),
            }),
          },
        ],
      });

      ideas = ideaSchema.parse(JSON.parse(ideaCompletion.choices[0]?.message?.content ?? '{"ideas":[]}')).ideas;
    } catch (ideaError) {
      console.error("Failed to generate AI trend ideas", ideaError);
    }

    let alert: TrendAlert | null = null;
    let usedFallback = false;
    try {
      const prisma = await getPrisma();
      alert = await prisma.trendAlert.create({
        data: {
          profileId: body.profileId,
          keyword: body.keyword,
          platform: body.platform,
          trendScore,
        },
      });
    } catch (persistError) {
      console.error(persistError);
      if (isDatabaseUnavailable(persistError)) {
        usedFallback = true;
      } else {
        throw persistError;
      }
    }

    return NextResponse.json(
      {
        trendScore,
        hashtags,
        ideas,
        alert,
        platformsScanned: platformResults.map((result) => result.platform),
        platformResults,
        summary: {
          topFormats,
          sounds,
          postingWindows,
        },
      },
      usedFallback ? { headers: { "x-data-source": "fallback" } } : undefined,
    );
  } catch (error) {
    console.error(error);

    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid trend scan request", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to scan trends" }, { status: 500 });
  }
}
