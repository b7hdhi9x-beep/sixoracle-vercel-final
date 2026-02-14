import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "認証が必要です" }, { status: 401 });
    }

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: user.id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!session) {
      return Response.json(
        { error: "セッションが見つかりません" },
        { status: 404 }
      );
    }

    return Response.json(session);
  } catch (error) {
    console.error("Session detail API error:", error);
    return Response.json(
      { error: "セッションの取得に失敗しました" },
      { status: 500 }
    );
  }
}
