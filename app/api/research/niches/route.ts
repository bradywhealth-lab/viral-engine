import { NextResponse } from "next/server";
import OpenAI from "openai";

const MOCK_NICHES = [
  {
    name: "Microscopic Art",
    growthScore: 87,
    competition: "Low",
    platformFit: ["TikTok", "Instagram"],
    contentIdeas: ["Painting on rice grains", "Micro-sculpture tutorials", "Behind-the-scenes microscopy", "Speed art videos"],
  },
  {
    name: "Vintage Tech Restoration",
    growthScore: 72,
    competition: "Medium",
    platformFit: ["YouTube", "Instagram"],
    contentIdeas: ["Restoring old Walkmans", "CRT TV repairs", "Vintage gaming console fixes", "Found footage rescues"],
  },
  {
    name: "Foraging & Wild Cooking",
    growthScore: 68,
    competition: "Low",
    platformFit: ["TikTok", "YouTube", "Instagram"],
    contentIdeas: ["Wild mushroom identification", "Campfire cooking", "Seasonal foraging guides", "Survival recipes"],
  },
];

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(MOCK_NICHES);
  }

  try {
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a social media niche expert. Return a JSON array of 3 untapped social media niches with high growth potential. Each niche should have: name (string), growthScore (number 0-100), competition (Low/Medium/High), platformFit (array of strings), contentIdeas (array of 3-4 strings).",
        },
        {
          role: "user",
          content: "Find 3 untapped social media niches with high growth potential and low competition.",
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from OpenAI");

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed.niches || parsed);
  } catch (error) {
    console.error("OpenAI error:", error);
    return NextResponse.json(MOCK_NICHES);
  }
}
