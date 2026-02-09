import { NextRequest, NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";

// Supabaseの管理クライアントを初期化して返す関数
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// 認証ヘッダーからユーザー情報を取得する関数
async function getAuthUser(request: NextRequest): Promise<User | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

/**
 * 特定セッションのメッセージ一覧を取得するAPI
 * @param request NextRequest
 * @returns NextResponse
 */
export async function GET(request: NextRequest) {
  try {
    // 認証ユーザーを取得
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // クエリパラメータからsession_idを取得
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get("session_id");

    // session_idがない場合はエラー
    if (!session_id) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // chat_messagesテーブルから指定されたsession_idのメッセージを取得し、created_atで昇順にソート
    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", session_id)
      .order("created_at", { ascending: true });

    // DBからの取得時にエラーが発生した場合
    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }

    // 成功レスポンス
    return NextResponse.json(messages);

  } catch (e) {
    // 予期せぬエラー
    const err = e as Error;
    console.error("Unexpected error:", err.message);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
