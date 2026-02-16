import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getOracleById } from "@/lib/oracles";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { sessionId } = await params;
    const format = request.nextUrl.searchParams.get("format") || "txt";

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: user.id },
      include: {
        messages: {
          where: { role: { not: "SYSTEM" } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return Response.json(
        { error: "セッションが見つかりません" },
        { status: 404 }
      );
    }

    const oracle = getOracleById(session.oracleId);
    const oracleName = oracle?.name ?? session.oracleId;
    const dateStr = new Date(session.createdAt).toLocaleDateString("ja-JP");

    if (format === "csv") {
      const header = "日時,送信者,メッセージ";
      const rows = session.messages.map((m) => {
        const time = new Date(m.createdAt).toLocaleString("ja-JP");
        const sender = m.role === "USER" ? "あなた" : oracleName;
        const content = `"${m.content.replace(/"/g, '""')}"`;
        return `${time},${sender},${content}`;
      });
      const csv = [header, ...rows].join("\n");

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="rokushin-${sessionId.slice(0, 8)}-${dateStr}.csv"`,
        },
      });
    }

    // Default: txt format
    const lines = [
      `六神ノ間 — ${oracleName} との鑑定記録`,
      `日付: ${dateStr}`,
      "─".repeat(40),
      "",
      ...session.messages.map((m) => {
        const sender = m.role === "USER" ? "あなた" : oracleName;
        return `【${sender}】\n${m.content}\n`;
      }),
    ];
    const txt = lines.join("\n");

    return new Response(txt, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="rokushin-${sessionId.slice(0, 8)}-${dateStr}.txt"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return Response.json(
      { error: "エクスポートに失敗しました" },
      { status: 500 }
    );
  }
}
