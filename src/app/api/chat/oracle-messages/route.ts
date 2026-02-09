import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized } from "@/lib/serverAuth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  const oracleId = request.nextUrl.searchParams.get("oracleId");
  if (!oracleId) return NextResponse.json({ messages: [], sessionId: null });
  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase.from("chat_sessions").select("id").eq("user_id", user.id).eq("oracle_id", oracleId).eq("is_active", true).order("updated_at", { ascending: false }).limit(1).single();
  if (!session) return NextResponse.json({ messages: [], sessionId: null });
  const { data: messages } = await supabase.from("chat_messages").select("*").eq("session_id", session.id).order("created_at", { ascending: true });
  return NextResponse.json({ messages: messages || [], sessionId: session.id });
}
