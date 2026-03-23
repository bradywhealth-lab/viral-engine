import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      tiktok: ["7:00 AM", "12:00 PM", "7:00 PM"],
      instagram: ["8:00 AM", "2:00 PM", "5:00 PM"],
      youtube: ["12:00 PM", "3:00 PM", "8:00 PM"],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch analytics best times" }, { status: 500 });
  }
}
