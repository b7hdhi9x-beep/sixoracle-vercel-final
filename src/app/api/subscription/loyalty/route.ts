import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized } from "@/lib/serverAuth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase.from("profiles").select("created_at, total_messages_sent, is_premium").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ level: 1, points: 0, nextLevelPoints: 100 });
  const daysSinceJoin = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const points = (profile.total_messages_sent || 0) + daysSinceJoin * 2;
  let level = 1;
  if (points >= 1000) level = 5;
  else if (points >= 500) level = 4;
  else if (points >= 200) level = 3;
  else if (points >= 50) level = 2;
  const levelThresholds = [0, 50, 200, 500, 1000, Infinity];
  return NextResponse.json({ level, points, nextLevelPoints: levelThresholds[level] || Infinity, totalMessages: profile.total_messages_sent || 0, daysSinceJoin });
}
