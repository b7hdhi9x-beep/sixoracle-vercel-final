
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabaseの管理者クライアントをシングルトンで取得する関数
function getSupabaseAdmin() {
  // 環境変数からSupabaseのURLとサービスロールキーを取得してクライアントを初期化
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// リクエストヘッダーの認証情報からユーザー情報を取得する非同期関数
async function getAuthUser(request: NextRequest) {
  // Authorizationヘッダーを取得
  const authHeader = request.headers.get("Authorization");
  // ヘッダーが存在しない、または'Bearer 'で始まらない場合はnullを返す
  if (!authHeader?.startsWith("Bearer ")) return null;
  // 'Bearer 'を除いたトークン部分を抽出
  const token = authHeader.slice(7);
  const supabase = getSupabaseAdmin();
  // トークンを使ってユーザー情報を取得
  const { data: { user }, error } = await supabase.auth.getUser(token);
  // エラーが発生した、またはユーザーが存在しない場合はnullを返す
  if (error || !user) return null;
  return user;
}

/**
 * GET /api/intimacy/oracle
 * 特定の占い師との親密度を取得します。
 * @param request NextRequest
 * @returns NextResponse
 */
export async function GET(request: NextRequest) {
  try {
    // 認証ユーザーを取得
    const user = await getAuthUser(request);
    if (!user) {
      // 認証されていない場合は401エラーを返す
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // クエリパラメータからoracle_idを取得
    const { searchParams } = new URL(request.url);
    const oracle_id = searchParams.get("oracle_id");

    if (!oracle_id) {
      // oracle_idが指定されていない場合は400エラーを返す
      return NextResponse.json({ error: "oracle_id is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // intimacy_levelsテーブルから親密度データを取得
    const { data, error } = await supabase
      .from("intimacy_levels")
      .select("level, experience, total_messages, consecutive_days")
      .eq("user_id", user.id)
      .eq("oracle_id", oracle_id)
      .single(); // 該当するレコードが1つであることを期待

    if (error) {
        if (error.code === 'PGRST116') {
            // レコードが見つからない場合は、デフォルト値を返すか、特定のステータスコードで応答
            // ここでは空の配列ではなく、親密度がまだ存在しないことを示すためにnullまたは初期値を返すのが一般的
            return NextResponse.json({ 
                level: 1, 
                experience: 0, 
                total_messages: 0, 
                consecutive_days: 0 
            }, { status: 200 });
        }
      // その他のデータベースエラーの場合は500エラーを返す
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    // 取得したデータを返す
    return NextResponse.json(data);

  } catch (e) {
    // 予期せぬエラーが発生した場合
    console.error("Unexpected error:", e);
    const errorResponse = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Internal Server Error", details: errorResponse }, { status: 500 });
  }
}
