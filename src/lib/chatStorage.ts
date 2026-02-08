export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  oracleId: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  oracleId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const SESSIONS_KEY = "sixoracle_sessions";
const USAGE_KEY = "sixoracle_daily_usage";

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

export function getSessionsByOracle(oracleId: string): ChatSession[] {
  return getSessions().filter(s => s.oracleId === oracleId);
}

export function deleteSession(sessionId: string) {
  const sessions = getSessions().filter(s => s.id !== sessionId);
  saveSessions(sessions);
}

// Rate limiting
interface DailyUsage {
  date: string;
  count: number;
}

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function getDailyUsage(): DailyUsage {
  try {
    const stored = localStorage.getItem(USAGE_KEY);
    if (stored) {
      const usage = JSON.parse(stored);
      if (usage.date === getTodayKey()) return usage;
    }
  } catch {}
  return { date: getTodayKey(), count: 0 };
}

export function incrementDailyUsage(): DailyUsage {
  const usage = getDailyUsage();
  usage.count++;
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  return usage;
}

export function canSendMessage(isPremium: boolean): boolean {
  const usage = getDailyUsage();
  const limit = isPremium ? 100 : 3;
  return usage.count < limit;
}

export function getRemainingMessages(isPremium: boolean): number {
  const usage = getDailyUsage();
  const limit = isPremium ? 100 : 3;
  return Math.max(0, limit - usage.count);
}
