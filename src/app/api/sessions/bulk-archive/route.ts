import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  const { oracleId, olderThanDays } = await request.json();
  const supabase = getSupabaseAdmin();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);
  let query = supabase.from("chat_sessions").update({ is_archived: true }).eq("user_id", user.id).eq("is_active", true).lt("updated_at", cutoff.toISOString());
  if (oracleId) query = query.eq("oracle_id", oracleId);
  const { count } = await query.select("id", { count: "exact", head: true });
  await query;
  return NextResponse.json({ archivedCount: count || 0 });
}
