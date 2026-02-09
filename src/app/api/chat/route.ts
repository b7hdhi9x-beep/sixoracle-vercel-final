import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function callGeminiWithRetry(body: any, maxRetries = 2): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.status === 429 && attempt < maxRetries) {
      const waitTime = Math.min(Math.pow(2, attempt + 1) * 1000, 10000);
      console.log(`Rate limited, retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      continue;
    }

    return response;
  }
  throw new Error("Max retries exceeded");
}

// Constants
const FREE_MESSAGE_LIMIT = 5;
const PREMIUM_DAILY_LIMIT = 100;

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt, userId, oracleId, sessionId } = await request.json();

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured. Please set GEMINI_API_KEY in environment variables." },
        { status: 500 }
      );
    }

    // Usage check (only if Supabase is configured and userId is provided)
    const supabase = getSupabaseAdmin();
    let isPremium = false;
    let freeRemaining = FREE_MESSAGE_LIMIT;

    if (supabase && userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium, free_messages_remaining, total_messages_sent, daily_messages_today, daily_reset_date")
        .eq("id", userId)
        .single();

      if (profile) {
        isPremium = profile.is_premium;
        freeRemaining = profile.free_messages_remaining;

        // Check daily reset for premium users
        const today = new Date().toISOString().split("T")[0];
        let dailyCount = profile.daily_messages_today || 0;

        if (profile.daily_reset_date !== today) {
          // Reset daily counter
          dailyCount = 0;
          await supabase
            .from("profiles")
            .update({ daily_messages_today: 0, daily_reset_date: today })
            .eq("id", userId);
        }

        if (isPremium) {
          // Premium user: check daily limit
          if (dailyCount >= PREMIUM_DAILY_LIMIT) {
            return NextResponse.json(
              {
                error: "本日の鑑定回数上限（100回）に達しました。明日またお越しください。",
                limitReached: true,
                isPremium: true,
              },
              { status: 429 }
            );
          }
        } else {
          // Free user: check lifetime limit
          if (freeRemaining <= 0) {
            return NextResponse.json(
              {
                error: "無料鑑定の回数を使い切りました。プレミアムプランに登録すると、1日100回まで鑑定できます。",
                limitReached: true,
                isPremium: false,
                freeRemaining: 0,
              },
              { status: 429 }
            );
          }
        }
      }
    }

    // Build Gemini API request
    const contents: any[] = [];
    const systemInstruction = {
      parts: [{ text: systemPrompt }],
    };

    for (const msg of messages) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    const requestBody = {
      system_instruction: systemInstruction,
      contents,
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    };

    const response = await callGeminiWithRetry(requestBody);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      if (response.status === 429) {
        return NextResponse.json(
          { error: "現在アクセスが集中しています。少し時間をおいてから再度お試しください。", retryable: true },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "AI service temporarily unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "申し訳ございません。星々の導きが途絶えてしまいました...";

    // Update usage counters after successful response
    if (supabase && userId) {
      const today = new Date().toISOString().split("T")[0];

      if (isPremium) {
        // Increment daily counter
        await supabase.rpc("increment_daily_messages", { user_id_param: userId, today_param: today }).catch(() => {
          // Fallback: direct update
          supabase
            .from("profiles")
            .update({
              total_messages_sent: (freeRemaining as any) + 1, // Will be overwritten
              daily_messages_today: supabase ? 1 : 1,
            })
            .eq("id", userId);
        });

        // Simple fallback increment
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("total_messages_sent, daily_messages_today")
          .eq("id", userId)
          .single();

        if (currentProfile) {
          await supabase
            .from("profiles")
            .update({
              total_messages_sent: (currentProfile.total_messages_sent || 0) + 1,
              daily_messages_today: (currentProfile.daily_messages_today || 0) + 1,
              daily_reset_date: today,
            })
            .eq("id", userId);
        }
      } else {
        // Decrement free messages
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("free_messages_remaining, total_messages_sent")
          .eq("id", userId)
          .single();

        if (currentProfile) {
          await supabase
            .from("profiles")
            .update({
              free_messages_remaining: Math.max(0, (currentProfile.free_messages_remaining || 0) - 1),
              total_messages_sent: (currentProfile.total_messages_sent || 0) + 1,
            })
            .eq("id", userId);
        }
      }

      // Save chat log
      if (oracleId) {
        const userMessage = messages[messages.length - 1]?.content || "";
        await supabase
          .from("chat_logs")
          .insert({
            user_id: userId,
            oracle_id: oracleId,
            session_id: sessionId || null,
            user_message: userMessage,
            assistant_message: text,
          })
          .catch((err: any) => console.error("Failed to save chat log:", err));
      }
    }

    // Return remaining counts
    const responseData: any = { message: text };
    if (supabase && userId) {
      if (!isPremium) {
        responseData.freeRemaining = Math.max(0, freeRemaining - 1);
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
