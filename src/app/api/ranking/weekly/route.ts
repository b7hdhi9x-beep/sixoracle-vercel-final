import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabaseの管理クライアントを初期化
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// 認証ヘッダーからユーザーを取得
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
 * GET /api/ranking/weekly
 * 週間ランキングを取得するAPI
 * chat_messagesテーブルから過去7日間のメッセージ数でユーザーをランキングし、上位20名を返します。
 * ユーザー情報も結合して返します。
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    // 過去7日間の日付を計算
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // RPCを呼び出してランキングデータを取得
    const { data, error } = await supabase.rpc('get_weekly_ranking', { 
      since: sevenDaysAgo.toISOString()
    });

    if (error) {
      console.error("Error fetching weekly ranking:", error);
      return NextResponse.json(
        { error: "ランキングの取得に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("Unexpected error in GET /api/ranking/weekly:", e);
    return NextResponse.json(
      { error: "予期せぬエラーが発生しました。" },
      { status: 500 }
    );
  }
}
