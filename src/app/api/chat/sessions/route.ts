import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "認証が必要です" }, { status: 401 });
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { messages: true } },
      },
    });

    return Response.json(sessions);
  } catch (error) {
    console.error("Sessions API error:", error);
    return Response.json(
      { error: "セッション一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}
