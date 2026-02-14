const WINDOW_MS = 60 * 1000; // 1分
const MAX_REQUESTS = 30; // 1分あたり30リクエスト

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// 古いエントリを定期的にクリーンアップ
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 60 * 1000);

export function rateLimit(identifier: string): {
  success: boolean;
  remaining: number;
} {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    store.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { success: true, remaining: MAX_REQUESTS - 1 };
  }

  entry.count++;

  if (entry.count > MAX_REQUESTS) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: MAX_REQUESTS - entry.count };
}
