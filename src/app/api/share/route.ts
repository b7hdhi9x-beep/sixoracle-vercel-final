import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return Response.json(
        { error: "sessionId は必須です" },
        { status: 400 }
      );
    }

    // Verify session belongs to user
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: user.id },
    });

    if (!session) {
      return Response.json(
        { error: "セッションが見つかりません" },
        { status: 404 }
      );
    }

    // Check for existing share
    const existing = await prisma.sharedSession.findFirst({
      where: { sessionId, expiresAt: { gt: new Date() } },
    });

    if (existing) {
      return Response.json({ shareToken: existing.shareToken });
    }

    // Generate token and create share
    const shareToken = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.sharedSession.create({
      data: { sessionId, shareToken, expiresAt },
    });

    return Response.json({ shareToken });
  } catch (error) {
    console.error("Share POST error:", error);
    return Response.json(
      { error: "共有リンクの生成に失敗しました" },
      { status: 500 }
    );
  }
}
