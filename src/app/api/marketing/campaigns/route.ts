import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// アクティブなキャンペーン一覧を取得
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("is_active", true)
      .lte("start_date", now)
      .gte("end_date", now)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "キャンペーンの取得に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Campaigns fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
