const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

async function createPrismaClient() {
  const prismaModule = await import("@prisma/client");
  const PrismaClientCtor = (prismaModule as any).PrismaClient ?? (prismaModule as any).default?.PrismaClient;

  if (!PrismaClientCtor) {
    throw new Error("PrismaClient constructor not found in @prisma/client module.");
  }

  return new PrismaClientCtor({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export async function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = await createPrismaClient();
  }

  return globalForPrisma.prisma;
}
