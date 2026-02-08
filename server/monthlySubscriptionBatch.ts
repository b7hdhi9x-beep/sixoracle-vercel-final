/**
 * Monthly Subscription Management System
 * 
 * This module handles:
 * 1. Monthly activation code generation (毎月の合言葉自動生成)
 * 2. Renewal reminder notifications (継続ユーザーへの3日前リマインド通知)
 * 3. Expired subscription handling (期限切れサブスクリプションの処理)
 * 4. Activation code sending after bank transfer confirmation
 * 
 * Run monthly tasks on the 1st of each month
 * Run daily tasks every day for reminders and expirations
 */

import { getDb } from "./db";
import { users, notifications, activationCodes, bankTransferRequests } from "../drizzle/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { sendRenewalReminderEmail, sendPlanExpiredEmail, isEmailConfigured } from "./emailService";

/**
 * Generate a unique activation code
 * Format: SIXYYMMXXXX (e.g., SIX2601ABCD)
 */
function generateActivationCode(prefix?: string): string {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars (I, O, 0, 1, L)
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix || 'SIX'}${year}${month}${suffix}`;
}

/**
 * Generate monthly activation code (月次合言葉)
 * Called on the 1st of each month to create a new monthly code
 * This code is used for all new bank transfer confirmations during the month
 */
export async function generateMonthlyActivationCode(): Promise<{
  success: boolean;
  code: string;
  message: string;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthStr = `${year}年${month}月`;

  // Generate unique code for this month
  let code = generateActivationCode();
  let attempts = 0;

  // Ensure uniqueness
  while (attempts < 10) {
    const existingCode = await db.select()
      .from(activationCodes)
      .where(eq(activationCodes.code, code))
      .limit(1);

    if (existingCode.length === 0) break;
    code = generateActivationCode();
    attempts++;
  }

  // Set expiration to end of next month (gives users time to use the code)
  const expiresAt = new Date(year, month + 1, 0, 23, 59, 59); // End of next month

  // Create the monthly activation code
  await db.insert(activationCodes).values({
    code,
    planType: 'monthly',
    durationDays: 30,
    createdByAdminId: 0, // System generated
    adminNote: `月次自動生成 (${monthStr})`,
    expiresAt,
  });

  console.log(`[MonthlyCode] Generated monthly activation code: ${code} for ${monthStr}`);

  // Notify owner
  await notifyOwner({
    title: `📅 ${monthStr}の月次合言葉を生成しました`,
    content: `新しい月次合言葉: ${code}\n有効期限: ${expiresAt.toLocaleDateString('ja-JP')}\n\nこの合言葉は今月の銀行振込確認後にユーザーへ送信されます。`,
  });

  return {
    success: true,
    code,
    message: `${monthStr}の月次合言葉を生成しました: ${code}`,
  };
}

/**
 * Get the current month's activation code
 * Returns the latest monthly code that is still valid
 */
export async function getCurrentMonthlyCode(): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthStr = `${year}年${month}月`;

  // Find the current month's code
  const currentCode = await db.select()
    .from(activationCodes)
    .where(and(
      eq(activationCodes.status, "pending"),
      sql`${activationCodes.adminNote} LIKE ${`%月次自動生成%${monthStr}%`}`
    ))
    .limit(1);

  if (currentCode.length > 0) {
    return currentCode[0].code;
  }

  // If no code exists for this month, generate one
  const result = await generateMonthlyActivationCode();
  return result.success ? result.code : null;
}

/**
 * Get all monthly codes for display in admin dashboard
 */
export async function getMonthlyCodeHistory(): Promise<Array<{
  code: string;
  month: string;
  status: string;
  usageCount: number;
  createdAt: Date;
  expiresAt: Date | null;
}>> {
  const db = await getDb();
  if (!db) return [];

  // Get all monthly codes
  const codes = await db.select()
    .from(activationCodes)
    .where(sql`${activationCodes.adminNote} LIKE '%月次自動生成%'`)
    .orderBy(desc(activationCodes.createdAt));

  return codes.map(code => ({
    code: code.code,
    month: code.adminNote?.match(/\d{4}年\d{1,2}月/)?.[0] || 'Unknown',
    status: code.status,
    usageCount: code.usedByUserId ? 1 : 0, // For monthly codes, each is single-use
    createdAt: code.createdAt,
    expiresAt: code.expiresAt,
  }));
}

/**
 * Send renewal reminder notifications to users whose premium expires in 3 days
 * 継続ユーザーへの3日前リマインド通知
 */
export async function sendRenewalReminders(): Promise<{
  sent: number;
  users: string[];
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const fourDaysFromNow = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

  let sent = 0;
  const notifiedUsers: string[] = [];

  // Find users whose premium expires in exactly 3 days (±1 day tolerance)
  const expiringUsers = await db.select()
    .from(users)
    .where(and(
      eq(users.isPremium, true),
      sql`${users.premiumExpiresAt} >= ${threeDaysFromNow}`,
      sql`${users.premiumExpiresAt} < ${fourDaysFromNow}`,
      eq(users.renewalReminderSent, false)
    ));

  for (const user of expiringUsers) {
    // Send in-app notification
    await db.insert(notifications).values({
      userId: user.id,
      type: "payment",
      title: "🔔 プレミアムプランの更新時期が近づいています",
      message: `あなたのプレミアムプランは${new Date(user.premiumExpiresAt!).toLocaleDateString('ja-JP')}に期限を迎えます。\n\n継続をご希望の場合は、以下の口座へ1,980円をお振込みください：\n\n楽天銀行 エンカ支店\n普通 1479015\nタケベケイサク\n\n振込確認後、プランを更新いたします。`,
      isRead: false,
    });

    // Mark reminder as sent
    await db.update(users)
      .set({ renewalReminderSent: true })
      .where(eq(users.id, user.id));

    // Send email notification if configured
    if (isEmailConfigured() && user.email) {
      try {
        await sendRenewalReminderEmail({
          to: user.email,
          userName: user.name || 'お客',
          planName: '月額プラン',
          expiresAt: new Date(user.premiumExpiresAt!).toLocaleDateString('ja-JP'),
          renewalAmount: '¥1,980',
        });
        console.log(`[RenewalReminder] Email sent to ${user.email}`);
      } catch (emailError) {
        console.error(`[RenewalReminder] Failed to send email to ${user.email}:`, emailError);
      }
    }

    sent++;
    notifiedUsers.push(user.name || user.email || `User ${user.id}`);
  }

  if (sent > 0) {
    console.log(`[RenewalReminder] Sent ${sent} renewal reminders`);
    
    // Notify owner
    await notifyOwner({
      title: "📬 更新リマインド通知を送信しました",
      content: `${sent}名のユーザーに更新リマインド通知を送信しました。${isEmailConfigured() ? '(メール送信済み)' : ''}\n\n対象ユーザー:\n${notifiedUsers.join('\n')}`,
    });
  }

  return { sent, users: notifiedUsers };
}

/**
 * Process expired subscriptions
 * Downgrades users whose premium has expired
 */
export async function processExpiredSubscriptions(): Promise<{
  processed: number;
  downgraded: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  let processed = 0;
  let downgraded = 0;

  // Find users whose premium has expired
  const expiredUsers = await db.select()
    .from(users)
    .where(and(
      eq(users.isPremium, true),
      sql`${users.premiumExpiresAt} IS NOT NULL`,
      sql`${users.premiumExpiresAt} < ${now}`
    ));

  for (const user of expiredUsers) {
    processed++;

    // Downgrade to free plan
    await db.update(users)
      .set({
        isPremium: false,
        planType: "trial",
        subscriptionStatus: "none",
        renewalReminderSent: false, // Reset for future reminders
      })
      .where(eq(users.id, user.id));

    // Send notification about expiration
    await db.insert(notifications).values({
      userId: user.id,
      type: "payment",
      title: "プレミアムプランが期限切れになりました",
      message: "プレミアムプランの有効期限が切れました。引き続きサービスをご利用いただくには、銀行振込で更新をお願いいたします。",
      isRead: false,
    });

    // Send email notification if configured
    if (isEmailConfigured() && user.email) {
      try {
        await sendPlanExpiredEmail({
          to: user.email,
          userName: user.name || 'お客',
        });
        console.log(`[ExpiredSubscription] Email sent to ${user.email}`);
      } catch (emailError) {
        console.error(`[ExpiredSubscription] Failed to send email to ${user.email}:`, emailError);
      }
    }

    downgraded++;
    console.log(`[ExpiredSubscription] Downgraded user ${user.id} to free plan`);
  }

  if (downgraded > 0) {
    // Notify owner
    await notifyOwner({
      title: "⚠️ プラン期限切れ処理完了",
      content: `${downgraded}名のユーザーのプレミアムプランが期限切れになりました。`,
    });
  }

  return { processed, downgraded };
}

/**
 * Send activation code to user after bank transfer confirmation
 * 振込確認後の自動合言葉送信
 */
export async function sendActivationCodeToUser(
  userId: number,
  code: string,
  userName: string,
  _userEmail: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Send in-app notification with the activation code
    await db.insert(notifications).values({
      userId,
      type: "payment",
      title: "🎉 振込確認完了！合言葉をお送りします",
      message: `${userName}様\n\n銀行振込の確認が完了しました。\n\n【合言葉】${code}\n\nこの合言葉をサブスクリプションページで入力すると、プレミアムプランが有効になります。\n\n※合言葉の有効期限は7日間です。`,
      isRead: false,
    });

    console.log(`[ActivationCode] Sent activation code ${code} to user ${userId}`);
    return true;
  } catch (error) {
    console.error(`[ActivationCode] Failed to send activation code to user ${userId}:`, error);
    return false;
  }
}

/**
 * Get subscription statistics for admin dashboard
 */
export async function getSubscriptionStats(): Promise<{
  totalPremium: number;
  expiringIn3Days: number;
  expiringIn7Days: number;
  expiredToday: number;
  renewalRemindersSent: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  // Get all premium users
  const allPremiumUsers = await db.select()
    .from(users)
    .where(eq(users.isPremium, true));

  const totalPremium = allPremiumUsers.length;

  // Count users expiring in 3 days
  const expiringIn3Days = allPremiumUsers.filter(u => 
    u.premiumExpiresAt && 
    new Date(u.premiumExpiresAt) <= threeDaysFromNow &&
    new Date(u.premiumExpiresAt) > now
  ).length;

  // Count users expiring in 7 days
  const expiringIn7Days = allPremiumUsers.filter(u => 
    u.premiumExpiresAt && 
    new Date(u.premiumExpiresAt) <= sevenDaysFromNow &&
    new Date(u.premiumExpiresAt) > now
  ).length;

  // Count users who expired today
  const expiredToday = allPremiumUsers.filter(u => 
    u.premiumExpiresAt && 
    new Date(u.premiumExpiresAt) >= startOfToday &&
    new Date(u.premiumExpiresAt) < endOfToday
  ).length;

  // Count users who received renewal reminders
  const renewalRemindersSent = allPremiumUsers.filter(u => u.renewalReminderSent).length;

  return {
    totalPremium,
    expiringIn3Days,
    expiringIn7Days,
    expiredToday,
    renewalRemindersSent,
  };
}

/**
 * Run monthly subscription management tasks
 * Call this from a cron job on the 1st of each month
 */
export async function runMonthlySubscriptionTasks(): Promise<{
  newCode: string | null;
  reminders: { sent: number; users: string[] };
  expired: { processed: number; downgraded: number };
}> {
  console.log("[MonthlyTasks] Starting monthly subscription management...");

  // 1. Generate new monthly activation code
  let newCode: string | null = null;
  try {
    const codeResult = await generateMonthlyActivationCode();
    newCode = codeResult.success ? codeResult.code : null;
  } catch (error) {
    console.error("[MonthlyTasks] Failed to generate monthly code:", error);
  }

  // 2. Send renewal reminders (3 days before expiration)
  const reminders = await sendRenewalReminders();

  // 3. Process expired subscriptions
  const expired = await processExpiredSubscriptions();

  console.log("[MonthlyTasks] Monthly subscription management completed.");

  // Notify owner with summary
  await notifyOwner({
    title: "📊 月次サブスクリプション管理完了",
    content: `【月次合言葉】\n${newCode ? `新規生成: ${newCode}` : '生成なし'}\n\n【更新リマインド】\n送信数: ${reminders.sent}件\n\n【期限切れ処理】\n処理数: ${expired.processed}件\nダウングレード: ${expired.downgraded}件`,
  });

  return { newCode, reminders, expired };
}

/**
 * Run daily subscription tasks
 * Call this daily to handle reminders and expirations
 */
export async function runDailySubscriptionTasks(): Promise<{
  reminders: { sent: number; users: string[] };
  expired: { processed: number; downgraded: number };
  pendingWithdrawals: { success: boolean; count: number };
}> {
  console.log("[DailySubscriptionTasks] Starting daily subscription tasks...");

  // 1. Send renewal reminders (3 days before expiration)
  const reminders = await sendRenewalReminders();

  // 2. Process expired subscriptions
  const expired = await processExpiredSubscriptions();

  // 3. Check for pending withdrawal requests (older than 3 days)
  const { checkPendingWithdrawals } = await import("./email");
  const pendingWithdrawals = await checkPendingWithdrawals();

  console.log("[DailySubscriptionTasks] Daily subscription tasks completed.");

  return { reminders, expired, pendingWithdrawals };
}
