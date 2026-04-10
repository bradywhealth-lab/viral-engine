import { NextResponse } from "next/server";
import { z } from "zod";

import { isDatabaseUnavailable } from "@/lib/database-errors";
import { getPrisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { verifyProfileOwnership } from "@/lib/profile-ownership";

const contentSchema = z.object({
  profileId: z.string().min(1),
  caption: z.string().min(1),
  hashtags: z.array(z.string()).default([]),
  platform: z.string().min(1),
  status: z.string().default("draft"),
  contentType: z.string().default("post"),
  scheduledAt: z.string().datetime().optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
  mediaUrl: z.string().url().optional().nullable(),
});

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

    const content = await prisma.contentItem.findMany({
      where: {
        profileId: profileId
          ? userProfileIds.includes(profileId) ? profileId : "__none__"
          : { in: userProfileIds },
      },
      orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error(error);

    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isDatabaseUnavailable(error)) {
      return NextResponse.json([], { headers: { "x-data-source": "fallback" } });
    }
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = contentSchema.parse(await request.json());

    const owns = await verifyProfileOwnership(body.profileId, user.userId);
    if (!owns) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const prisma = await getPrisma();
    const content = await prisma.contentItem.create({
      data: {
        ...body,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      },
    });

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error(error);

    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isDatabaseUnavailable(error)) {
      return NextResponse.json(
        { error: "Database unavailable; content was not saved." },
        { status: 503, headers: { "x-data-source": "fallback" } },
      );
    }
    return NextResponse.json({ error: "Failed to create content item" }, { status: 400 });
  }
}
