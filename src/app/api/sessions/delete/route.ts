import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabaseの管理者クライアントを取得する関数
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// 認証ヘッダーからユーザーを取得する非同期関数
async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

/**
 * DELETE /api/sessions/delete
 * セッションと関連するチャットメッセージを削除します。
 * @param request - NextRequestオブジェクト
 * @returns - NextResponseオブジェクト
 */
export async function DELETE(request: NextRequest) {
  try {
    // 認証ユーザーを取得
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // リクエストボディからsession_idを取得
    const { session_id } = await request.json();

    if (!session_id) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 最初にchat_messagesを削除
    const { error: messagesError } = await supabase
      .from("chat_messages")
      .delete()
      .eq("session_id", session_id)
      .eq("user_id", user.id);

    if (messagesError) {
      console.error("Error deleting chat messages:", messagesError);
      return NextResponse.json({ error: "Failed to delete chat messages" }, { status: 500 });
    }

    // 次にsessionを削除
    const { error: sessionError } = await supabase
      .from("sessions")
      .delete()
      .eq("id", session_id)
      .eq("user_id", user.id);

    if (sessionError) {
      console.error("Error deleting session:", sessionError);
      return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
    }

    return NextResponse.json({ message: "Session deleted successfully" });

  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
