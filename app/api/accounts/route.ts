import { NextResponse } from "next/server";
import { z } from "zod";

const HARDCODED_ACCOUNTS = [
  {
    id: "crime-docs",
    name: "Crime Docs",
    niche: "True Crime",
    platforms: ["youtube", "tiktok"],
    postCount: 142,
    followerCount: 45200,
  },
  {
    id: "motivation",
    name: "Motivation",
    niche: "Motivation",
    platforms: ["tiktok", "instagram"],
    postCount: 89,
    followerCount: 23100,
  },
  {
    id: "finance-tips",
    name: "Finance Tips",
    niche: "Finance",
    platforms: ["tiktok", "instagram"],
    postCount: 67,
    followerCount: 18900,
  },
  {
    id: "brothers-sports-cards",
    name: "Brothers Sports Cards",
    niche: "Sports Cards",
    platforms: ["instagram"],
    postCount: 203,
    followerCount: 34500,
  },
  {
    id: "sisters-cooking",
    name: "Sisters Cooking",
    niche: "Cooking",
    platforms: ["instagram"],
    postCount: 156,
    followerCount: 28700,
  },
];

const createAccountSchema = z.object({
  name: z.string().min(1),
  niche: z.string().min(1),
  platforms: z.array(z.enum(["youtube", "tiktok", "instagram"])).min(1),
});

export async function GET() {
  return NextResponse.json(HARDCODED_ACCOUNTS);
}

export async function POST(request: Request) {
  try {
    const body = createAccountSchema.parse(await request.json());
    const newAccount = {
      id: body.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
      name: body.name,
      niche: body.niche,
      platforms: body.platforms,
      postCount: 0,
      followerCount: 0,
    };
    return NextResponse.json(newAccount, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 400 });
  }
}
