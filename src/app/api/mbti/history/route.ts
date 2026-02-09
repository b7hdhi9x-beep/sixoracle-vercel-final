import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized } from "@/lib/serverAuth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("mbti_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(limit);
  return NextResponse.json(data || []);
}
