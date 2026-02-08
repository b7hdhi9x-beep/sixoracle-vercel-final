/**
 * Referral Rewards Batch Processing
 * 
 * This module handles:
 * 1. 30-day retention check: Moves rewards from "waiting_30days" to "approved" after 30 days (auto-approval)
 * 2. 5-person milestone rewards: Awards 2,500 yen when a referrer reaches 5, 10, 15... referrals
 * 3. Continuation bonus: Awards bonus for 3, 6, 12 months of continuous subscription
 * 4. Rakuten Bank CSV generation: Generates CSV for bulk bank transfers
 * 
 * Run this daily via cron job or scheduled task
 */

import { getDb } from "./db";
import { referralRewards, users, notifications, payoutRequests } from "../drizzle/schema";
import { eq, and, lte, sql, inArray } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { sendReferralMilestoneNotification } from "./email";

// Constants
const REWARD_PER_REFERRAL = 500; // 500 yen per referral
const MILESTONE_COUNT = 5; // Every 5 referrals
const MILESTONE_REWARD = 2500; // 2,500 yen per 5 referrals

// Continuation bonus amounts (200 yen per month, awarded every 3 months)
const MONTHLY_CONTINUATION_BONUS = 200; // 200 yen per month
const CONTINUATION_CHECK_INTERVAL = 3; // Check every 3 months
const RETENTION_DAYS = 90; // 3 months = 90 days for reward confirmation
const MIN_PAYOUT_AMOUNT = 1000; // Minimum payout amount: 1,000 yen
const TRANSFER_FEE = 145; // Bank transfer fee (user pays)

/**
 * Process 90-day (3-month) retention checks with AUTO-APPROVAL
 * Moves rewards from "waiting_90days" directly to "approved" status
 * for referrals where the referred user has been a paid member for 90+ days (3 months)
 * 
 * Reward amounts:
 * - Referrer: 500 yen (after 3-month retention)
 * - Referred user: 100 yen (after 3-month retention)
 */
export async function processRetentionChecks(): Promise<{
  processed: number;
  activated: number;
  cancelled: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  let processed = 0;
  let activated = 0;
  let cancelled = 0;

  // Get all rewards waiting for 90-day (3-month) retention check
  const waitingRewards = await db.select()
    .from(referralRewards)
    .where(and(
      eq(referralRewards.status, "waiting_90days"),
      lte(referralRewards.retentionEndsAt, now)
    ));

  for (const reward of waitingRewards) {
    processed++;

    // Check if the referred user is still a paid member
    const referredUser = await db.select()
      .from(users)
      .where(eq(users.id, reward.referredUserId))
      .limit(1);

    if (!referredUser[0]) {
      // User deleted - cancel reward
      await db.update(referralRewards)
        .set({
          status: "cancelled",
          retentionPassed: false,
          adminNote: "Referred user account deleted",
        })
        .where(eq(referralRewards.id, reward.id));
      cancelled++;
      continue;
    }

    const user = referredUser[0];
    
    // Check if user is still premium (has active subscription or valid premium expiration)
    const isPremiumActive = user.isPremium && 
      (user.premiumExpiresAt === null || new Date(user.premiumExpiresAt) > now);

    if (isPremiumActive) {
      // User passed 90-day (3-month) retention - AUTO-APPROVE reward
      await db.update(referralRewards)
        .set({
          status: "approved", // Auto-approve instead of pending
          retentionPassed: true,
          approvedAt: now,
          adminNote: "Auto-approved after 90-day (3-month) retention",
        })
        .where(eq(referralRewards.id, reward.id));
      activated++;

      // Get referrer and referred user info for notification
      const referrer = await db.select()
        .from(users)
        .where(eq(users.id, reward.userId))
        .limit(1);
      
      // Send milestone notification (3-month retention achieved)
      if (referrer[0]) {
        await sendReferralMilestoneNotification({
          referrerId: reward.userId,
          referrerName: referrer[0].name || "ユーザー",
          referrerEmail: referrer[0].email,
          referredUserId: reward.referredUserId,
          referredUserName: user.name || "ユーザー",
          referrerRewardAmount: reward.amount,
          referredRewardAmount: 100, // 被紹介者報酬
        });
      }

      // Check for milestone rewards (5, 10, 15... referrals)
      await checkMilestoneReward(reward.userId);

    } else {
      // User cancelled before 30 days - cancel reward
      await db.update(referralRewards)
        .set({
          status: "cancelled",
          retentionPassed: false,
          adminNote: "Referred user cancelled subscription before 90 days (3 months)",
        })
        .where(eq(referralRewards.id, reward.id));
      cancelled++;

      // Notify the referrer
      await db.insert(notifications).values({
        userId: reward.userId,
        type: "referral",
        title: "紹介報酬がキャンセルされました",
        message: `紹介したユーザーが3ヶ月以内に解約したため、報酬がキャンセルされました。`,
        isRead: false,
      });
    }
  }

  // Log summary
  console.log(`[ReferralRewardsBatch] Retention check completed: ${processed} processed, ${activated} auto-approved, ${cancelled} cancelled`);

  // Notify owner if there were any changes
  if (processed > 0) {
    await notifyOwner({
      title: "紹介報酬バッチ処理完了（自動承認）",
      content: `処理件数: ${processed}件\n自動承認: ${activated}件\nキャンセル: ${cancelled}件`,
    });
  }

  return { processed, activated, cancelled };
}

/**
 * Process continuation bonuses for users with continuous subscriptions
 * Awards 200 yen per month, checked every 3 months (600 yen per 3-month period)
 * Requires 3 months of continuous subscription to qualify
 */
export async function processContinuationBonuses(): Promise<{
  processed: number;
  bonusesAwarded: number;
  totalBonusAmount: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  let processed = 0;
  let bonusesAwarded = 0;
  let totalBonusAmount = 0;

  // Get all premium users
  const premiumUsers = await db.select()
    .from(users)
    .where(eq(users.isPremium, true));

  for (const user of premiumUsers) {
    processed++;

    // Calculate subscription duration in days
    const createdAt = new Date(user.createdAt);
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate how many 3-month periods have passed
    const periodsCompleted = Math.floor(daysSinceCreation / 90); // 90 days = 3 months
    
    if (periodsCompleted === 0) continue; // Not yet 3 months
    
    // Calculate bonus for this period (200 yen x 3 months = 600 yen per period)
    const bonusPerPeriod = MONTHLY_CONTINUATION_BONUS * CONTINUATION_CHECK_INTERVAL;
    
    // Check if user just reached a new 3-month milestone (within the last day)
    const daysAtMilestone = periodsCompleted * 90;
    
    // Award bonus if user is exactly at the milestone day (±1 day tolerance)
    if (Math.abs(daysSinceCreation - daysAtMilestone) <= 1) {
      // Check if bonus was already awarded for this period
      const periodLabel = `${periodsCompleted * 3}ヶ月継続ボーナス`;
      const existingNotification = await db.select()
        .from(notifications)
        .where(and(
          eq(notifications.userId, user.id),
          eq(notifications.type, "referral"),
          sql`${notifications.title} LIKE ${`%${periodLabel}%`}`
        ))
        .limit(1);

      if (existingNotification.length === 0) {
        // Award the bonus by creating an approved referral reward
        await db.insert(referralRewards).values({
          userId: user.id,
          referredUserId: user.id, // Self-referral for continuation bonus
          referralCodeId: 0, // No referral code for continuation bonus
          amount: bonusPerPeriod,
          status: "approved",
          retentionPassed: true,
          approvedAt: now,
          adminNote: `${periodLabel}（月額200円×3ヶ月＝600円、自動付与）`,
        });

        // Notify the user
        await db.insert(notifications).values({
          userId: user.id,
          type: "referral",
          title: `🎁 ${periodLabel}！`,
          message: `${periodsCompleted * 3}ヶ月間のご利用ありがとうございます！継続ボーナス${bonusPerPeriod.toLocaleString()}円（月額200円×3ヶ月）が付与されました。出金申請が可能です。`,
          isRead: false,
        });

        bonusesAwarded++;
        totalBonusAmount += bonusPerPeriod;

        console.log(`[ContinuationBonus] Awarded ${bonusPerPeriod} yen to user ${user.id} for ${periodsCompleted * 3} months`);
      }
    }
  }

  // Log summary
  console.log(`[ContinuationBonus] Processed: ${processed} users, Bonuses awarded: ${bonusesAwarded}, Total: ${totalBonusAmount} yen`);

  // Notify owner if there were any bonuses
  if (bonusesAwarded > 0) {
    await notifyOwner({
      title: "継続ボーナス付与完了",
      content: `処理ユーザー数: ${processed}人\n付与件数: ${bonusesAwarded}件\n合計金額: ${totalBonusAmount.toLocaleString()}円`,
    });
  }

  return { processed, bonusesAwarded, totalBonusAmount };
}

/**
 * Generate Rakuten Bank CSV for approved payout requests
 * CSV format follows Rakuten Bank WEB-FB総合振込 specification
 */
export async function generateRakutenBankCSV(executionDate?: Date): Promise<{
  csv: string;
  count: number;
  totalAmount: number;
  payoutRequestIds: number[];
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all pending payout requests
  const pendingPayouts = await db.select()
    .from(payoutRequests)
    .where(eq(payoutRequests.status, "pending"));

  if (pendingPayouts.length === 0) {
    return { csv: "", count: 0, totalAmount: 0, payoutRequestIds: [] };
  }

  // Use provided date or default to tomorrow
  const execDate = executionDate || new Date(Date.now() + 24 * 60 * 60 * 1000);
  const mmdd = `${String(execDate.getMonth() + 1).padStart(2, '0')}${String(execDate.getDate()).padStart(2, '0')}`;

  // Bank code mapping (common banks)
  const bankCodes: Record<string, string> = {
    "楽天銀行": "0036",
    "三菱UFJ銀行": "0005",
    "三井住友銀行": "0009",
    "みずほ銀行": "0001",
    "りそな銀行": "0010",
    "ゆうちょ銀行": "9900",
    "PayPay銀行": "0033",
    "住信SBIネット銀行": "0038",
    "ソニー銀行": "0035",
    "イオン銀行": "0040",
    "セブン銀行": "0034",
    "auじぶん銀行": "0039",
  };

  // Account type mapping
  const accountTypeMap: Record<string, string> = {
    "ordinary": "1",  // 普通
    "checking": "2",  // 当座
  };

  const csvLines: string[] = [];
  let totalAmount = 0;
  const payoutRequestIds: number[] = [];

  for (const payout of pendingPayouts) {
    // Get bank code (default to 0000 if not found)
    const bankCode = bankCodes[payout.bankName] || "0000";
    
    // Get branch code (assume 3 digits, pad with zeros)
    const branchCode = payout.branchName.replace(/[^0-9]/g, '').padStart(3, '0').slice(0, 3);
    
    // Get account type
    const accountType = accountTypeMap[payout.accountType] || "1";
    
    // Get account number (7 digits, pad with zeros)
    const accountNumber = payout.accountNumber.replace(/[^0-9]/g, '').padStart(7, '0').slice(0, 7);
    
    // Get account holder name (convert to full-width katakana if needed)
    const accountHolderName = payout.accountHolderName.toUpperCase();
    
    // Get actual transfer amount
    const amount = payout.actualTransferAmount;
    
    // Customer number (use payout request ID)
    const customerNumber = String(payout.id).padStart(6, '0');

    // Build CSV line: サービス区分,実行日,銀行番号,支店番号,預金種目,口座番号,口座名義,金額,顧客番号
    const csvLine = [
      "3",              // サービス区分（総合振込）
      mmdd,             // 実行日
      bankCode,         // 受取人銀行番号
      branchCode,       // 受取人支店番号
      accountType,      // 受取人預金種目
      accountNumber,    // 受取人口座番号
      accountHolderName,// 受取人口座名義
      amount,           // 金額
      customerNumber,   // 顧客番号
    ].join(",");

    csvLines.push(csvLine);
    totalAmount += amount;
    payoutRequestIds.push(payout.id);
  }

  const csv = csvLines.join("\n");

  console.log(`[RakutenBankCSV] Generated CSV with ${csvLines.length} transfers, total: ${totalAmount} yen`);

  return {
    csv,
    count: csvLines.length,
    totalAmount,
    payoutRequestIds,
  };
}

/**
 * Mark payout requests as processing after CSV is downloaded
 */
export async function markPayoutsAsProcessing(payoutRequestIds: number[]): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(payoutRequests)
    .set({
      status: "processing",
      processedAt: new Date(),
    })
    .where(inArray(payoutRequests.id, payoutRequestIds));

  console.log(`[RakutenBankCSV] Marked ${payoutRequestIds.length} payout requests as processing`);
}

/**
 * Mark payout requests as completed after bank transfer is confirmed
 */
export async function markPayoutsAsCompleted(
  payoutRequestIds: number[],
  adminId: number,
  transferReference?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const now = new Date();

  for (const payoutId of payoutRequestIds) {
    // Update payout request
    await db.update(payoutRequests)
      .set({
        status: "completed",
        processedAt: now,
        processedByAdminId: adminId,
        transferReference: transferReference || `BATCH_${now.toISOString().split('T')[0]}`,
      })
      .where(eq(payoutRequests.id, payoutId));

    // Get the payout request to find associated rewards
    const payout = await db.select()
      .from(payoutRequests)
      .where(eq(payoutRequests.id, payoutId))
      .limit(1);

    if (payout[0]) {
      // Mark associated rewards as paid
      await db.update(referralRewards)
        .set({
          status: "paid",
          paidAt: now,
          paidByAdminId: adminId,
        })
        .where(eq(referralRewards.payoutRequestId, payoutId));

      // Notify the user
      await db.insert(notifications).values({
        userId: payout[0].userId,
        type: "payment",
        title: "出金が完了しました！",
        message: `${payout[0].actualTransferAmount.toLocaleString()}円の振込が完了しました。`,
        isRead: false,
      });
    }
  }

  console.log(`[RakutenBankCSV] Marked ${payoutRequestIds.length} payout requests as completed`);

  // Notify owner
  await notifyOwner({
    title: "出金処理完了",
    content: `${payoutRequestIds.length}件の出金処理が完了しました。`,
  });
}

/**
 * Check if a referrer has reached a milestone (5, 10, 15... referrals)
 * and award the milestone bonus if not already awarded
 */
async function checkMilestoneReward(referrerId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Count confirmed referrals (pending, approved, or paid status)
  const confirmedRewards = await db.select()
    .from(referralRewards)
    .where(and(
      eq(referralRewards.userId, referrerId),
      sql`${referralRewards.status} IN ('pending', 'approved', 'paid')`
    ));

  const confirmedCount = confirmedRewards.length;
  
  // Calculate which milestone was just reached
  const currentMilestone = Math.floor(confirmedCount / MILESTONE_COUNT) * MILESTONE_COUNT;
  
  if (currentMilestone === 0) return;
  
  // Check if this milestone was just reached (count equals milestone)
  if (confirmedCount !== currentMilestone) return;

  // Get referrer info
  const referrer = await db.select()
    .from(users)
    .where(eq(users.id, referrerId))
    .limit(1);

  if (!referrer[0]) return;

  // Notify the referrer about milestone achievement
  await db.insert(notifications).values({
    userId: referrerId,
    type: "referral",
    title: `🎉 ${currentMilestone}人紹介達成！`,
    message: `おめでとうございます！${currentMilestone}人の紹介を達成しました。合計${MILESTONE_REWARD.toLocaleString()}円の報酬が確定しています！`,
    isRead: false,
  });

  // Notify owner
  await notifyOwner({
    title: `紹介マイルストーン達成: ${currentMilestone}人`,
    content: `ユーザー「${referrer[0].name || referrer[0].email || referrerId}」が${currentMilestone}人の紹介を達成しました。`,
  });

  console.log(`[ReferralRewardsBatch] Milestone reached: User ${referrerId} reached ${currentMilestone} referrals`);
}

/**
 * Get reward statistics for admin dashboard
 */
export async function getRewardStats(): Promise<{
  waiting30days: number;
  pending: number;
  approved: number;
  paid: number;
  cancelled: number;
  totalAmount: number;
  pendingAmount: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allRewards = await db.select().from(referralRewards);

  const waiting30days = allRewards.filter(r => r.status === "waiting_30days").length;
  const pending = allRewards.filter(r => r.status === "pending").length;
  const approved = allRewards.filter(r => r.status === "approved").length;
  const paid = allRewards.filter(r => r.status === "paid").length;
  const cancelled = allRewards.filter(r => r.status === "cancelled").length;

  const totalAmount = allRewards
    .filter(r => r.status !== "cancelled")
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingAmount = allRewards
    .filter(r => r.status === "pending" || r.status === "approved")
    .reduce((sum, r) => sum + r.amount, 0);

  return {
    waiting30days,
    pending,
    approved,
    paid,
    cancelled,
    totalAmount,
    pendingAmount,
  };
}

/**
 * Manual trigger for testing - process a specific reward immediately
 * (Admin only)
 */
export async function forceProcessReward(rewardId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const reward = await db.select()
    .from(referralRewards)
    .where(eq(referralRewards.id, rewardId))
    .limit(1);

  if (!reward[0] || reward[0].status !== "waiting_30days") {
    return false;
  }

  // Force activate and auto-approve the reward
  await db.update(referralRewards)
    .set({
      status: "approved", // Auto-approve
      retentionPassed: true,
      approvedAt: new Date(),
      adminNote: "Manually processed and auto-approved by admin",
    })
    .where(eq(referralRewards.id, rewardId));

  // Check for milestone
  await checkMilestoneReward(reward[0].userId);

  return true;
}

/**
 * Run all daily batch processes
 * Call this from a cron job or scheduled task
 */
export async function runDailyBatch(): Promise<{
  retention: { processed: number; activated: number; cancelled: number };
  continuation: { processed: number; bonusesAwarded: number; totalBonusAmount: number };
}> {
  console.log("[DailyBatch] Starting daily batch processing...");

  const retention = await processRetentionChecks();
  const continuation = await processContinuationBonuses();

  console.log("[DailyBatch] Daily batch processing completed.");

  // Notify owner with summary
  await notifyOwner({
    title: "日次バッチ処理完了",
    content: `【紹介報酬】\n処理: ${retention.processed}件, 自動承認: ${retention.activated}件, キャンセル: ${retention.cancelled}件\n\n【継続ボーナス】\n処理: ${continuation.processed}人, 付与: ${continuation.bonusesAwarded}件, 合計: ${continuation.totalBonusAmount.toLocaleString()}円`,
  });

  return { retention, continuation };
}
