import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const shared = await prisma.sharedSession.findUnique({
      where: { shareToken: token },
      include: {
        session: {
          include: {
            messages: {
              where: { role: { not: "SYSTEM" } },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!shared) {
      return Response.json(
        { error: "共有リンクが見つかりません" },
        { status: 404 }
      );
    }

    if (shared.expiresAt < new Date()) {
      return Response.json(
        { error: "共有リンクの有効期限が切れています" },
        { status: 410 }
      );
    }

    return Response.json({
      oracleId: shared.session.oracleId,
      title: shared.session.title,
      messages: shared.session.messages.map((m) => ({
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error("Share GET error:", error);
    return Response.json(
      { error: "共有データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
