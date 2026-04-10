import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Always return success for security (don't reveal if email exists)
    const successResponse = NextResponse.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    });

    const prisma = await getPrisma();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return successResponse;
    }

    // Delete any existing reset tokens for this user
    await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

    // Create new reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Log the reset link (no email sending yet)
    console.log(`[PASSWORD RESET] Token for ${email}: ${token}`);
    console.log(`[PASSWORD RESET] Reset URL: /auth/reset-password?token=${token}`);

    return successResponse;
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
