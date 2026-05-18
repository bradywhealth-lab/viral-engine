import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth, AuthError } from "@/lib/api-auth";
import { getOpenAI } from "@/lib/openai";

const schema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(4000),
    }),
  ).min(1).max(40),
});

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = schema.parse(await request.json());

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a social media growth expert specializing in viral content strategy. Help with content ideas, hashtag research, caption writing, content calendar planning, competitor research, and trend analysis. Keep responses concise and actionable. Format lists with bullet points.",
        },
        ...body.messages,
      ],
      max_tokens: 800,
    });

    const reply = completion.choices[0]?.message?.content ?? "I couldn't generate a response. Please try again.";
    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("AI chat error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}
