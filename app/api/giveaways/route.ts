import { NextResponse } from "next/server";

import { getPrisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const prisma = await getPrisma();
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    const giveaways = await prisma.giveawayCampaign.findMany({
      where: profileId ? { profileId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(giveaways);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch giveaways" }, { status: 500 });
  }
}
