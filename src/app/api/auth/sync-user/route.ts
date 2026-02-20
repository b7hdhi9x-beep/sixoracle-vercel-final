import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "未認証" }, { status: 401 });
    }

    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email ?? "",
        name:
          user.user_metadata?.name ??
          user.user_metadata?.full_name ??
          null,
        image: user.user_metadata?.avatar_url ?? null,
      },
      create: {
        id: user.id,
        email: user.email ?? "",
        name:
          user.user_metadata?.name ??
          user.user_metadata?.full_name ??
          null,
        image: user.user_metadata?.avatar_url ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[sync-user] Failed:", e);
    return NextResponse.json(
      { error: "ユーザー同期に失敗しました" },
      { status: 500 }
    );
  }
}
