import { NextResponse } from "next/server";
import { z } from "zod";

import { getPrisma } from "@/lib/prisma";

const createProfileSchema = z.object({
  name: z.string().min(1),
  niche: z.string().min(1),
  platforms: z.array(z.string().min(1)).min(1),
  avatarColor: z.string().optional(),
});

export async function GET() {
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
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = createProfileSchema.parse(await request.json());
    const prisma = await getPrisma();
    const profile = await prisma.profile.create({ data: body });
    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 400 });
  }
}
