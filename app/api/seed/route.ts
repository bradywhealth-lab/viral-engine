import { NextResponse } from "next/server";

import { getPrisma } from "@/lib/prisma";

const defaults = [
  {
    name: "King Cards",
    niche: "Sports Cards",
    platforms: ["tiktok", "instagram", "youtube"],
    avatarColor: "#f59e0b",
  },
  {
    name: "Chefs Corner",
    niche: "Cooking & Baking",
    platforms: ["instagram", "tiktok"],
    avatarColor: "#10b981",
  },
  {
    name: "BDUBB Faceless",
    niche: "Finance & AI Tools",
    platforms: ["tiktok", "instagram", "youtube"],
    avatarColor: "#6366f1",
  },
];

export async function POST() {
  try {
    const prisma = await getPrisma();
    const count = await prisma.profile.count();
    if (count === 0) {
      await prisma.profile.createMany({ data: defaults });
    }

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
    return NextResponse.json({ error: "Failed to seed profiles" }, { status: 500 });
  }
}
