import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized } from "@/lib/serverAuth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().split("T")[0];
  const { data: usage } = await supabase.from("daily_usage").select("message_count").eq("user_id", user.id).eq("date", today).single();
  const { data: profile } = await supabase.from("profiles").select("is_premium, premium_expires_at, free_messages_remaining").eq("id", user.id).single();
  const isPremium = profile?.is_premium && (!profile.premium_expires_at || new Date(profile.premium_expires_at) > new Date());
  let planType = "free";
  if (isPremium) planType = "premium_unlimited";
  const dailyCount = usage?.message_count || 0;
  const dailyLimit = isPremium ? Infinity : 5;
  const remaining = isPremium ? Infinity : Math.max(0, (profile?.free_messages_remaining ?? 5));
  const resetTime = new Date();
  resetTime.setHours(24, 0, 0, 0);
  return NextResponse.json({
    dailyCount, dailyLimit, remaining, planType, isUnlimited: isPremium,
    resetInfo: { resetAt: resetTime.toISOString(), timezone: "Asia/Tokyo" }
  });
}
