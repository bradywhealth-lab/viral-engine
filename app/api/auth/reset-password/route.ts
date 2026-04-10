import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    const { token, newPassword, confirmPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Token and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match" },
        { status: 400 }
      );
    }

    const prisma = await getPrisma();

    // Find valid, non-expired token
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }

    if (resetRecord.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
      return NextResponse.json(
        { success: false, error: "This reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash new password and update user
    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      // Delete all reset tokens for this user
      prisma.passwordReset.deleteMany({ where: { userId: resetRecord.userId } }),
    ]);

    console.log(`[PASSWORD RESET] Password successfully reset for user ${resetRecord.user.email}`);

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully. You can now sign in.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
