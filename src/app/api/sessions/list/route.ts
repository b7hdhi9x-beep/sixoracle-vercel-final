
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabaseの管理クライアントをシングルトンで取得する関数
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// リクエストヘッダーのAuthorizationトークンから認証済みユーザー情報を取得する関数
async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    console.log("Authorization header is missing or not Bearer");
    return null;
  }
  const token = authHeader.slice(7);
  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    console.error("Failed to get user from token:", error?.message);
    return null;
  }
  return user;
}

/**
 * GET /api/sessions/list
 * ユーザーのチャットセッション一覧を取得します。
 * クエリパラメータによるフィルタリングとソートが可能です。
 */
export async function GET(request: NextRequest) {
  try {
    // ユーザー認証
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const oracleId = searchParams.get("oracle_id");

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", user.id); // 自分のセッションのみ取得

    // oracle_idによるフィルタリング
    if (oracleId) {
      query = query.eq("oracle_id", oracleId);
    }

    // is_pinned (降順)、is_archived (昇順) の順でソート
    query = query.order("is_pinned", { ascending: false }).order("is_archived", { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching chat sessions:", error.message);
      throw new Error(error.message);
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
