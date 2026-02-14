import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // DB にユーザーレコードを作成（upsert）
      try {
        await prisma.user.upsert({
          where: { id: data.user.id },
          update: {
            email: data.user.email ?? "",
            name:
              data.user.user_metadata?.name ??
              data.user.user_metadata?.full_name ??
              null,
            image: data.user.user_metadata?.avatar_url ?? null,
          },
          create: {
            id: data.user.id,
            email: data.user.email ?? "",
            name:
              data.user.user_metadata?.name ??
              data.user.user_metadata?.full_name ??
              null,
            image: data.user.user_metadata?.avatar_url ?? null,
          },
        });
      } catch (e) {
        console.error("Failed to upsert user:", e);
      }

      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
