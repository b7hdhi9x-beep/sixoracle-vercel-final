
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabaseの管理者クライアントを初期化して返す関数
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// 認証ヘッダーからユーザー情報を取得する関数
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
 * POST /api/notifications/read
 * 通知を既読にする
 * @param request - NextRequest
 * @returns - NextResponse
 */
export async function POST(request: NextRequest) {
  try {
    // 認証ユーザーを取得
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // リクエストボディからnotification_idを取得
    const { notification_id } = await request.json();

    if (!notification_id) {
      return NextResponse.json({ error: "notification_id is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 指定されたnotification_idの通知を既読にする
    // 同時に、その通知が認証ユーザーのものであることを確認する
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notification_id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
        // find()を試みる
        const { data: notification, error: findError } = await supabase
            .from('notifications')
            .select('id, user_id')
            .eq('id', notification_id)
            .single();

        if (findError || !notification) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        if (notification.user_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

      console.error("Error updating notification:", error);
      return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ error: "Notification not found or you don't have permission to update it." }, { status: 404 });
    }

    return NextResponse.json({ message: "Notification marked as read", data });

  } catch (e) {
    console.error("An unexpected error occurred:", e);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
