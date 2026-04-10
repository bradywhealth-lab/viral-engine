import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const prisma = await getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
