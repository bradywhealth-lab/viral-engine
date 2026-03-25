import { NextResponse } from "next/server";
import { z } from "zod";

import { getOpenAI } from "@/lib/openai";

const schema = z.object({
  profileId: z.string().min(1),
  niche: z.string().min(1),
  keyword: z.string().min(1),
  platform: z.string().min(1),
  tone: z.string().min(1),
});

const responseSchema = z.object({
  ideas: z.array(
    z.object({
      title: z.string(),
      caption: z.string(),
      hashtags: z.array(z.string()),
      contentType: z.string(),
      estimatedReach: z.string(),
    }),
  ),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an elite social media content strategist. Return strictly valid JSON in the shape {\"ideas\": [...]}. Generate ten practical, platform-native content ideas.",
        },
        {
          role: "user",
          content: `Profile ${body.profileId} operates in ${body.niche}. Keyword: ${body.keyword}. Platform: ${body.platform}. Tone: ${body.tone}. Generate 10 ideas with title, caption, hashtags, contentType, estimatedReach.`,
        },
      ],
    });

    const parsed = responseSchema.parse(JSON.parse(completion.choices[0]?.message?.content ?? "{\"ideas\":[]}"));
    return NextResponse.json(parsed.ideas);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate content ideas" }, { status: 500 });
  }
}
