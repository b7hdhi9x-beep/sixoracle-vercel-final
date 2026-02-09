
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * 認証ヘッダーからユーザー情報を取得します。
 * @param request NextRequest
 * @returns ユーザー情報 or null
 */
async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    console.error("Authorization header is missing or invalid");
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
 * GET: コンパニオン設定を取得します。
 * oracle_idをクエリパラメータで受け取ります。
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const oracle_id = searchParams.get("oracle_id");

    if (!oracle_id) {
      return NextResponse.json({ error: "oracle_id is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("companion_settings")
      .select("*")
      .eq("oracle_id", oracle_id)
      .single();

    if (error) {
      console.error("Error fetching companion settings:", error.message);
      if (error.code === 'PGRST116') { // Not found
        return NextResponse.json({ error: "Settings not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (e: any) {
    console.error("Unexpected error in GET /api/companion/settings:", e.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PUT: コンパニオン設定を更新または作成します。
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { oracle_id, ...settings } = body;

    if (!oracle_id) {
      return NextResponse.json({ error: "oracle_id is required" }, { status: 400 });
    }

    // 更新対象のデータ
    const updateData: { [key: string]: any } = {};
    if (settings.nickname !== undefined) updateData.nickname = settings.nickname;
    if (settings.greeting_enabled !== undefined) updateData.greeting_enabled = settings.greeting_enabled;
    if (settings.daily_message_enabled !== undefined) updateData.daily_message_enabled = settings.daily_message_enabled;
    // 他に更新可能な設定項目があればここに追加

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: "No update fields provided" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("companion_settings")
      .update(updateData)
      .eq("oracle_id", oracle_id)
      .select()
      .single();

    if (error) {
        console.error("Error updating companion settings:", error.message);
        // レコードが存在しない場合もエラーになるので、その場合は挿入を試みる(upsert)
        if (error.code === 'PGRST116') { // Not found
            const { data: insertData, error: insertError } = await supabase
                .from('companion_settings')
                .insert({ oracle_id, ...updateData })
                .select()
                .single();

            if (insertError) {
                console.error("Error inserting companion settings:", insertError.message);
                return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
            }
            return NextResponse.json(insertData);
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (e: any) {
    console.error("Unexpected error in PUT /api/companion/settings:", e.message);
    if (e instanceof SyntaxError) { // JSONパースエラー
        return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
