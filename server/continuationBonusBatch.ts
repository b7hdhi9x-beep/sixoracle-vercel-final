import { getDb } from "./db";
import { users, continuationBonuses, subscriptionHistory, notifications } from "../drizzle/schema";
import type { SubscriptionHistory, ContinuationBonus } from "../drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { sendRewardNotificationEmail } from "./email";

// Bonus amounts for each milestone (200円/月 × 継続月数)
// 3ヶ月: 200円 × 3 = 600円
// 6ヶ月: 200円 × 6 = 1,200円
// 12ヶ月: 200円 × 12 = 2,400円
const BONUS_AMOUNTS = {
  "3_months": 600,
  "6_months": 1200,
  "12_months": 2400,
} as const;

type MilestoneType = keyof typeof BONUS_AMOUNTS;
type LastBonusMilestone = "none" | "3_months" | "6_months" | "12_months";

const milestoneOrder: Record<LastBonusMilestone, number> = {
  "none": 0,
  "3_months": 1,
  "6_months": 2,
  "12_months": 3,
};

/**
 * Check and award continuation bonuses for all eligible users
 * Should be run daily via cron job
 */
export async function processContinuationBonuses(): Promise<{
  processed: number;
  bonusesAwarded: number;
  totalAmount: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let processed = 0;
  let bonusesAwarded = 0;
  let totalAmount = 0;

  try {
    // Get all premium users with active subscriptions
    const premiumUsers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.isPremium, true),
          eq(users.subscriptionStatus, "active")
        )
      );

    for (const user of premiumUsers) {
      processed++;

      // Get or create subscription history
      const historyRows = await db
        .select()
        .from(subscriptionHistory)
        .where(
          and(
            eq(subscriptionHistory.userId, user.id),
            isNull(subscriptionHistory.endDate)
          )
        );
      
      let history: SubscriptionHistory | undefined = historyRows[0];

      if (!history) {
        // Create new subscription history record
        await db
          .insert(subscriptionHistory)
          .values({
            userId: user.id,
            startDate: user.createdAt,
            consecutiveMonths: 0,
            lastBonusMilestone: "none",
          });
        
        const newHistoryRows = await db
          .select()
          .from(subscriptionHistory)
          .where(eq(subscriptionHistory.userId, user.id));
        
        history = newHistoryRows[0];
      }

      if (!history) continue;

      // Calculate consecutive months from start date
      const startDate = new Date(history.startDate);
      const now = new Date();
      const monthsDiff = Math.floor(
        (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      // Update consecutive months
      await db
        .update(subscriptionHistory)
        .set({ consecutiveMonths: monthsDiff })
        .where(eq(subscriptionHistory.id, history.id));

      // Check for milestone bonuses
      const milestones: MilestoneType[] = ["3_months", "6_months", "12_months"];
      const milestoneMonths: Record<MilestoneType, number> = {
        "3_months": 3,
        "6_months": 6,
        "12_months": 12,
      };

      for (const milestone of milestones) {
        const requiredMonths = milestoneMonths[milestone];
        const lastMilestone = history.lastBonusMilestone as LastBonusMilestone;
        const currentMilestoneOrder = milestoneOrder[lastMilestone];
        const targetMilestoneOrder = milestoneOrder[milestone];

        // Check if user has reached this milestone and hasn't received this bonus yet
        if (monthsDiff >= requiredMonths && currentMilestoneOrder < targetMilestoneOrder) {
          const bonusAmount = BONUS_AMOUNTS[milestone];

          // Check if bonus already exists
          const existingBonusRows = await db
            .select()
            .from(continuationBonuses)
            .where(
              and(
                eq(continuationBonuses.userId, user.id),
                eq(continuationBonuses.milestoneType, milestone)
              )
            );
          
          const existingBonus = existingBonusRows[0];

          if (!existingBonus) {
            // Award the bonus
            await db.insert(continuationBonuses).values({
              userId: user.id,
              milestoneType: milestone,
              amount: bonusAmount,
              status: "pending",
            });

            // Update last bonus milestone
            await db
              .update(subscriptionHistory)
              .set({ lastBonusMilestone: milestone })
              .where(eq(subscriptionHistory.id, history.id));

            // Create notification for user
            await db.insert(notifications).values({
              userId: user.id,
              type: "referral",
              title: `継続ボーナス獲得！`,
              message: `${requiredMonths}ヶ月継続ありがとうございます！${bonusAmount.toLocaleString()}円のボーナスを獲得しました。`,
              isRead: false,
            });

            // Send email notification
            if (user.email) {
              await sendRewardNotificationEmail(
                user.email,
                user.name || "会員",
                bonusAmount,
                `${requiredMonths}ヶ月継続ボーナス`
              );
            }

            // Notify owner
            await notifyOwner({
              title: `継続ボーナス付与: ${user.name || user.email || `ID:${user.id}`}`,
              content: `${requiredMonths}ヶ月継続ボーナス ${bonusAmount.toLocaleString()}円を付与しました。`,
            });

            bonusesAwarded++;
            totalAmount += bonusAmount;
          }
        }
      }
    }

    return { processed, bonusesAwarded, totalAmount };
  } catch (error) {
    console.error("[ContinuationBonusBatch] Error:", error);
    throw error;
  }
}

/**
 * Get continuation bonus statistics
 */
export async function getContinuationBonusStats(): Promise<{
  totalBonusesAwarded: number;
  totalAmountAwarded: number;
  pendingBonuses: number;
  pendingAmount: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allBonuses: ContinuationBonus[] = await db.select().from(continuationBonuses);
  
  const totalBonusesAwarded = allBonuses.length;
  const totalAmountAwarded = allBonuses.reduce((sum, b) => sum + b.amount, 0);
  
  const pendingBonuses = allBonuses.filter(b => b.status === "pending").length;
  const pendingAmount = allBonuses
    .filter(b => b.status === "pending")
    .reduce((sum, b) => sum + b.amount, 0);

  return {
    totalBonusesAwarded,
    totalAmountAwarded,
    pendingBonuses,
    pendingAmount,
  };
}
