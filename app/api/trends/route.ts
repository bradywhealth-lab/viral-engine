import { NextResponse } from "next/server";

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
    return NextResponse.json({ error: "Failed to fetch trend alerts" }, { status: 500 });
  }
}
