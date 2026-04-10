import { NextResponse } from "next/server";

import { isDatabaseUnavailable } from "@/lib/database-errors";
import { getPrisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const prisma = await getPrisma();
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    // Get user's profile IDs for scoping
    const userProfiles = await prisma.profile.findMany({
      where: { userId: user.userId },
      select: { id: true },
    });
    const userProfileIds = userProfiles.map((p) => p.id);

    const giveaways = await prisma.giveawayCampaign.findMany({
      where: {
        profileId: profileId
          ? userProfileIds.includes(profileId) ? profileId : "__none__"
          : { in: userProfileIds },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(giveaways);
  } catch (error) {
    console.error(error);

    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isDatabaseUnavailable(error)) {
      return NextResponse.json([], { headers: { "x-data-source": "fallback" } });
    }
    return NextResponse.json({ error: "Failed to fetch giveaways" }, { status: 500 });
  }
}
