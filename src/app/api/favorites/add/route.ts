
import { NextRequest, NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";

/**
 * Supabaseの管理者権限クライアントを取得します。
 * 環境変数からURLとサービスロールキーを読み込んでクライアントを初期化します。
 * @returns Supabaseクライアントインスタンス
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
 * @param request - NextRequestオブジェクト
 * @returns 認証済みユーザーオブジェクト、または未認証の場合はnull
 */
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
 * POST /api/favorites/add
 * ユーザーIDとオラクルIDを受け取り、favoritesテーブルにお気に入りを追加します。
 * 重複チェックを行い、既に存在する場合は追加しません。
 * 
 * @param request - NextRequestオブジェクト。ボディに { "oracle_id": string } を含むこと。
 * @returns - NextResponseオブジェクト
 */
export async function POST(request: NextRequest) {
  try {
    // 認証ユーザーの取得
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "認証されていません。" }, { status: 401 });
    }

    // リクエストボディのパース
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "無効なリクエストボディです。" }, { status: 400 });
    }

    const { oracle_id } = body;
    const user_id = user.id;

    // バリデーション
    if (!oracle_id) {
      return NextResponse.json({ error: "oracle_idは必須です。" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 重複チェック
    const { data: existingFavorite, error: selectError } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user_id)
      .eq("oracle_id", oracle_id)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116は行が見つからない場合のエラー
      console.error("お気に入りチェックエラー:", selectError);
      return NextResponse.json({ error: "データベースエラーが発生しました。" }, { status: 500 });
    }

    if (existingFavorite) {
      return NextResponse.json({ message: "既にお気に入りに追加されています。" }, { status: 200 });
    }

    // favoritesテーブルに挿入
    const { error: insertError } = await supabase
      .from("favorites")
      .insert({ user_id, oracle_id });

    if (insertError) {
      console.error("お気に入り追加エラー:", insertError);
      return NextResponse.json({ error: "お気に入りの追加に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ message: "お気に入りに追加しました。" }, { status: 201 });

  } catch (error) {
    console.error("予期せぬエラー:", error);
    return NextResponse.json({ error: "サーバー内部で予期せぬエラーが発生しました。" }, { status: 500 });
  }
}
