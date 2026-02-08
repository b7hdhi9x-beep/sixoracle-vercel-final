import { getDb } from "./db";
import { loginHistory } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import type { Request } from "express";

// Parse user agent to extract device information
export function parseUserAgent(userAgent: string | undefined): {
  deviceType: string;
  browser: string;
  os: string;
} {
  if (!userAgent || userAgent.trim() === "") {
    return { deviceType: "unknown", browser: "unknown", os: "unknown" };
  }

  // Detect device type (order matters - check tablet before mobile)
  let deviceType = "desktop";
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) {
    deviceType = "tablet";
  } else if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    deviceType = "mobile";
  }

  // Detect browser
  let browser = "unknown";
  if (/edg/i.test(userAgent)) {
    browser = "Microsoft Edge";
  } else if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) {
    browser = "Chrome";
  } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
    browser = "Safari";
  } else if (/firefox/i.test(userAgent)) {
    browser = "Firefox";
  } else if (/opera|opr/i.test(userAgent)) {
    browser = "Opera";
  } else if (/msie|trident/i.test(userAgent)) {
    browser = "Internet Explorer";
  }

  // Detect OS (order matters - check iOS before macOS)
  let os = "unknown";
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = "iOS";
  } else if (/windows nt 10/i.test(userAgent)) {
    os = "Windows 10/11";
  } else if (/windows nt/i.test(userAgent)) {
    os = "Windows";
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    os = "macOS";
  } else if (/android/i.test(userAgent)) {
    os = "Android";
  } else if (/linux/i.test(userAgent)) {
    os = "Linux";
  }

  return { deviceType, browser, os };
}

// Get client IP address from request
export function getClientIp(req: Request): string {
  // Check various headers for proxied requests
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(",")[0];
    return ips.trim();
  }

  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  // Fallback to connection remote address
  return req.socket?.remoteAddress || req.ip || "unknown";
}

// Record a login attempt
export async function recordLoginAttempt(params: {
  userId: number;
  loginMethod: "email" | "phone" | "oauth";
  req: Request;
  success: boolean;
  failureReason?: string;
  sessionId?: string;
}): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[LoginHistory] Database not available");
      return;
    }

    const userAgent = params.req.headers["user-agent"];
    const { deviceType, browser, os } = parseUserAgent(userAgent);
    const ipAddress = getClientIp(params.req);

    await db.insert(loginHistory).values({
      userId: params.userId,
      loginMethod: params.loginMethod,
      ipAddress,
      userAgent: userAgent || null,
      deviceType,
      browser,
      os,
      success: params.success,
      failureReason: params.failureReason || null,
      sessionId: params.sessionId || null,
    });

    console.log(`[LoginHistory] Recorded ${params.success ? "successful" : "failed"} login for user ${params.userId} from ${ipAddress}`);
  } catch (error) {
    // Don't throw - login history is non-critical
    console.error("[LoginHistory] Failed to record login attempt:", error);
  }
}

// Get login history for a user
export async function getUserLoginHistory(userId: number, limit: number = 10): Promise<{
  id: number;
  loginMethod: string;
  ipAddress: string;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  success: boolean;
  failureReason: string | null;
  createdAt: Date;
}[]> {
  const db = await getDb();
  if (!db) return [];

  const history = await db
    .select({
      id: loginHistory.id,
      loginMethod: loginHistory.loginMethod,
      ipAddress: loginHistory.ipAddress,
      deviceType: loginHistory.deviceType,
      browser: loginHistory.browser,
      os: loginHistory.os,
      country: loginHistory.country,
      city: loginHistory.city,
      success: loginHistory.success,
      failureReason: loginHistory.failureReason,
      createdAt: loginHistory.createdAt,
    })
    .from(loginHistory)
    .where(eq(loginHistory.userId, userId))
    .orderBy(desc(loginHistory.createdAt))
    .limit(limit);

  return history;
}

// Check for suspicious login activity
export async function checkSuspiciousActivity(userId: number, currentIp: string): Promise<{
  isSuspicious: boolean;
  reason?: string;
}> {
  const db = await getDb();
  if (!db) return { isSuspicious: false };

  // Get recent successful logins
  const recentLogins = await db
    .select({
      ipAddress: loginHistory.ipAddress,
      createdAt: loginHistory.createdAt,
    })
    .from(loginHistory)
    .where(eq(loginHistory.userId, userId))
    .orderBy(desc(loginHistory.createdAt))
    .limit(10);

  if (recentLogins.length === 0) {
    // First login, not suspicious
    return { isSuspicious: false };
  }

  // Check if this is a new IP address
  const knownIps = new Set(recentLogins.map(l => l.ipAddress));
  if (!knownIps.has(currentIp)) {
    return {
      isSuspicious: true,
      reason: "新しいIPアドレスからのログインです",
    };
  }

  return { isSuspicious: false };
}
