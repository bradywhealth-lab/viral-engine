import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");

const COOKIE_NAME = "vev-session";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface JwtPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: TOKEN_MAX_AGE });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as JwtPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: JwtPayload): Promise<void> {
  const token = signToken(payload);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    path: "/",
    maxAge: TOKEN_MAX_AGE,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
}

export async function getSessionFromCookie(): Promise<JwtPayload | null> {
  const jar = await cookies();
  const cookie = jar.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  return verifyToken(cookie.value);
}

export { COOKIE_NAME };
