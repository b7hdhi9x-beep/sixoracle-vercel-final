import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  try {
    const adminUserId = request.nextUrl.searchParams.get("adminUserId");
    if (!adminUserId) {
      return NextResponse.json({ error: "Missing adminUserId" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify admin
    const { data: admin } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", adminUserId)
      .single();

    if (!admin?.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all users
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, email, nickname, is_premium, is_admin, premium_granted_by, total_messages_sent, free_messages_remaining, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ users: users || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
