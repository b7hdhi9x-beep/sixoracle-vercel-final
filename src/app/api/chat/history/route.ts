import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized } from "@/lib/serverAuth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  const oracleId = request.nextUrl.searchParams.get("oracleId");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
  const supabase = getSupabaseAdmin();
  let query = supabase.from("chat_messages").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(limit);
  if (oracleId) query = query.eq("oracle_id", oracleId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
