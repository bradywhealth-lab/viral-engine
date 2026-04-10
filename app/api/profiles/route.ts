import { NextResponse } from "next/server";
import { z } from "zod";

import { addFallbackProfile, getFallbackProfiles } from "@/lib/default-data";
import { isDatabaseUnavailable } from "@/lib/database-errors";
import { getPrisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/api-auth";

const createProfileSchema = z.object({
  name: z.string().min(1),
  niche: z.string().min(1),
  platforms: z.array(z.string().min(1)).min(1),
  avatarColor: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();
    const prisma = await getPrisma();
    const profiles = await prisma.profile.findMany({
      where: { userId: user.userId },
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

    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isDatabaseUnavailable(error)) {
      return NextResponse.json(getFallbackProfiles(), {
        headers: { "x-data-source": "fallback" },
      });
    }

    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = createProfileSchema.parse(await request.json());
    const prisma = await getPrisma();
    const profile = await prisma.profile.create({
      data: { ...body, userId: user.userId },
    });
    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error(error);

    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isDatabaseUnavailable(error)) {
      const body = createProfileSchema.parse(await request.json().catch(() => ({})));
      const fallbackProfile = addFallbackProfile(body);
      return NextResponse.json(fallbackProfile, {
        status: 201,
        headers: { "x-data-source": "fallback" },
      });
    }

    return NextResponse.json({ error: "Failed to create profile" }, { status: 400 });
  }
}
