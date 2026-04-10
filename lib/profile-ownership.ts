import { getPrisma } from "@/lib/prisma";

/**
 * Verify that a profile belongs to the given user.
 * Returns true if the profile exists and belongs to the user.
 */
export async function verifyProfileOwnership(
  profileId: string,
  userId: string,
): Promise<boolean> {
  const prisma = await getPrisma();
  const profile = await prisma.profile.findFirst({
    where: { id: profileId, userId },
    select: { id: true },
  });
  return profile !== null;
}
