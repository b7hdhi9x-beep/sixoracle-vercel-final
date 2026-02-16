import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

function getOrigin(request: NextRequest): string {
  // Vercel 等のリバースプロキシでは x-forwarded-host が実際のホスト名
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return new URL(request.url).origin;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = getOrigin(request);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  if (!code) {
    console.error("[auth/callback] No code parameter in URL");
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message, error);
    return NextResponse.redirect(
      `${origin}/auth/login?error=auth_failed&message=${encodeURIComponent(error.message)}`
    );
  }

  if (!data.user) {
    console.error("[auth/callback] No user in session data");
    return NextResponse.redirect(`${origin}/auth/login?error=no_user`);
  }

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
    console.error("[auth/callback] Failed to upsert user:", e);
    // DB エラーでもセッションは有効なのでリダイレクトは続行
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
