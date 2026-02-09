import { NextRequest, NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";

// Supabaseの管理クライアントをシングルトンで取得
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// 認証ヘッダーからユーザーを取得
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
 * GET /api/notifications/list
 * ユーザーの通知一覧を取得します。
 * @param request - NextRequestオブジェクト
 * @returns - 通知一覧またはエラーレスポンス
 */
export async function GET(request: NextRequest) {
  try {
    // 認証ユーザーを取得
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // notificationsテーブルからユーザーIDに一致する通知を作成日時の降順で取得
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }

    return NextResponse.json(notifications);
  } catch (e) {
    console.error("An unexpected error occurred:", e);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
