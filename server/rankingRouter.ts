import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { referralCodes, referralUsage, users, referralRewards } from "../drizzle/schema";
import { eq, sql, desc } from "drizzle-orm";

// Create database connection
const pool = mysql.createPool(process.env.DATABASE_URL!);
const db = drizzle(pool);

export const rankingRouter = router({
  // Get top referrers ranking
  getTopReferrers: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10) }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit || 10;

      // Get referral counts and earnings per user
      const rankings = await db
        .select({
          userId: referralCodes.userId,
          userName: users.name,
          referralCount: sql<number>`COUNT(DISTINCT ${referralUsage.id})`.as("referral_count"),
          totalEarnings: sql<number>`COALESCE(SUM(${referralRewards.amount}), 0)`.as("total_earnings"),
        })
        .from(referralCodes)
        .leftJoin(referralUsage, eq(referralUsage.referralCodeId, referralCodes.id))
        .leftJoin(users, eq(users.id, referralCodes.userId))
        .leftJoin(referralRewards, eq(referralRewards.userId, referralCodes.userId))
        .groupBy(referralCodes.userId, users.name)
        .having(sql`COUNT(DISTINCT ${referralUsage.id}) > 0`)
        .orderBy(desc(sql`referral_count`), desc(sql`total_earnings`))
        .limit(limit);

      return rankings.map((r: { userId: number; userName: string | null; referralCount: number; totalEarnings: number }, index: number) => ({
        rank: index + 1,
        userId: r.userId,
        userName: r.userName || "Anonymous",
        referralCount: Number(r.referralCount),
        totalEarnings: Number(r.totalEarnings),
      }));
    }),
});
