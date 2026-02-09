import { getSupabaseClient } from "./supabase";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  oracleId: string;
  timestamp: number;
  session_id?: string;
}

export interface ChatSession {
  id: string;
  oracleId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// =============================================
// Supabase-backed chat storage
// =============================================

export async function getSessionsFromDB(userId: string): Promise<ChatSession[]> {
  const supabase = getSupabaseClient();
  const { data: sessions, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error || !sessions) return [];

  // Fetch messages for each session
  const result: ChatSession[] = [];
  for (const s of sessions) {
    const { data: msgs } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", s.id)
      .order("created_at", { ascending: true });

    result.push({
      id: s.id,
      oracleId: s.oracle_id,
      title: s.title,
      messages: (msgs || []).map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        oracleId: m.oracle_id,
        timestamp: new Date(m.created_at).getTime(),
        session_id: m.session_id,
      })),
      createdAt: new Date(s.created_at).getTime(),
      updatedAt: new Date(s.updated_at).getTime(),
    });
  }

  return result;
}

export async function createSessionInDB(
  userId: string,
  oracleId: string,
  title: string
): Promise<ChatSession | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: userId,
      oracle_id: oracleId,
      title: title || "新しい相談",
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Error creating session:", error);
    return null;
  }

  return {
    id: data.id,
    oracleId: data.oracle_id,
    title: data.title,
    messages: [],
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
  };
}

export async function addMessageToDB(
  sessionId: string,
  userId: string,
  oracleId: string,
  role: "user" | "assistant",
  content: string
): Promise<ChatMessage | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      session_id: sessionId,
      user_id: userId,
      oracle_id: oracleId,
      role,
      content,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Error adding message:", error);
    return null;
  }

  // Update session title if first user message
  if (role === "user") {
    await supabase
      .from("chat_sessions")
      .update({
        title: content.substring(0, 50),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);
  }

  return {
    id: data.id,
    role: data.role,
    content: data.content,
    oracleId: data.oracle_id,
    timestamp: new Date(data.created_at).getTime(),
    session_id: data.session_id,
  };
}

export async function deleteSessionFromDB(sessionId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("chat_sessions")
    .update({ is_active: false })
    .eq("id", sessionId);

  return !error;
}

// =============================================
// Daily usage tracking (DB-backed)
// =============================================

export async function getDailyUsageFromDB(userId: string): Promise<number> {
  const supabase = getSupabaseClient();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("daily_usage")
    .select("message_count")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  return data?.message_count || 0;
}

export async function incrementDailyUsageInDB(userId: string): Promise<number> {
  const supabase = getSupabaseClient();
  const today = new Date().toISOString().split("T")[0];

  // Try to upsert
  const { data: existing } = await supabase
    .from("daily_usage")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (existing) {
    const newCount = (existing.message_count || 0) + 1;
    await supabase
      .from("daily_usage")
      .update({ message_count: newCount })
      .eq("id", existing.id);
    return newCount;
  } else {
    await supabase
      .from("daily_usage")
      .insert({ user_id: userId, date: today, message_count: 1 });
    return 1;
  }
}

// =============================================
// Rate limiting check
// =============================================

export async function canSendMessageDB(
  userId: string,
  isPremium: boolean,
  freeMessagesRemaining: number
): Promise<{ allowed: boolean; reason?: string }> {
  if (isPremium) {
    // プレミアムユーザーは完全無制限
    return { allowed: true };
  }

  // Free tier: use free_messages_remaining from profile
  if (freeMessagesRemaining <= 0) {
    return {
      allowed: false,
      reason: "無料鑑定の回数を使い切りました。プレミアムプランにアップグレードすると、無制限でご利用いただけます。",
    };
  }

  return { allowed: true };
}

// =============================================
// Legacy localStorage functions (fallback)
// =============================================

const SESSIONS_KEY = "sixoracle_sessions";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function getSessions(): ChatSession[] {
  try {
    const stored = localStorage.getItem(SESSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function createSession(oracleId: string, title: string): ChatSession {
  const session: ChatSession = {
    id: generateId(),
    oracleId,
    title,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const sessions = getSessions();
  sessions.unshift(session);
  saveSessions(sessions);
  return session;
}

export function addMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
  oracleId: string
): ChatMessage {
  const msg: ChatMessage = {
    id: generateId(),
    role,
    content,
    oracleId,
    timestamp: Date.now(),
  };
  const sessions = getSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (session) {
    session.messages.push(msg);
    session.updatedAt = Date.now();
    saveSessions(sessions);
  }
  return msg;
}

export function deleteSession(sessionId: string) {
  const sessions = getSessions().filter(s => s.id !== sessionId);
  saveSessions(sessions);
}

export function getRemainingMessages(_isPremium: boolean): number {
  return Infinity;
}

export function canSendMessage(_isPremium: boolean): boolean {
  return true;
}

export function incrementDailyUsage() {
  // Legacy - no-op when using DB
}
