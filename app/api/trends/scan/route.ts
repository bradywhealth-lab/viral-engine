import type { TrendAlert } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isDatabaseUnavailable } from "@/lib/database-errors";
import { getOpenAI } from "@/lib/openai";
import { getPrisma } from "@/lib/prisma";

const schema = z.object({
  keyword: z.string().min(1),
  niche: z.string().min(1),
  platform: z.string().min(1),
  profileId: z.string().min(1),
});

function extractHashtags(...sources: string[]) {
  const tags = new Set<string>();
  for (const source of sources) {
    const matches = source.match(/#[\w-]+/g) ?? [];
    for (const match of matches) {
      tags.add(match.replace(/^#/, "").toLowerCase());
    }
  }
  return Array.from(tags).slice(0, 12);
}

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const openai = getOpenAI();

    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    const searchData = firecrawlApiKey
      ? ((await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `${body.keyword} ${body.niche} trending ${body.platform}`,
            limit: 5,
          }),
        }).then((response) => response.json())) as {
          data?: Array<{ title?: string; description?: string; markdown?: string; url?: string }>;
        })
      : ({ data: [] } as {
          data?: Array<{ title?: string; description?: string; markdown?: string; url?: string }>;
        });

    const results = searchData.data ?? [];
    const trendScore = Math.min(100, results.length * 20);
    const hashtags = extractHashtags(
      ...results.flatMap((result) => [result.title ?? "", result.description ?? "", result.markdown ?? ""]),
    );

    const ideaCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Return JSON with an `ideas` array of three concise content opportunities based on trend signals.",
        },
        {
          role: "user",
          content: JSON.stringify({
            keyword: body.keyword,
            niche: body.niche,
            platform: body.platform,
            results,
            hashtags,
          }),
        },
      ],
    });

    const ideas = z
      .object({
        ideas: z.array(
          z.object({
            title: z.string(),
            caption: z.string(),
            hashtags: z.array(z.string()),
            contentType: z.string(),
            estimatedReach: z.string(),
          }),
        ),
      })
      .parse(JSON.parse(ideaCompletion.choices[0]?.message?.content ?? '{"ideas":[]}'))
      .ideas;

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
      { trendScore, hashtags, ideas, alert },
      usedFallback ? { headers: { "x-data-source": "fallback" } } : undefined,
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to scan trends" }, { status: 500 });
  }
}
