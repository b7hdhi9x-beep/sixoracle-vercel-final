import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabaseの管理者権限クライアントを取得
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
 * お気に入りから削除するAPIルート
 * @param request NextRequest
 * @returns NextResponse
 */
export async function DELETE(request: NextRequest) {
  try {
    // ユーザー認証
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // リクエストボディからoracle_idを取得
    const { oracle_id } = await request.json();

    if (!oracle_id) {
      return NextResponse.json({ error: "oracle_id is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // favoritesテーブルから該当レコードを削除
    const { error } = await supabase
      .from("favorites")
      .delete()
      .match({ user_id: user.id, oracle_id: oracle_id });

    if (error) {
      console.error("Error deleting favorite:", error);
      return NextResponse.json({ error: "Failed to delete favorite" }, { status: 500 });
    }

    return NextResponse.json({ message: "Favorite removed successfully" }, { status: 200 });

  } catch (err) {
    console.error("An unexpected error occurred:", err);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
