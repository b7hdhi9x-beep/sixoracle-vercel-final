import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabaseクライアントを初期化（管理者権限）
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// 認証ヘッダーからユーザー情報を取得
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
 * GET: 記念日一覧を取得
 * @param request NextRequest
 * @returns NextResponse
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("anniversaries")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching anniversaries:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    const error = e as Error;
    console.error("GET Anniversaries Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: 新しい記念日を作成
 * @param request NextRequest
 * @returns NextResponse
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { oracle_id, title, date, type, is_recurring } = await request.json();

    if (!title || !date || !type) {
        return NextResponse.json({ error: "Missing required fields: title, date, and type are required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("anniversaries")
      .insert({
        user_id: user.id,
        oracle_id,
        title,
        date,
        type,
        is_recurring: is_recurring ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating anniversary:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    const error = e as Error;
    console.error("POST Anniversary Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT: 記念日を更新
 * @param request NextRequest
 * @returns NextResponse
 */
export async function PUT(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, ...updateData } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "Anniversary ID is required." }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from("anniversaries")
            .update(updateData)
            .eq("id", id)
            .eq("user_id", user.id)
            .select()
            .single();

        if (error) {
            console.error("Error updating anniversary:", error);
            if (error.code === 'PGRST116') { // PostgREST error for no rows found
                return NextResponse.json({ error: "Anniversary not found or user does not have permission." }, { status: 404 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (e) {
        const error = e as Error;
        console.error("PUT Anniversary Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * DELETE: 記念日を削除
 * @param request NextRequest
 * @returns NextResponse
 */
export async function DELETE(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "Anniversary ID is required." }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();
        const { error, count } = await supabase
            .from("anniversaries")
            .delete({ count: 'exact' })
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) {
            console.error("Error deleting anniversary:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (count === 0) {
            return NextResponse.json({ error: "Anniversary not found or user does not have permission." }, { status: 404 });
        }

        return NextResponse.json({ message: "Anniversary deleted successfully." }, { status: 200 });
    } catch (e) {
        const error = e as Error;
        console.error("DELETE Anniversary Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
