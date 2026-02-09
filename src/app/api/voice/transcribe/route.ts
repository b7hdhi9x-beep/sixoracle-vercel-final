import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  return NextResponse.json({ text: "", error: "音声文字起こし機能は準備中です" });
}
