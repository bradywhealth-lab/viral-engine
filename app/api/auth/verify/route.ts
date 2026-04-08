import { NextResponse } from "next/server";

const ACCESS_CODE = process.env.VEV_ACCESS_CODE;

if (!ACCESS_CODE) {
  throw new Error("VEV_ACCESS_CODE environment variable is required");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string };
    if (!body.code || body.code.trim() !== ACCESS_CODE) {
      return NextResponse.json({ success: false, error: "Invalid access code" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set("vev-auth", "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
