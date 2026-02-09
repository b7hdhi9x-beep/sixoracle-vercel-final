import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  return NextResponse.json({ url: null, oracleName: "", blessing: "", message: "お守り生成機能は準備中です" });
}
