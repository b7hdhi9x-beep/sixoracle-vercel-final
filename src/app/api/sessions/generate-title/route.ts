import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  const { sessionId } = await request.json();
  const supabase = getSupabaseAdmin();
  const { data: messages } = await supabase.from("chat_messages").select("content, role").eq("session_id", sessionId).order("created_at", { ascending: true }).limit(5);
  if (!messages || messages.length === 0) return NextResponse.json({ success: false });
  const firstUserMsg = messages.find(m => m.role === "user");
  const title = firstUserMsg ? firstUserMsg.content.substring(0, 40) : "会話";
  await supabase.from("chat_sessions").update({ title }).eq("id", sessionId);
  return NextResponse.json({ success: true, title });
}
