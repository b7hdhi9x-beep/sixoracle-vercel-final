import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  const { oracleId } = await request.json();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("chat_sessions").insert({ user_id: user.id, oracle_id: oracleId, title: "新しい相談" }).select().single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, sessionId: data.id });
}
