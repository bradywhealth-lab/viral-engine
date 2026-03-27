import { NextResponse } from "next/server";

import { isDatabaseUnavailable } from "@/lib/database-errors";
import { getPrisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const prisma = await getPrisma();
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    const alerts = await prisma.trendAlert.findMany({
      where: profileId ? { profileId } : undefined,
      orderBy: { detectedAt: "desc" },
      take: 12,
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error(error);

    if (isDatabaseUnavailable(error)) {
      return NextResponse.json([], { headers: { "x-data-source": "fallback" } });
    }

    return NextResponse.json({ error: "Failed to fetch trend alerts" }, { status: 500 });
  }
}
