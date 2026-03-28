import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  // DATABASE_URL must point to the Supabase Session Mode Pooler
  // (aws-0-<region>.pooler.supabase.com:5432) so Vercel's IPv6 egress can reach it.
  // The direct connection (db.<ref>.supabase.co) is IPv4-only and unreachable from Vercel.
  const connectionString = process.env.DATABASE_URL;

  const pool = new Pool({
    connectionString,
    // Keep pool small for serverless — each cold start gets its own instance.
    max: 1,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 10000,
    // Supabase requires SSL for all connections.
    ssl: connectionString?.includes("supabase.co")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export async function getPrisma(): Promise<PrismaClient> {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}
