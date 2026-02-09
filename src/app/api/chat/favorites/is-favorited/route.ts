import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized } from "@/lib/serverAuth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  const messageId = request.nextUrl.searchParams.get("messageId");
  if (!messageId) return NextResponse.json({ isFavorited: false });
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("favorite_messages").select("id").eq("user_id", user.id).eq("message_id", messageId).single();
  return NextResponse.json({ isFavorited: !!data });
}
