
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
 * POST /api/sessions/pin
 * セッションのピン留め状態をトグルします。
 * @param request - NextRequestオブジェクト
 * @returns - NextResponseオブジェクト
 */
export async function POST(request: NextRequest) {
  try {
    // 認証ユーザーを取得
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // リクエストボディをパース
    const { session_id, is_pinned } = await request.json();

    // パラメータのバリデーション
    if (!session_id || typeof is_pinned !== 'boolean') {
      return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // セッションの存在と所有権を確認
    const { data: existingSession, error: selectError } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single();

    if (selectError || !existingSession) {
        return NextResponse.json({ error: "Session not found or access denied" }, { status: 404 });
    }

    // sessionsテーブルのis_pinnedを更新
    const { error: updateError } = await supabase
      .from("sessions")
      .update({ is_pinned })
      .eq("id", session_id)
      .eq("user_id", user.id); // 念のため、ここでもuser_idを条件に加える

    if (updateError) {
      console.error("Error updating session pin status:", updateError);
      return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
    }

    return NextResponse.json({ message: "Session pin status updated successfully" });

  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
