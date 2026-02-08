/**
 * Payment Link and Webhook Router
 * 
 * Handles payment link generation and webhook processing for external payment providers
 * (Telecom Credit, Alpha Note, etc.)
 * 
 * Flow:
 * 1. User initiates subscription -> generatePaymentLink creates a unique link
 * 2. User completes payment on external provider's page
 * 3. Provider sends webhook notification -> processWebhook activates the plan
 */

import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { paymentLinks, paymentWebhooks, users, purchaseHistory } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import crypto from "crypto";

// Fixed subscription price (¥1,980/month)
const SUBSCRIPTION_PRICE = 1980;

// Generate a unique order ID
function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

// Generate a unique link ID
function generateLinkId(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Calculate expiration time (24 hours from now)
function getExpirationTime(): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 24);
  return expiration;
}

export const paymentRouter = router({
  /**
   * Generate a payment link for subscription
   * This creates a unique link that can be used with external payment providers
   */
  generatePaymentLink: protectedProcedure
    .input(z.object({
      returnUrl: z.string().url().optional(),
      metadata: z.record(z.string(), z.string()).optional(),
    }).optional())
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if user already has an active subscription
      const userResult = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!userResult[0]) throw new Error("User not found");
      
      const user = userResult[0];
      if (user.planType === 'premium' && user.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date()) {
        throw new Error("既にプレミアムプランに加入しています");
      }

      // Check for existing pending payment links (prevent duplicate orders)
      const existingLinks = await db.select()
        .from(paymentLinks)
        .where(and(
          eq(paymentLinks.userId, ctx.user.id),
          eq(paymentLinks.status, 'pending')
        ))
        .limit(1);

      // If there's a pending link that hasn't expired, return it
      if (existingLinks[0] && existingLinks[0].expiresAt && new Date(existingLinks[0].expiresAt) > new Date()) {
        return {
          linkId: existingLinks[0].linkId,
          orderId: existingLinks[0].linkId, // Use linkId as orderId
          amount: existingLinks[0].amount,
          expiresAt: existingLinks[0].expiresAt,
          // Payment URL would be constructed by the frontend based on the provider
          paymentParams: {
            user_id: ctx.user.id.toString(),
            order_id: existingLinks[0].linkId,
            amount: existingLinks[0].amount.toString(),
            return_url: input?.returnUrl || null,
          },
        };
      }

      // Generate new payment link
      const linkId = generateLinkId();
      const expiresAt = getExpirationTime();

      await db.insert(paymentLinks).values({
        linkId,
        userId: ctx.user.id,
        provider: 'other', // Will be updated when provider is selected
        planType: 'monthly',
        amount: SUBSCRIPTION_PRICE,
        status: 'pending',
        expiresAt,
        metadata: input?.metadata ? JSON.stringify(input.metadata) : null,
      });

      return {
        linkId,
        orderId: linkId, // Use linkId as orderId
        amount: SUBSCRIPTION_PRICE,
        expiresAt,
        paymentParams: {
          user_id: ctx.user.id.toString(),
          order_id: linkId,
          amount: SUBSCRIPTION_PRICE.toString(),
          return_url: input?.returnUrl || null,
        },
      };
    }),

  /**
   * Get payment link status
   */
  getPaymentLinkStatus: protectedProcedure
    .input(z.object({
      linkId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.select()
        .from(paymentLinks)
        .where(and(
          eq(paymentLinks.linkId, input.linkId),
          eq(paymentLinks.userId, ctx.user.id)
        ))
        .limit(1);
      
      const link = result[0];

      if (!link) {
        throw new Error("Payment link not found");
      }

      return {
        linkId: link.linkId,
        status: link.status,
        amount: link.amount,
        expiresAt: link.expiresAt,
        completedAt: link.completedAt,
        isExpired: link.expiresAt ? new Date(link.expiresAt) < new Date() && link.status === 'pending' : false,
      };
    }),

  /**
   * Get user's payment history
   */
  getPaymentHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const limit = input?.limit ?? 10;

      const links = await db.select()
        .from(paymentLinks)
        .where(eq(paymentLinks.userId, ctx.user.id))
        .orderBy(desc(paymentLinks.createdAt))
        .limit(limit);

      return links.map(link => ({
        linkId: link.linkId,
        amount: link.amount,
        status: link.status,
        createdAt: link.createdAt,
        completedAt: link.completedAt,
        provider: link.provider,
      }));
    }),

  /**
   * Cancel a pending payment link
   */
  cancelPaymentLink: protectedProcedure
    .input(z.object({
      linkId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.select()
        .from(paymentLinks)
        .where(and(
          eq(paymentLinks.linkId, input.linkId),
          eq(paymentLinks.userId, ctx.user.id),
          eq(paymentLinks.status, 'pending')
        ))
        .limit(1);

      if (!result[0]) {
        throw new Error("Pending payment link not found");
      }

      await db.update(paymentLinks)
        .set({ status: 'cancelled' })
        .where(eq(paymentLinks.linkId, input.linkId));

      return { success: true };
    }),

  // ===== Admin Functions =====

  /**
   * Get all payment links (admin only)
   */
  getAllPaymentLinks: protectedProcedure
    .input(z.object({
      status: z.enum(['pending', 'completed', 'expired', 'cancelled']).optional(),
      limit: z.number().min(1).max(100).default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select({
        id: paymentLinks.id,
        linkId: paymentLinks.linkId,
        userId: paymentLinks.userId,
        amount: paymentLinks.amount,
        status: paymentLinks.status,
        provider: paymentLinks.provider,
        createdAt: paymentLinks.createdAt,
        completedAt: paymentLinks.completedAt,
        expiresAt: paymentLinks.expiresAt,
      }).from(paymentLinks);

      if (input?.status) {
        query = query.where(eq(paymentLinks.status, input.status)) as typeof query;
      }

      const links = await query
        .orderBy(desc(paymentLinks.createdAt))
        .limit(input?.limit ?? 50);

      // Get user info for each link
      const userIds = Array.from(new Set(links.map(l => l.userId)));
      const userInfos = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        displayName: users.displayName,
      }).from(users);

      const userMap = new Map(userInfos.map(u => [u.id, u]));

      return links.map(link => ({
        ...link,
        user: userMap.get(link.userId) || null,
      }));
    }),

  /**
   * Manually activate a user's subscription (admin only)
   * Used for bank transfer confirmations or manual processing
   */
  manualActivation: protectedProcedure
    .input(z.object({
      userId: z.number(),
      linkId: z.string().optional(),
      months: z.number().min(1).max(12).default(1),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get user
      const userResult = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!userResult[0]) throw new Error("User not found");

      const user = userResult[0];

      // Calculate new premium expiration
      const now = new Date();
      let premiumExpiresAt: Date;
      
      if (user.premiumExpiresAt && new Date(user.premiumExpiresAt) > now) {
        // Extend existing subscription
        premiumExpiresAt = new Date(user.premiumExpiresAt);
      } else {
        // Start new subscription
        premiumExpiresAt = new Date(now);
      }
      premiumExpiresAt.setMonth(premiumExpiresAt.getMonth() + input.months);

      // Update user's plan
      await db.update(users)
        .set({
          planType: 'premium',
          premiumExpiresAt,
          updatedAt: now,
        })
        .where(eq(users.id, input.userId));

      // Record in purchase history
      await db.insert(purchaseHistory).values({
        userId: input.userId,
        type: 'premium_subscription',
        amount: SUBSCRIPTION_PRICE * input.months,
        description: `手動有効化 (${input.months}ヶ月) - 管理者: ${ctx.user.name || ctx.user.id}${input.notes ? ` - ${input.notes}` : ''}`,
      });

      // If there's a pending payment link with this link ID, mark it as completed
      if (input.linkId) {
        await db.update(paymentLinks)
          .set({
            status: 'completed',
            completedAt: now,
            provider: 'bank_transfer',
          })
          .where(and(
            eq(paymentLinks.linkId, input.linkId),
            eq(paymentLinks.userId, input.userId)
          ));
      }

      // Notify owner
      await notifyOwner({
        title: "手動プラン有効化",
        content: `ユーザー ${user.name || user.email || user.id} のプレミアムプランを手動で有効化しました。\n期間: ${input.months}ヶ月\n有効期限: ${premiumExpiresAt.toISOString()}\n管理者: ${ctx.user.name || ctx.user.id}${input.notes ? `\nメモ: ${input.notes}` : ''}`,
      });

      return {
        success: true,
        premiumExpiresAt,
        months: input.months,
      };
    }),

  /**
   * Get webhook logs (admin only)
   */
  getWebhookLogs: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const logs = await db.select()
        .from(paymentWebhooks)
        .orderBy(desc(paymentWebhooks.createdAt))
        .limit(input?.limit ?? 50);

      return logs;
    }),
});

/**
 * Process webhook from payment provider
 * This is called from a separate webhook endpoint (not tRPC)
 * 
 * @param provider - Payment provider name (telecom_credit, alpha_note, etc.)
 * @param payload - Raw webhook payload
 * @param sourceIp - IP address of the webhook sender
 * @returns Processing result
 */
export async function processPaymentWebhook(
  provider: 'telecom_credit' | 'alpha_note' | 'bank_transfer' | 'other',
  payload: Record<string, any>,
  sourceIp?: string
): Promise<{ success: boolean; message: string; linkId?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Log the webhook
  await db.insert(paymentWebhooks).values({
    provider,
    payload: JSON.stringify(payload),
    eventType: payload.event_type || payload.eventType || 'payment',
    status: 'received',
    sourceIp: sourceIp || null,
  });

  try {
    // Extract link ID from payload (different providers may use different field names)
    const linkId = payload.order_id || payload.orderId || payload.orderNumber || payload.transaction_id || payload.link_id || payload.linkId;
    
    if (!linkId) {
      // Update webhook status
      await db.update(paymentWebhooks)
        .set({ status: 'failed', errorMessage: "No link ID in payload" })
        .where(eq(paymentWebhooks.id, (await db.select().from(paymentWebhooks).orderBy(desc(paymentWebhooks.id)).limit(1))[0].id));
      return { success: false, message: "No link ID in payload" };
    }

    // Find the payment link
    const linkResult = await db.select()
      .from(paymentLinks)
      .where(eq(paymentLinks.linkId, linkId))
      .limit(1);

    if (!linkResult[0]) {
      await db.update(paymentWebhooks)
        .set({ status: 'failed', errorMessage: "Payment link not found" })
        .where(eq(paymentWebhooks.id, (await db.select().from(paymentWebhooks).orderBy(desc(paymentWebhooks.id)).limit(1))[0].id));
      return { success: false, message: "Payment link not found", linkId };
    }

    const link = linkResult[0];

    // Update webhook with payment link ID
    await db.update(paymentWebhooks)
      .set({ paymentLinkId: link.id })
      .where(eq(paymentWebhooks.id, (await db.select().from(paymentWebhooks).orderBy(desc(paymentWebhooks.id)).limit(1))[0].id));

    // Check if already processed
    if (link.status === 'completed') {
      await db.update(paymentWebhooks)
        .set({ status: 'ignored', errorMessage: "Already processed" })
        .where(eq(paymentWebhooks.id, (await db.select().from(paymentWebhooks).orderBy(desc(paymentWebhooks.id)).limit(1))[0].id));
      return { success: true, message: "Already processed", linkId };
    }

    // Check payment status from payload
    const paymentStatus = payload.status || payload.payment_status || payload.result;
    const isSuccess = ['success', 'completed', 'paid', 'approved', '1', 'OK'].includes(String(paymentStatus).toLowerCase());

    if (!isSuccess) {
      // Mark as failed
      await db.update(paymentLinks)
        .set({ status: 'cancelled', provider })
        .where(eq(paymentLinks.linkId, linkId));

      await db.update(paymentWebhooks)
        .set({ status: 'processed' })
        .where(eq(paymentWebhooks.id, (await db.select().from(paymentWebhooks).orderBy(desc(paymentWebhooks.id)).limit(1))[0].id));

      return { success: false, message: "Payment failed", linkId };
    }

    // Get user
    const userResult = await db.select().from(users).where(eq(users.id, link.userId)).limit(1);
    if (!userResult[0]) {
      await db.update(paymentWebhooks)
        .set({ status: 'failed', errorMessage: "User not found" })
        .where(eq(paymentWebhooks.id, (await db.select().from(paymentWebhooks).orderBy(desc(paymentWebhooks.id)).limit(1))[0].id));
      return { success: false, message: "User not found", linkId };
    }

    const user = userResult[0];
    const now = new Date();

    // Calculate premium expiration (1 month from now or extend existing)
    let premiumExpiresAt: Date;
    if (user.premiumExpiresAt && new Date(user.premiumExpiresAt) > now) {
      premiumExpiresAt = new Date(user.premiumExpiresAt);
    } else {
      premiumExpiresAt = new Date(now);
    }
    premiumExpiresAt.setMonth(premiumExpiresAt.getMonth() + 1);

    // Activate premium plan
    await db.update(users)
      .set({
        planType: 'premium',
        premiumExpiresAt,
        updatedAt: now,
      })
      .where(eq(users.id, link.userId));

    // Update payment link status
    await db.update(paymentLinks)
      .set({
        status: 'completed',
        completedAt: now,
        provider,
        externalPaymentId: payload.transaction_id || payload.transactionId || null,
      })
      .where(eq(paymentLinks.linkId, linkId));

    // Record in purchase history
    await db.insert(purchaseHistory).values({
      userId: link.userId,
      type: 'premium_subscription',
      amount: link.amount,
      description: `月額サブスクリプション (${provider})`,
    });

    // Mark webhook as processed
    await db.update(paymentWebhooks)
      .set({ status: 'processed' })
      .where(eq(paymentWebhooks.id, (await db.select().from(paymentWebhooks).orderBy(desc(paymentWebhooks.id)).limit(1))[0].id));

    // Notify owner
    await notifyOwner({
      title: "新規サブスクリプション決済完了",
      content: `ユーザー ${user.name || user.email || user.id} がサブスクリプションを開始しました。\n金額: ¥${link.amount}\n決済代行: ${provider}\nリンクID: ${linkId}\n有効期限: ${premiumExpiresAt.toISOString()}`,
    });

    return { success: true, message: "Plan activated successfully", linkId };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Update webhook with error
    try {
      await db.update(paymentWebhooks)
        .set({ status: 'failed', errorMessage })
        .where(eq(paymentWebhooks.id, (await db.select().from(paymentWebhooks).orderBy(desc(paymentWebhooks.id)).limit(1))[0].id));
    } catch (e) {
      // Ignore update error
    }

    // Notify owner of error
    await notifyOwner({
      title: "Webhook処理エラー",
      content: `決済Webhookの処理中にエラーが発生しました。\nプロバイダー: ${provider}\nエラー: ${errorMessage}\nペイロード: ${JSON.stringify(payload).substring(0, 500)}`,
    });

    return { success: false, message: errorMessage };
  }
}
