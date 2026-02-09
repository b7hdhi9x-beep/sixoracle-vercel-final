import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { User } from "@supabase/supabase-js";

// Supabaseの管理者クライアントをシングルトンで取得
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
  if (!authHeader?.startsWith("Bearer ")) {
    console.log("Authorization header is missing or invalid");
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
 * ユーザーの報酬一覧を取得します。
 * @param request NextRequest
 * @returns NextResponse
 */
export async function GET(request: NextRequest) {
  try {
    // 認証ユーザーを取得
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // rewardsテーブルからユーザーの報酬一覧を取得
    const { data: rewards, error } = await supabase
      .from("rewards")
      .select("status, type, amount, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching rewards:", error.message);
      return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 });
    }

    return NextResponse.json(rewards);
  } catch (e: any) {
    console.error("An unexpected error occurred:", e.message);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
