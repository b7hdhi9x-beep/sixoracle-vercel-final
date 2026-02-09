import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized, serverError } from "@/lib/serverAuth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const supabase = getSupabaseAdmin();

    const { data: messages, error } = await supabase
      .from("scheduled_messages")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_read", false)
      .lte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json(messages || []);
  } catch (err) {
    return serverError();
  }
}
