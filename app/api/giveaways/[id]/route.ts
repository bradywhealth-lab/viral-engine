import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth, AuthError } from "@/lib/api-auth";
import { getPrisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["draft", "active", "completed"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = schema.parse(await request.json());

    const prisma = await getPrisma();

    const campaign = await prisma.giveawayCampaign.findUnique({ where: { id } });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const userProfiles = await prisma.profile.findMany({
      where: { userId: user.userId },
      select: { id: true },
    });
    const userProfileIds = userProfiles.map((p) => p.id);

    if (!userProfileIds.includes(campaign.profileId)) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const updated = await prisma.giveawayCampaign.update({
      where: { id },
      data: { status: body.status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}
