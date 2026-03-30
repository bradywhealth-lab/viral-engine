import { NextResponse } from "next/server";
import { z } from "zod";

import { isDatabaseUnavailable } from "@/lib/database-errors";
import { getPrisma } from "@/lib/prisma";

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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = updateSchema.parse(await request.json());
    const { id } = await params;
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
    const { id } = await params;
    const prisma = await getPrisma();
    await prisma.contentItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if (isDatabaseUnavailable(error)) {
      return NextResponse.json(
        { error: "Database unavailable." },
        { status: 503, headers: { "x-data-source": "fallback" } },
      );
    }
    return NextResponse.json({ error: "Failed to delete content item" }, { status: 400 });
  }
}
