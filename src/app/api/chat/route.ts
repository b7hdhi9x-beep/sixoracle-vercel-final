import { NextRequest } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import { getOracleById } from "@/lib/oracles";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { message, oracleId, sessionId } = await request.json();

    if (!message || !oracleId) {
      return Response.json(
        { error: "message と oracleId は必須です" },
        { status: 400 }
      );
    }

    const oracle = getOracleById(oracleId);
    if (!oracle) {
      return Response.json(
        { error: "指定された占い師が見つかりません" },
        { status: 404 }
      );
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return Response.json(
        { error: "GOOGLE_AI_API_KEY が設定されていません" },
        { status: 500 }
      );
    }

    // セッションの取得 or 作成
    let chatSession;
    if (sessionId) {
      chatSession = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId: user.id },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
    }

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          userId: user.id,
          oracleId,
          title: message.slice(0, 50),
        },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });

      // 初回は占い師の挨拶を保存
      await prisma.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          role: "ASSISTANT",
          content: oracle.greeting,
        },
      });
    }

    // ユーザーメッセージをDBに保存
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: "USER",
        content: message,
      },
    });

    // チャット履歴を構築（DB から最新を取得）
    const dbMessages = await prisma.chatMessage.findMany({
      where: { sessionId: chatSession.id },
      orderBy: { createdAt: "asc" },
    });

    const chatHistory = dbMessages
      .filter((m) => m.role !== "SYSTEM")
      .map((msg) => ({
        role: msg.role === "ASSISTANT" ? ("model" as const) : ("user" as const),
        parts: [{ text: msg.content }],
      }));

    // Gemini へ送信（履歴の最後のuserメッセージは除く — sendMessageで送るため）
    const historyBeforeLast = chatHistory.slice(0, -1);

    // Gemini API は履歴が "user" ロールから始まることを要求する
    // DB先頭の挨拶メッセージ（model）をスキップ
    const firstUserIdx = historyBeforeLast.findIndex((m) => m.role === "user");
    const historyForGemini =
      firstUserIdx >= 0 ? historyBeforeLast.slice(firstUserIdx) : [];

    const model = getGeminiModel();
    const chat = model.startChat({
      history: historyForGemini,
      systemInstruction: {
        role: "user" as const,
        parts: [{ text: oracle.systemPrompt }],
      },
    });

    console.log("[chat] Sending to Gemini:", {
      oracleId,
      historyLength: historyForGemini.length,
      messagePreview: message.slice(0, 50),
    });

    const result = await chat.sendMessageStream(message);

    let fullResponse = "";

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullResponse += text;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text, sessionId: chatSession.id })}\n\n`
                )
              );
            }
          }

          // アシスタントの応答をDBに保存
          await prisma.chatMessage.create({
            data: {
              sessionId: chatSession.id,
              role: "ASSISTANT",
              content: fullResponse,
            },
          });

          // 利用ログ記録
          await prisma.oracleUsageLog.create({
            data: {
              userId: user.id,
              oracleId,
              tokens: fullResponse.length,
            },
          });

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("[chat] Stream error:", error);
          const errorMessage =
            error instanceof Error ? error.message : "ストリーミングエラー";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: errorMessage })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "チャット処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
