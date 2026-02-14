import { NextRequest } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import { getOracleById } from "@/lib/oracles";

export async function POST(request: NextRequest) {
  try {
    const { message, oracleId, history } = await request.json();

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

    // チャット履歴を構築
    const chatHistory = (history || []).map(
      (msg: { role: string; content: string }) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })
    );

    const model = getGeminiModel();
    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: oracle.systemPrompt,
    });

    // ストリーミングレスポンス
    const result = await chat.sendMessageStream(message);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
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
