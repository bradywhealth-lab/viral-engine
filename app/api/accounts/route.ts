import { NextResponse } from "next/server";
import { z } from "zod";

// Accounts are stored in-memory per session; new users start with an empty list.
const accounts: Array<{
  id: string;
  name: string;
  niche: string;
  platforms: string[];
  postCount: number;
  followerCount: number;
}> = [];

const createAccountSchema = z.object({
  name: z.string().min(1),
  niche: z.string().min(1),
  platforms: z.array(z.enum(["youtube", "tiktok", "instagram"])).min(1),
});

export async function GET() {
  return NextResponse.json(accounts);
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
    accounts.push(newAccount);
    return NextResponse.json(newAccount, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 400 });
  }
}
