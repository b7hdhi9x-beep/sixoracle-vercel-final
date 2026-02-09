import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized, badRequest, serverError } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { messageId } = await request.json();
    if (!messageId) return badRequest("messageIdが必要です。");

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("scheduled_messages")
      .update({ is_read: true })
      .eq("id", messageId)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError();
  }
}
