import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabaseの管理者クライアントをシングルトンで取得する関数
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// 認証ヘッダーからユーザー情報を取得する関数
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
 * POST /api/sessions/archive
 * セッションのアーカイブ状態を切り替えます。
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
    const { session_id, is_archived } = await request.json();

    // バリデーション
    if (!session_id || typeof is_archived !== 'boolean') {
      return NextResponse.json({ error: "session_id and is_archived are required." }, { status: 400 });
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
        return NextResponse.json({ error: "Session not found or permission denied." }, { status: 404 });
    }

    // セッションのアーカイブ状態を更新
    const { data, error } = await supabase
      .from("sessions")
      .update({ is_archived })
      .eq("id", session_id)
      .select();

    if (error) {
      console.error("Error updating session:", error);
      return NextResponse.json({ error: "Failed to update session." }, { status: 500 });
    }

    return NextResponse.json({ message: "Session archive status updated successfully.", data });

  } catch (e) {
    console.error("Unexpected error:", e);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
