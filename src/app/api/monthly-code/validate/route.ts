import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized, badRequest, serverError } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { code } = await request.json();
    if (!code) return badRequest("コードが必要です。");

    const supabase = getSupabaseAdmin();

    // Check monthly activation code
    const { data: monthlyCode, error } = await supabase
      .from("monthly_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (error || !monthlyCode) {
      return NextResponse.json({ success: false, message: "無効なコードです。" });
    }

    // Check if already used
    const { data: existing } = await supabase
      .from("monthly_code_usage")
      .select("id")
      .eq("user_id", user.id)
      .eq("code_id", monthlyCode.id)
      .single();

    if (existing) {
      return NextResponse.json({ success: false, message: "このコードは既に使用済みです。" });
    }

    // Apply code
    await supabase.from("monthly_code_usage").insert({ user_id: user.id, code_id: monthlyCode.id });

    // Grant premium days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (monthlyCode.duration_days || 30));
    await supabase.from("profiles").update({ is_premium: true, premium_expires_at: expiresAt.toISOString() }).eq("id", user.id);

    return NextResponse.json({ success: true, message: "コードが適用されました！", durationDays: monthlyCode.duration_days });
  } catch (err) {
    return serverError();
  }
}
