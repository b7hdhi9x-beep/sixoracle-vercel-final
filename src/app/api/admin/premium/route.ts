import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  try {
    const { adminUserId, targetUserId, action } = await request.json();

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

    if (action === "grant") {
      await supabase
        .from("profiles")
        .update({
          is_premium: true,
          premium_granted_by: "admin",
          premium_expires_at: null,
        })
        .eq("id", targetUserId);
    } else if (action === "revoke") {
      await supabase
        .from("profiles")
        .update({
          is_premium: false,
          premium_granted_by: null,
        })
        .eq("id", targetUserId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
