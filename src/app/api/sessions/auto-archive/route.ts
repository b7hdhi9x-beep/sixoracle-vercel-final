import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  const supabase = getSupabaseAdmin();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const { data } = await supabase.from("chat_sessions").update({ is_archived: true }).eq("user_id", user.id).eq("is_active", true).eq("is_archived", false).lt("updated_at", cutoff.toISOString()).select("id");
  return NextResponse.json({ archivedCount: data?.length || 0, skipped: false });
}
