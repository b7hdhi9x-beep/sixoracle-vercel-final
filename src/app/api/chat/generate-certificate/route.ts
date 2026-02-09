import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  return NextResponse.json({ url: null, message: "鑑定書生成機能は準備中です" });
}
