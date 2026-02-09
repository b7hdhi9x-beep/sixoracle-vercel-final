import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized } from "@/lib/serverAuth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  const supabase = getSupabaseAdmin();
  const { data: sessions } = await supabase.from("chat_sessions").select("oracle_id").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(10);
  const usedOracles = [...new Set((sessions || []).map(s => s.oracle_id))];
  const allOracles = ["souma", "reira", "sakuya", "akari", "tsukuyo", "shion", "riku", "shinri", "kaguya", "yuzuki", "mitsuki"];
  const recommended = allOracles.filter(o => !usedOracles.includes(o)).slice(0, 3).map(id => ({ oracleId: id, reason: "まだ相談したことがない占い師です" }));
  return NextResponse.json(recommended);
}
