import { NextResponse } from "next/server";
import { z } from "zod";

import { isDatabaseUnavailable } from "@/lib/database-errors";
import { getPrisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/api-auth";

const updateSchema = z.object({
  caption: z.string().min(1).optional(),
  hashtags: z.array(z.string()).optional(),
  platform: z.string().min(1).optional(),
  status: z.string().optional(),
  contentType: z.string().optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
  mediaUrl: z.string().url().optional().nullable(),
});

async function verifyContentOwnership(contentId: string, userId: string) {
  const prisma = await getPrisma();
  const item = await prisma.contentItem.findFirst({
    where: { id: contentId },
    select: { profile: { select: { userId: true } } },
  });
  return item?.profile.userId === userId;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const body = updateSchema.parse(await request.json());
    const { id } = await params;

    const owns = await verifyContentOwnership(id, user.userId);
    if (!owns) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const prisma = await getPrisma();
    const content = await prisma.contentItem.update({
      where: { id },
      data: {
        ...body,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : body.scheduledAt === null ? null : undefined,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : body.publishedAt === null ? null : undefined,
      },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error(error);

    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isDatabaseUnavailable(error)) {
      return NextResponse.json(
        { error: "Database unavailable." },
        { status: 503, headers: { "x-data-source": "fallback" } },
      );
    }
    return NextResponse.json({ error: "Failed to update content item" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const owns = await verifyContentOwnership(id, user.userId);
    if (!owns) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const prisma = await getPrisma();
    await prisma.contentItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isDatabaseUnavailable(error)) {
      return NextResponse.json(
        { error: "Database unavailable." },
        { status: 503, headers: { "x-data-source": "fallback" } },
      );
    }
    return NextResponse.json({ error: "Failed to delete content item" }, { status: 400 });
  }
}
