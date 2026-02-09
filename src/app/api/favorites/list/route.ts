
import { NextRequest, NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";

/**
 * Supabaseの管理者クライアントを取得します。
 * 環境変数からURLとサービスロールキーを読み込んでクライアントを初期化します。
 * @returns {SupabaseClient} Supabaseクライアントインスタンス
 */
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * リクエストのAuthorizationヘッダーから認証済みユーザー情報を取得します。
 * @param {NextRequest} request - Next.jsのリクエストオブジェクト
 * @returns {Promise<User | null>} 認証されたユーザーオブジェクト、または認証失敗時はnull
 */
async function getAuthUser(request: NextRequest): Promise<User | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  
  const token = authHeader.slice(7);
  const supabase = getSupabaseAdmin();
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

/**
 * GET /api/favorites/list
 * 認証されたユーザーのお気に入り占い師一覧を取得します。
 * favoritesテーブルからユーザーIDに紐づくデータをsort_orderの昇順で取得します。
 * 
 * @param {NextRequest} request - Next.jsのリクエストオブジェクト
 * @returns {Promise<NextResponse>} お気に入り一覧のJSONレスポンス、またはエラーレスポンス
 */
export async function GET(request: NextRequest) {
  try {
    // リクエストヘッダーからユーザー情報を取得して認証
    const user = await getAuthUser(request);
    if (!user) {
      // 認証失敗時は401エラーを返す
      return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
    }

    // Supabase管理者クライアントを取得
    const supabase = getSupabaseAdmin();

    // favoritesテーブルからユーザーのお気に入り一覧をsort_order順で取得
    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true });

    // データベースクエリでエラーが発生した場合
    if (error) {
      console.error("Supabaseエラー:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 取得したお気に入り一覧をJSONで返す
    return NextResponse.json(data);

  } catch (err) {
    // 予期せぬエラーが発生した場合
    console.error("予期せぬエラー:", err);
    const errorMessage = err instanceof Error ? err.message : "不明なエラーが発生しました。";
    return NextResponse.json({ error: "サーバー内部でエラーが発生しました。", details: errorMessage }, { status: 500 });
  }
}
