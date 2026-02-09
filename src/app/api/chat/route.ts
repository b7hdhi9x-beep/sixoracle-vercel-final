import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { oraclePrompts, dailySharingPrompts, detectConversationMode } from "@/lib/oraclePrompts";
import { generateVariationPrompt } from "@/lib/responseVariation";

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
// プレミアムユーザーは無制限

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt, userId, oracleId, sessionId, conversationHistory } = await request.json();

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
    let userProfile: any = null;

    if (supabase && userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium, free_messages_remaining, total_messages_sent, daily_messages_today, daily_reset_date, display_name")
        .eq("id", userId)
        .single();

      if (profile) {
        userProfile = profile;
        isPremium = profile.is_premium;
        freeRemaining = profile.free_messages_remaining ?? FREE_MESSAGE_LIMIT;

        // Check daily reset
        const today = new Date().toISOString().split("T")[0];
        let dailyCount = profile.daily_messages_today || 0;

        if (profile.daily_reset_date !== today) {
          dailyCount = 0;
          await supabase
            .from("profiles")
            .update({ daily_messages_today: 0, daily_reset_date: today })
            .eq("id", userId);
        }

        if (isPremium) {
          // プレミアムユーザーは無制限 - 制限チェックなし
        } else {
          if (freeRemaining <= 0) {
            return NextResponse.json(
              {
                error: "無料鑑定の回数を使い切りました。プレミアムプランに登録すると、無制限で鑑定できます。",
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

    // Detect conversation mode from the latest user message
    const latestUserMessage = messages[messages.length - 1]?.content || "";
    const conversationMode = detectConversationMode(latestUserMessage);

    // Build enhanced system prompt
    let enhancedSystemPrompt = systemPrompt || "";
    
    if (oracleId) {
      // Use the detailed oracle prompt from oraclePrompts
      const basePrompt = oraclePrompts[oracleId];
      if (basePrompt) {
        enhancedSystemPrompt = basePrompt;
      }

      // Add daily sharing mode prompt if applicable
      if (conversationMode === "daily_sharing") {
        const dailyPrompt = dailySharingPrompts[oracleId];
        if (dailyPrompt) {
          enhancedSystemPrompt += "\n\n" + dailyPrompt;
        }
      }

      // Add response variation for diversity
      const variationPrompt = generateVariationPrompt(oracleId);
      enhancedSystemPrompt += variationPrompt;

      // Add user context if available
      if (userProfile?.display_name) {
        enhancedSystemPrompt += `\n\n【相談者情報】相談者の名前は「${userProfile.display_name}」です。会話の中で自然に名前を呼んでください。`;
      }
    }

    // Build Gemini API request
    const contents: any[] = [];
    const systemInstruction = {
      parts: [{ text: enhancedSystemPrompt }],
    };

    // Include conversation history for context
    const allMessages = conversationHistory ? [...conversationHistory, ...messages] : messages;
    
    // Limit to last 20 messages for context window
    const recentMessages = allMessages.slice(-20);

    for (const msg of recentMessages) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    const requestBody = {
      system_instruction: systemInstruction,
      contents,
      generationConfig: {
        temperature: 0.92,
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

    // Update usage counters and save to DB
    if (supabase && userId) {
      const today = new Date().toISOString().split("T")[0];

      if (isPremium) {
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

      // Save messages to chat_messages table
      if (oracleId) {
        let currentSessionId = sessionId;

        // Create session if not exists
        if (!currentSessionId) {
          const { data: newSession } = await supabase
            .from("chat_sessions")
            .insert({
              user_id: userId,
              oracle_id: oracleId,
              title: latestUserMessage.substring(0, 50) || "新しい会話",
              message_count: 0,
            })
            .select("id")
            .single();
          
          if (newSession) {
            currentSessionId = newSession.id;
          }
        }

        if (currentSessionId) {
          // Save user message
          await supabase
            .from("chat_messages")
            .insert({
              session_id: currentSessionId,
              user_id: userId,
              oracle_id: oracleId,
              role: "user",
              content: latestUserMessage,
              conversation_mode: conversationMode,
            })
            .catch((err: any) => console.error("Failed to save user message:", err));

          // Save assistant message
          await supabase
            .from("chat_messages")
            .insert({
              session_id: currentSessionId,
              user_id: userId,
              oracle_id: oracleId,
              role: "assistant",
              content: text,
              conversation_mode: conversationMode,
            })
            .catch((err: any) => console.error("Failed to save assistant message:", err));

          // Update session message count and last_message_at
          await supabase
            .from("chat_sessions")
            .update({
              message_count: supabase.rpc ? undefined : 2, // Will be incremented
              last_message_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", currentSessionId)
            .catch(() => {});

          // Increment message count
          const { data: session } = await supabase
            .from("chat_sessions")
            .select("message_count")
            .eq("id", currentSessionId)
            .single();
          
          if (session) {
            await supabase
              .from("chat_sessions")
              .update({ message_count: (session.message_count || 0) + 2 })
              .eq("id", currentSessionId);
          }
        }

        // Also save to chat_logs for backward compatibility
        await supabase
          .from("chat_logs")
          .insert({
            user_id: userId,
            oracle_id: oracleId,
            session_id: currentSessionId || null,
            user_message: latestUserMessage,
            assistant_message: text,
          })
          .catch((err: any) => console.error("Failed to save chat log:", err));

        // Update intimacy level
        await supabase
          .from("intimacy_levels")
          .upsert({
            user_id: userId,
            oracle_id: oracleId,
            total_messages: 1,
            experience: 10,
            last_interaction_date: today,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id,oracle_id" })
          .catch(() => {});
        
        // Increment intimacy
        const { data: intimacy } = await supabase
          .from("intimacy_levels")
          .select("total_messages, experience, level")
          .eq("user_id", userId)
          .eq("oracle_id", oracleId)
          .single();
        
        if (intimacy) {
          const newExp = (intimacy.experience || 0) + 10;
          const newLevel = Math.floor(newExp / 100) + 1;
          await supabase
            .from("intimacy_levels")
            .update({
              total_messages: (intimacy.total_messages || 0) + 1,
              experience: newExp,
              level: Math.min(newLevel, 99),
              last_interaction_date: today,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)
            .eq("oracle_id", oracleId);
        }
      }
    }

    // Return response with metadata
    const responseData: any = {
      message: text,
      conversationMode,
      sessionId: sessionId || undefined,
    };

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
