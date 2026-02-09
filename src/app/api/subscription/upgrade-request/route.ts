import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase.from("premium_upgrade_requests").select("id").eq("user_id", user.id).eq("status", "pending").single();
  if (existing) return NextResponse.json({ success: false, message: "既に申請中です" });
  await supabase.from("premium_upgrade_requests").insert({ user_id: user.id, status: "pending" });
  return NextResponse.json({ success: true });
}
