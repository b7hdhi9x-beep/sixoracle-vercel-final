
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabaseの管理者クライアントを取得する共通関数
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// 認証ヘッダーからユーザー情報を取得する共通関数
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
 * POST /api/mbti/save
 * MBTI診断結果をデータベースに保存します。
 * 
 * @param {NextRequest} request - クライアントからのリクエストオブジェクト
 * @returns {NextResponse} - サーバーからのレスポンスオブジェクト
 */
export async function POST(request: NextRequest) {
  try {
    // ユーザー認証を行う
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "認証されていません。" }, { status: 401 });
    }

    // リクエストボディから診断結果を取得
    const { oracle_id, mbti_type, analysis } = await request.json();

    // 必須パラメータの存在チェック
    if (!oracle_id || !mbti_type || !analysis) {
      return NextResponse.json({ error: "必須パラメータが不足しています。" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const share_id = crypto.randomUUID(); // 共有用のユニークIDを生成

    // mbti_resultsテーブルにデータを挿入
    const { data, error } = await supabase
      .from("mbti_results")
      .insert([
        {
          user_id: user.id,
          oracle_id,
          mbti_type,
          analysis,
          share_id,
        },
      ])
      .select()
      .single();

    // DB挿入時にエラーが発生した場合
    if (error) {
      console.error("Supabaseエラー:", error);
      return NextResponse.json({ error: "診断結果の保存に失敗しました。", details: error.message }, { status: 500 });
    }

    // 保存成功時、生成した共有IDを含むデータを返す
    return NextResponse.json({ message: "診断結果が正常に保存されました。", result: data }, { status: 201 });

  } catch (e) {
    // 予期せぬエラー処理
    const error = e as Error;
    console.error("予期せぬエラー:", error);
    return NextResponse.json({ error: "サーバー内部でエラーが発生しました。", details: error.message }, { status: 500 });
  }
}
