import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin, unauthorized, badRequest, serverError } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { oracleIds } = await request.json();
    if (!Array.isArray(oracleIds)) return badRequest("oracleIdsが必要です。");

    const supabase = getSupabaseAdmin();

    // Update order for each favorite
    for (let i = 0; i < oracleIds.length; i++) {
      await supabase
        .from("favorite_oracles")
        .update({ sort_order: i })
        .eq("user_id", user.id)
        .eq("oracle_id", oracleIds[i]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError();
  }
}
