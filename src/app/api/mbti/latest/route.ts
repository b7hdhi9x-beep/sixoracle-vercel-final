import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized } from "@/lib/serverAuth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("mbti_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).single();
  return NextResponse.json(data || null);
}
