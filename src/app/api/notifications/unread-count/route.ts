
import { NextRequest, NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";

// Supabaseの管理者クライアントを取得する関数
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
  if (!authHeader?.startsWith("Bearer ")) {
    // Authorizationヘッダーが存在しない、または形式が正しくない場合
    return null;
  }
  const token = authHeader.slice(7);
  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    // トークンが無効、またはユーザーが取得できない場合
    return null;
  }
  return user;
}

/**
 * GET /api/notifications/unread-count
 * 未読の通知数を取得します。
 * @param request - NextRequestオブジェクト
 * @returns - 未読通知数を含むJSONレスポンス
 */
export async function GET(request: NextRequest) {
  try {
    // 認証ユーザーを取得
    const user = await getAuthUser(request);
    if (!user) {
      // 認証されていない場合は401エラーを返す
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Supabase管理者クライアントを初期化
    const supabase = getSupabaseAdmin();

    // 未読通知の数をカウント
    // notificationsテーブルから、user_idが一致し、is_readがfalseのレコードをカウントする
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      // DBからのデータ取得でエラーが発生した場合
      console.error("Error fetching unread count:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    // 未読通知数をレスポンスとして返す
    return NextResponse.json({ unread_count: count ?? 0 });

  } catch (e) {
    // 予期せぬエラーが発生した場合
    console.error("Unexpected error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
