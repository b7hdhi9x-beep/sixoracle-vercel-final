import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get current profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("free_messages_remaining, is_premium, total_messages_sent")
      .eq("id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Update counts
    const updates: Record<string, any> = {
      total_messages_sent: (profile.total_messages_sent || 0) + 1,
    };

    // Decrement free messages for non-premium users
    if (!profile.is_premium && profile.free_messages_remaining > 0) {
      updates.free_messages_remaining = profile.free_messages_remaining - 1;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select("free_messages_remaining, total_messages_sent")
      .single();

    if (error) throw error;

    return NextResponse.json({
      free_messages_remaining: data.free_messages_remaining,
      total_messages_sent: data.total_messages_sent,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
