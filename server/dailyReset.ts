/**
 * Daily Reset Utility
 * 
 * Provides common functions for daily/monthly automatic reset of usage limits.
 * All times are based on Japan Standard Time (JST, UTC+9).
 */

import { getDb } from "./db";
import { users, referralCodes, phoneCredentials, trialUsage } from "../drizzle/schema";
import { eq, sql, lt, and, or, isNull } from "drizzle-orm";

// Japan timezone offset in milliseconds (UTC+9)
const JST_OFFSET = 9 * 60 * 60 * 1000;

/**
 * Get current date in JST as YYYY-MM-DD string
 */
export function getTodayJST(): string {
  const now = new Date();
  const jstDate = new Date(now.getTime() + JST_OFFSET);
  return jstDate.toISOString().split('T')[0];
}

/**
 * Get current month in JST as YYYY-MM string
 */
export function getCurrentMonthJST(): string {
  const now = new Date();
  const jstDate = new Date(now.getTime() + JST_OFFSET);
  return jstDate.toISOString().slice(0, 7);
}

/**
 * Get next midnight in JST as Date object
 */
export function getNextMidnightJST(): Date {
  const now = new Date();
  const jstNow = new Date(now.getTime() + JST_OFFSET);
  
  // Set to next midnight JST
  const nextMidnight = new Date(jstNow);
  nextMidnight.setUTCHours(24, 0, 0, 0); // Next day 00:00
  nextMidnight.setUTCDate(jstNow.getUTCDate() + 1);
  nextMidnight.setUTCHours(0, 0, 0, 0);
  
  // Convert back to UTC
  return new Date(nextMidnight.getTime() - JST_OFFSET);
}

/**
 * Get milliseconds until next midnight JST
 */
export function getMillisecondsUntilMidnightJST(): number {
  const now = new Date();
  const nextMidnight = getNextMidnightJST();
  return nextMidnight.getTime() - now.getTime();
}

/**
 * Get formatted time until next reset (e.g., "5時間23分")
 */
export function getTimeUntilResetFormatted(): string {
  const ms = getMillisecondsUntilMidnightJST();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  }
  return `${minutes}分`;
}

/**
 * Check if daily reset is needed for a user
 * Returns true if lastReset date is before today (JST)
 */
export function needsDailyReset(lastResetDate: Date | string | null): boolean {
  if (!lastResetDate) return true;
  
  const todayJST = getTodayJST();
  const lastResetStr = typeof lastResetDate === 'string' 
    ? lastResetDate.split('T')[0]
    : lastResetDate.toISOString().split('T')[0];
  
  return lastResetStr < todayJST;
}

/**
 * Check if monthly reset is needed
 * Returns true if lastReset month is before current month (JST)
 */
export function needsMonthlyReset(lastResetDate: Date | string | null): boolean {
  if (!lastResetDate) return true;
  
  const currentMonthJST = getCurrentMonthJST();
  const lastResetMonth = typeof lastResetDate === 'string'
    ? lastResetDate.slice(0, 7)
    : lastResetDate.toISOString().slice(0, 7);
  
  return lastResetMonth < currentMonthJST;
}

/**
 * Reset daily readings for a specific user
 * Used for premium (50/day) and standard (15/day) plans
 */
export async function resetDailyReadingsForUser(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const todayJST = getTodayJST();
  
  await db.update(users)
    .set({
      dailyReadingsUsed: 0,
      lastDailyReset: new Date(todayJST),
    })
    .where(eq(users.id, userId));
  
  return true;
}

/**
 * Reset trial usage for a specific user and oracle
 * Used for trial plan (3 exchanges per oracle)
 */
export async function resetTrialUsageForUser(userId: number, oracleId?: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  if (oracleId) {
    // Reset specific oracle
    await db.update(trialUsage)
      .set({ exchangeCount: 0 })
      .where(and(
        eq(trialUsage.userId, userId),
        eq(trialUsage.oracleId, oracleId)
      ));
  } else {
    // Reset all oracles for user
    await db.update(trialUsage)
      .set({ exchangeCount: 0 })
      .where(eq(trialUsage.userId, userId));
  }
  
  return true;
}

/**
 * Reset monthly referral count for a specific user
 * Used for referral codes (10 uses per month)
 */
export async function resetMonthlyReferralCountForUser(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const todayJST = getTodayJST();
  
  await db.update(referralCodes)
    .set({
      monthlyUsedCount: 0,
      lastMonthlyReset: new Date(todayJST),
    })
    .where(eq(referralCodes.userId, userId));
  
  return true;
}

/**
 * Reset daily SMS resend count for a specific user
 * Used for phone credentials (5 resends per day)
 */
export async function resetDailySmsResendForUser(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.update(phoneCredentials)
    .set({
      dailyResendCount: 0,
      lastResendResetAt: new Date(),
    })
    .where(eq(phoneCredentials.userId, userId));
  
  return true;
}

/**
 * Batch reset all daily limits for all users
 * Should be called by a scheduled job at midnight JST
 */
export async function batchResetAllDailyLimits(): Promise<{
  usersReset: number;
  smsReset: number;
  errors: string[];
}> {
  const db = await getDb();
  if (!db) {
    return { usersReset: 0, smsReset: 0, errors: ["Database not available"] };
  }
  
  const errors: string[] = [];
  let usersReset = 0;
  let smsReset = 0;
  
  const todayJST = getTodayJST();
  
  try {
    // Reset daily readings for all users who need it
    const userResult = await db.update(users)
      .set({
        dailyReadingsUsed: 0,
        lastDailyReset: new Date(todayJST),
      })
      .where(
        or(
          isNull(users.lastDailyReset),
          lt(users.lastDailyReset, new Date(todayJST))
        )
      );
    usersReset = userResult[0]?.affectedRows || 0;
  } catch (error) {
    errors.push(`Failed to reset user daily readings: ${error}`);
  }
  
  try {
    // Reset SMS resend counts
    const smsResult = await db.update(phoneCredentials)
      .set({
        dailyResendCount: 0,
        lastResendResetAt: new Date(),
      })
      .where(
        or(
          isNull(phoneCredentials.lastResendResetAt),
          lt(phoneCredentials.lastResendResetAt, new Date(todayJST))
        )
      );
    smsReset = smsResult[0]?.affectedRows || 0;
  } catch (error) {
    errors.push(`Failed to reset SMS resend counts: ${error}`);
  }
  
  return { usersReset, smsReset, errors };
}

/**
 * Batch reset all monthly limits for all users
 * Should be called by a scheduled job at the start of each month
 */
export async function batchResetAllMonthlyLimits(): Promise<{
  referralsReset: number;
  trialsReset: number;
  errors: string[];
}> {
  const db = await getDb();
  if (!db) {
    return { referralsReset: 0, trialsReset: 0, errors: ["Database not available"] };
  }
  
  const errors: string[] = [];
  let referralsReset = 0;
  let trialsReset = 0;
  
  const todayJST = getTodayJST();
  const currentMonthStart = todayJST.slice(0, 7) + '-01';
  
  try {
    // Reset monthly referral counts
    const referralResult = await db.update(referralCodes)
      .set({
        monthlyUsedCount: 0,
        lastMonthlyReset: new Date(currentMonthStart),
      })
      .where(
        or(
          isNull(referralCodes.lastMonthlyReset),
          lt(referralCodes.lastMonthlyReset, new Date(currentMonthStart))
        )
      );
    referralsReset = referralResult[0]?.affectedRows || 0;
  } catch (error) {
    errors.push(`Failed to reset referral counts: ${error}`);
  }
  
  try {
    // Reset trial usage for all users (monthly reset for trial users)
    const trialResult = await db.update(trialUsage)
      .set({ exchangeCount: 0 });
    trialsReset = trialResult[0]?.affectedRows || 0;
  } catch (error) {
    errors.push(`Failed to reset trial usage: ${error}`);
  }
  
  return { referralsReset, trialsReset, errors };
}

/**
 * Get reset info for a user
 * Returns information about when various limits will reset
 */
export interface ResetInfo {
  // Daily reset info
  dailyResetsAt: string; // ISO string of next midnight JST
  timeUntilDailyReset: string; // Formatted string like "5時間23分"
  millisecondsUntilDailyReset: number;
  
  // Monthly reset info
  monthlyResetsAt: string; // ISO string of first day of next month
  timeUntilMonthlyReset: string;
  
  // Current date info (JST)
  currentDateJST: string;
  currentMonthJST: string;
}

export function getResetInfo(): ResetInfo {
  const now = new Date();
  const jstNow = new Date(now.getTime() + JST_OFFSET);
  
  // Calculate next midnight JST
  const nextMidnight = getNextMidnightJST();
  const msUntilMidnight = getMillisecondsUntilMidnightJST();
  
  // Calculate first day of next month
  const nextMonth = new Date(jstNow);
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
  nextMonth.setUTCDate(1);
  nextMonth.setUTCHours(0, 0, 0, 0);
  const nextMonthUTC = new Date(nextMonth.getTime() - JST_OFFSET);
  
  const msUntilNextMonth = nextMonthUTC.getTime() - now.getTime();
  const daysUntilNextMonth = Math.floor(msUntilNextMonth / (1000 * 60 * 60 * 24));
  const hoursUntilNextMonth = Math.floor((msUntilNextMonth % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  let timeUntilMonthlyReset: string;
  if (daysUntilNextMonth > 0) {
    timeUntilMonthlyReset = `${daysUntilNextMonth}日${hoursUntilNextMonth}時間`;
  } else {
    timeUntilMonthlyReset = `${hoursUntilNextMonth}時間`;
  }
  
  return {
    dailyResetsAt: nextMidnight.toISOString(),
    timeUntilDailyReset: getTimeUntilResetFormatted(),
    millisecondsUntilDailyReset: msUntilMidnight,
    monthlyResetsAt: nextMonthUTC.toISOString(),
    timeUntilMonthlyReset,
    currentDateJST: getTodayJST(),
    currentMonthJST: getCurrentMonthJST(),
  };
}
