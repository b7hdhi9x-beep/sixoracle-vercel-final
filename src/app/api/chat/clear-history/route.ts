import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  const { oracleId } = await request.json();
  const supabase = getSupabaseAdmin();
  await supabase.from("chat_sessions").update({ is_active: false }).eq("user_id", user.id).eq("oracle_id", oracleId);
  return NextResponse.json({ success: true });
}
