import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      confirmPassword?: string;
      name?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const confirmPassword = body.confirmPassword;
    const name = body.name?.trim() || null;

    // Validation
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Email, password, and confirm password are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match" },
        { status: 400 }
      );
    }

    const prisma = await getPrisma();

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    // Set session cookie
    await setSessionCookie({ userId: user.id, email: user.email });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
