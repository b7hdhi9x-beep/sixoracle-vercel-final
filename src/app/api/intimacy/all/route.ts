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

// 認証ヘッダーからユーザーを取得する非同期関数
async function getAuthUser(request: NextRequest): Promise<User | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice(7);
  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return null;
  }
  return user;
}

/**
 * @swagger
 * /api/intimacy/all:
 *   get:
 *     summary: 全占い師との親密度一覧を取得
 *     description: 認証されたユーザーの、全ての占い師との親密度レベルの一覧を取得します。
 *     tags:
 *       - Intimacy
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 親密度一覧の取得に成功
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: 親密度レベルID
 *                   user_id:
 *                     type: string
 *                     description: ユーザーID
 *                   fortuneteller_id:
 *                     type: string
 *                     description: 占い師ID
 *                   intimacy_level:
 *                     type: integer
 *                     description: 親密度レベル
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: 作成日時
 *       401:
 *         description: 認証されていない
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authentication required"
 *       500:
 *         description: サーバー内部エラー
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve intimacy levels"
 */
export async function GET(request: NextRequest) {
  try {
    // 認証ユーザーを取得
    const user = await getAuthUser(request);
    if (!user) {
      // 認証されていない場合は401エラーを返す
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // intimacy_levelsテーブルからuser_idに一致する全ての親密度レベルを取得
    const { data: intimacyLevels, error } = await supabase
      .from("intimacy_levels")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      // データベースエラーが発生した場合は500エラーを返す
      console.error("Error fetching intimacy levels:", error);
      return NextResponse.json({ error: "Failed to retrieve intimacy levels" }, { status: 500 });
    }

    // 取得した親密度一覧をJSON形式で返す
    return NextResponse.json(intimacyLevels);

  } catch (e) {
    // 予期せぬエラーが発生した場合は500エラーを返す
    console.error("Unexpected error in GET /api/intimacy/all:", e);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
