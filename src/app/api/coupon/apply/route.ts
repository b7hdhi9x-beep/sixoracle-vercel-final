import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized, badRequest, serverError } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { code } = await request.json();
    if (!code) return badRequest("クーポンコードが必要です。");

    const supabase = getSupabaseAdmin();
    
    // Check if coupon exists and is valid
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ success: false, message: "無効なクーポンコードです。" });
    }

    // Check if already used by this user
    const { data: existing } = await supabase
      .from("coupon_usage")
      .select("id")
      .eq("user_id", user.id)
      .eq("coupon_id", coupon.id)
      .single();

    if (existing) {
      return NextResponse.json({ success: false, message: "このクーポンは既に使用済みです。" });
    }

    // Check usage limit
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ success: false, message: "このクーポンは使用上限に達しました。" });
    }

    // Apply coupon
    await supabase.from("coupon_usage").insert({ user_id: user.id, coupon_id: coupon.id });
    await supabase.from("coupons").update({ used_count: (coupon.used_count || 0) + 1 }).eq("id", coupon.id);

    // Grant premium if applicable
    if (coupon.type === "premium") {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (coupon.duration_days || 30));
      await supabase.from("profiles").update({ is_premium: true, premium_expires_at: expiresAt.toISOString() }).eq("id", user.id);
    }

    return NextResponse.json({ success: true, message: "クーポンが適用されました！", discount: coupon.discount_percent });
  } catch (err) {
    return serverError();
  }
}
