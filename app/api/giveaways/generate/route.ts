import { NextResponse } from "next/server";
import { z } from "zod";

import { isDatabaseUnavailable } from "@/lib/database-errors";
import { getOpenAI } from "@/lib/openai";
import { getPrisma } from "@/lib/prisma";

const schema = z.object({
  profileId: z.string().min(1),
  prize: z.string().min(1),
  targetAudience: z.string().min(1),
  platform: z.string().min(1),
});

const resultSchema = z.object({
  title: z.string(),
  postCopy: z.string(),
  entryMechanic: z.string(),
  hashtags: z.array(z.string()),
  callToAction: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const prisma = await getPrisma();
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You generate social giveaway campaigns. Return valid JSON only.",
        },
        {
          role: "user",
          content: `Create a giveaway for ${body.platform}. Prize: ${body.prize}. Audience: ${body.targetAudience}. Include title, postCopy, entryMechanic, hashtags, and callToAction.`,
        },
      ],
    });

    const result = resultSchema.parse(JSON.parse(completion.choices[0]?.message?.content ?? "{}"));
    try {
      await prisma.giveawayCampaign.create({
        data: {
          profileId: body.profileId,
          title: result.title,
          prize: body.prize,
          entryMechanic: result.entryMechanic,
          postCopy: result.postCopy,
          hashtags: result.hashtags,
        },
      });
    } catch (persistError) {
      console.error(persistError);
      if (isDatabaseUnavailable(persistError)) {
        return NextResponse.json(result, { headers: { "x-data-source": "fallback" } });
      }
      throw persistError;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate giveaway campaign" }, { status: 500 });
  }
}
