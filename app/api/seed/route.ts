import { NextResponse } from "next/server";

import { getFallbackProfiles } from "@/lib/default-data";
import { isDatabaseUnavailable } from "@/lib/database-errors";
import { getPrisma } from "@/lib/prisma";

export async function POST() {
  try {
    const prisma = await getPrisma();
    const profiles = await prisma.profile.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: {
            content: true,
            trends: true,
            giveaways: true,
          },
        },
      },
    });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error(error);

    if (isDatabaseUnavailable(error)) {
      return NextResponse.json(getFallbackProfiles(), {
        headers: { "x-data-source": "fallback" },
      });
    }

    return NextResponse.json({ error: "Failed to load profiles" }, { status: 500 });
  }
}
