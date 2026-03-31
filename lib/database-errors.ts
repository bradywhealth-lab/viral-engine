import { Prisma } from "@prisma/client";

/** Prisma error codes that mean the app should use in-memory / empty fallbacks. */
const DATABASE_UNAVAILABLE_CODES = new Set([
  "P1000",
  "P1001",
  "P1002",
  "P1003",
  "P1011",
  "P1013",
  "P1017",
  "P2021",
]);

export function isDatabaseUnavailable(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (DATABASE_UNAVAILABLE_CODES.has(error.code)) {
      return true;
    }
    // pg adapter / driver can surface connection failures with OS-style codes (not P####).
    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT" || error.code === "ENOTFOUND") {
      return true;
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    return (
      message.includes("can't reach database") ||
      message.includes("database does not exist") ||
      message.includes("relation") && message.includes("does not exist") ||
      message.includes("database url") ||
      message.includes("datasource") ||
      message.includes("prismaclientinitializationerror") ||
      message.includes("prismaclientconstructorvalidationerror") ||
      message.includes("econnrefused") ||
      message.includes("getaddrinfo enotfound")
    );
  }

  return false;
}
