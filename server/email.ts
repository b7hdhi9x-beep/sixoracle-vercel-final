import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq, and, gte, lt } from "drizzle-orm";

/**
 * Email notification templates for the Six Oracle platform.
 * Uses Manus notification service to send notifications to the owner,
 * and logs user notifications for manual follow-up or future email integration.
 */

export interface UserNotification {
  userId: number;
  type: "welcome" | "payment_success" | "subscription_renewed" | "subscription_canceled" | "payment_failed";
  data?: Record<string, unknown>;
}

// Store notifications for users (can be displayed in-app or sent via email when integrated)
const userNotifications: UserNotification[] = [];

/**
 * Send a welcome notification when a user subscribes for the first time
 */
export async function sendWelcomeNotification(userId: number, userName: string, email: string): Promise<void> {
  // Notify owner about new subscriber
  await notifyOwner({
    title: "🎉 新規プレミアム会員登録",
    content: `新しいプレミアム会員が登録しました！\n\nユーザー名: ${userName}\nメール: ${email}\nユーザーID: ${userId}\n\n六神ノ間をご利用いただきありがとうございます。`,
  });

  // Log user notification
  userNotifications.push({
    userId,
    type: "welcome",
    data: { userName, email },
  });

  console.log(`[Email] Welcome notification sent for user ${userId}`);
}

/**
 * Send payment success notification
 */
export async function sendPaymentSuccessNotification(
  userId: number,
  userName: string,
  email: string,
  amount: number,
  currency: string
): Promise<void> {
  const formattedAmount = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);

  // Notify owner about successful payment
  await notifyOwner({
    title: "💰 決済完了通知",
    content: `決済が完了しました。\n\nユーザー名: ${userName}\nメール: ${email}\n金額: ${formattedAmount}\n\nプレミアムプランが有効化されました。`,
  });

  // Log user notification
  userNotifications.push({
    userId,
    type: "payment_success",
    data: { userName, email, amount, currency },
  });

  console.log(`[Email] Payment success notification sent for user ${userId}`);
}

/**
 * Send subscription renewal notification
 */
export async function sendSubscriptionRenewalNotification(
  userId: number,
  nextBillingDate: Date
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0]) return;

  const formattedDate = nextBillingDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Notify owner about renewal
  await notifyOwner({
    title: "🔄 サブスクリプション更新",
    content: `サブスクリプションが更新されました。\n\nユーザー名: ${user[0].name || "未設定"}\nメール: ${user[0].email}\n次回請求日: ${formattedDate}`,
  });

  // Log user notification
  userNotifications.push({
    userId,
    type: "subscription_renewed",
    data: { nextBillingDate: formattedDate },
  });

  console.log(`[Email] Subscription renewal notification sent for user ${userId}`);
}

/**
 * Send subscription canceled notification
 */
export async function sendSubscriptionCanceledNotification(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0]) return;

  // Notify owner about cancellation
  await notifyOwner({
    title: "❌ サブスクリプション解約",
    content: `サブスクリプションが解約されました。\n\nユーザー名: ${user[0].name || "未設定"}\nメール: ${user[0].email}\nユーザーID: ${userId}\n\n解約理由のフォローアップをご検討ください。`,
  });

  // Log user notification
  userNotifications.push({
    userId,
    type: "subscription_canceled",
  });

  console.log(`[Email] Subscription canceled notification sent for user ${userId}`);
}

/**
 * Send payment failed notification
 */
export async function sendPaymentFailedNotification(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0]) return;

  // Notify owner about payment failure
  await notifyOwner({
    title: "⚠️ 決済失敗通知",
    content: `決済が失敗しました。\n\nユーザー名: ${user[0].name || "未設定"}\nメール: ${user[0].email}\nユーザーID: ${userId}\n\nユーザーへの連絡が必要な場合があります。`,
  });

  // Log user notification
  userNotifications.push({
    userId,
    type: "payment_failed",
  });

  console.log(`[Email] Payment failed notification sent for user ${userId}`);
}

/**
 * Send weekly fortune notification to all users who have opted in
 */
export async function sendWeeklyFortuneNotifications(): Promise<{ success: boolean; count: number }> {
  const db = await getDb();
  if (!db) return { success: false, count: 0 };

  // Import emailPreferences and notifications tables
  const { emailPreferences, notifications } = await import("../drizzle/schema");
  
  // Get all users with weekly fortune preference enabled
  const allUsers = await db.select({ id: users.id, name: users.name, email: users.email }).from(users);
  
  // Get users who have opted out
  const optedOut = await db
    .select({ userId: emailPreferences.userId })
    .from(emailPreferences)
    .where(eq(emailPreferences.weeklyFortune, false));
  
  const optedOutIds = new Set(optedOut.map(u => u.userId));
  
  // Filter users who should receive the notification
  const eligibleUsers = allUsers.filter(u => !optedOutIds.has(u.id));
  
  if (eligibleUsers.length === 0) {
    return { success: true, count: 0 };
  }

  // Generate weekly fortune message
  const weekStart = new Date();
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  
  const dateRange = `${weekStart.toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}〜${weekEnd.toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}`;
  
  const title = `🌟 今週の運勢（${dateRange}）`;
  const message = `今週の運勢が届いています。\n六神ノ間の占い師たちが、あなたの一週間を導きます。\nさっそく鑑定を受けてみましょう！`;
  
  // Create notifications for all eligible users
  const notificationValues = eligibleUsers.map(user => ({
    userId: user.id,
    type: "weekly_fortune" as const,
    title,
    message,
    link: "/dashboard",
    isRead: false,
  }));
  
  await db.insert(notifications).values(notificationValues);
  
  // Notify owner about weekly fortune sent
  await notifyOwner({
    title: "📧 週間運勢通知送信完了",
    content: `週間運勢通知を${eligibleUsers.length}人のユーザーに送信しました。\n\n期間: ${dateRange}`,
  });
  
  console.log(`[Email] Weekly fortune notifications sent to ${eligibleUsers.length} users`);
  
  return { success: true, count: eligibleUsers.length };
}

/**
 * Send low readings notification to user and owner
 */
export async function sendLowReadingsNotification(
  userId: number,
  remainingReadings: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0]) return;

  // Notify owner about user running low on readings
  await notifyOwner({
    title: "⚠️ ユーザーの鑑定回数が残りわずか",
    content: `ユーザーの鑑定回数が残りわずかです。\n\nユーザー名: ${user[0].name || "未設定"}
メール: ${user[0].email || "未設定"}
残り回数: ${remainingReadings}回\n\n回数回復やプレミアムへのアップグレードを促すチャンスです。`,
  });

  console.log(`[Email] Low readings notification sent for user ${userId} (${remainingReadings} remaining)`);
}

/**
 * Get pending notifications for a user (for in-app display)
 */
export function getUserNotifications(userId: number): UserNotification[] {
  return userNotifications.filter((n) => n.userId === userId);
}

/**
 * Clear notifications for a user after they've been displayed
 */
export function clearUserNotifications(userId: number): void {
  const index = userNotifications.findIndex((n) => n.userId === userId);
  while (index !== -1) {
    userNotifications.splice(index, 1);
  }
}


/**
 * Send bank transfer request notification to user and owner
 */
export async function sendBankTransferRequestNotification(params: {
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  planType?: "monthly" | "yearly";
}): Promise<void> {
  const { userId, userName, userEmail, amount, planType = "monthly" } = params;
  const planName = planType === "yearly" ? "年間プラン（¥19,800/年）" : "月額プラン（¥1,980/月）";
  const durationDays = planType === "yearly" ? 365 : 30;
  const formattedAmount = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(amount);

  // Bank account info
  const bankInfo = {
    bankName: "楽天銀行",
    branchName: "エンカ支店",
    accountType: "普通",
    accountNumber: "1479015",
    accountHolder: "タケベケイサク",
  };

  // Notify owner about new bank transfer request with urgency indicator
  const urgencyEmoji = planType === "yearly" ? "🌟" : "💳";
  await notifyOwner({
    title: `${urgencyEmoji} 新規振込申請がありました！`,
    content: `【新規振込申請】

■ お客様情報
・お名前: ${userName}
・メール: ${userEmail}
・ユーザーID: ${userId}

■ 申請内容
・プラン: ${planName}
・金額: ${formattedAmount}
・有効期間: ${durationDays}日間

■ 対応が必要です
振込確認後、管理画面「振込申請管理」から合言葉を発行してください。`,
  });

  // Create in-app notification for user
  const db = await getDb();
  if (db) {
    const { notifications } = await import("../drizzle/schema");
    await db.insert(notifications).values({
      userId,
      type: "payment" as const,
      title: "📧 振込申請を受け付けました",
      message: `${userName}様

${planName}の振込申請を受け付けました。
以下の口座に${formattedAmount}をお振込みください。

【プラン内容】
${planName}（有効期間: ${durationDays}日間）

【振込先口座】
銀行名: ${bankInfo.bankName}
支店名: ${bankInfo.branchName}
口座種別: ${bankInfo.accountType}
口座番号: ${bankInfo.accountNumber}
口座名義: ${bankInfo.accountHolder}

振込確認後、合言葉（アクティベーションコード）をメールでお送りいたします。
通常1〜2営業日以内にご連絡いたします。

※振込手数料はお客様のご負担となります。
※お振込み名義は申請時のお名前と同一にしてください。`,
      link: "/subscription",
      isRead: false,
    });
  }

  console.log(`[Email] Bank transfer request notification sent for user ${userId}`);
}

/**
 * Send activation code notification to user when bank transfer is confirmed
 */
export async function sendActivationCodeNotification(params: {
  userId: number;
  userName: string;
  userEmail: string;
  activationCode: string;
  durationDays: number;
  planType?: "monthly" | "yearly";
}): Promise<void> {
  const { userId, userName, userEmail, activationCode, durationDays, planType = "monthly" } = params;
  const planName = planType === "yearly" ? "年間プラン" : "月額プラン";

  // Notify owner about activation code sent
  await notifyOwner({
    title: "✅ 合言葉発行完了",
    content: `合言葉を発行しました。

お客様名: ${userName}
メールアドレス: ${userEmail}
合言葉: ${activationCode}
プラン: ${planName}
有効期間: ${durationDays}日間
ユーザーID: ${userId}

ユーザーに通知が送信されました。`,
  });

  // Create in-app notification for user
  const db = await getDb();
  if (db) {
    const { notifications } = await import("../drizzle/schema");
    await db.insert(notifications).values({
      userId,
      type: "payment" as const,
      title: "🎉 合言葉が届きました！",
      message: `${userName}様

お振込みの確認が取れました。ありがとうございます！

【お申込みプラン】
${planName}（${durationDays}日間）

【合言葉（アクティベーションコード）】
${activationCode}

上記の合言葉を「プレミアムプラン」ページで入力すると、
${durationDays}日間のプレミアムプランが有効になります。

【有効化の手順】
1. 「プレミアムプラン」ページにアクセス
2. 「合言葉を入力」ボタンをクリック
3. 上記の合言葉を入力
4. 「有効化」ボタンをクリック

※合言葉の有効期限は発行から7日間です。
※ご不明な点がございましたら、お問い合わせください。

六神ノ間をご利用いただきありがとうございます。`,
      link: "/subscription",
      isRead: false,
    });
  }

  console.log(`[Email] Activation code notification sent for user ${userId}`);
}


/**
 * Send subscription renewal reminder notification (3 days before expiration)
 */
export async function sendRenewalReminderNotification(params: {
  userId: number;
  userName: string;
  userEmail: string;
  expiresAt: Date;
  planType: "monthly" | "yearly";
}): Promise<void> {
  const { userId, userName, userEmail, expiresAt, planType } = params;
  
  const formattedDate = expiresAt.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const planName = planType === "yearly" ? "年間プラン" : "月額プラン";
  const renewalAmount = planType === "yearly" ? "¥19,800" : "¥1,980";
  
  // Bank account info
  const bankInfo = {
    bankName: "楽天銀行",
    branchName: "エンカ支店",
    accountType: "普通",
    accountNumber: "1479015",
    accountHolder: "タケベケイサク",
  };

  // Notify owner about upcoming expiration
  await notifyOwner({
    title: "⏰ プレミアム有効期限間近",
    content: `プレミアム会員の有効期限が近づいています。

お客様名: ${userName}
メールアドレス: ${userEmail}
現在のプラン: ${planName}
有効期限: ${formattedDate}
ユーザーID: ${userId}

継続のご案内が送信されました。`,
  });

  // Create in-app notification for user
  const db = await getDb();
  if (db) {
    const { notifications } = await import("../drizzle/schema");
    await db.insert(notifications).values({
      userId,
      type: "payment" as const,
      title: "⏰ プレミアムプランの継続確認",
      message: `${userName}様

いつも六神ノ間をご利用いただきありがとうございます。

ご利用中の${planName}の有効期限が近づいております。

【有効期限】
${formattedDate}

継続をご希望の場合は、以下の口座にお振込みください。

【振込先口座】
銀行名: ${bankInfo.bankName}
支店名: ${bankInfo.branchName}
口座種別: ${bankInfo.accountType}
口座番号: ${bankInfo.accountNumber}
口座名義: ${bankInfo.accountHolder}

【継続料金】
${planName}: ${renewalAmount}

振込確認後、新しい合言葉をお送りいたします。
継続手続きは「プレミアムプラン」ページからも行えます。

※有効期限を過ぎると、プレミアム機能がご利用いただけなくなります。
※鑑定履歴は保持されますので、再開時にそのままご利用いただけます。

今後とも六神ノ間をよろしくお願いいたします。`,
      link: "/subscription",
      isRead: false,
    });
  }

  console.log(`[Email] Renewal reminder notification sent for user ${userId}`);
}

/**
 * Check and send renewal reminders for users expiring in 3 days
 */
export async function checkAndSendRenewalReminders(): Promise<{ success: boolean; count: number }> {
  const db = await getDb();
  if (!db) return { success: false, count: 0 };

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const fourDaysFromNow = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

  // Find users with premium expiring in 3 days (between 3 and 4 days from now)
  const expiringUsers = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.planType, "premium"),
        gte(users.premiumExpiresAt, threeDaysFromNow),
        lt(users.premiumExpiresAt, fourDaysFromNow)
      )
    );

  let sentCount = 0;
  for (const user of expiringUsers) {
    if (user.premiumExpiresAt) {
      // Determine plan type based on duration (if more than 60 days remaining when set, it was yearly)
      const planType = "monthly" as const; // Default to monthly for now
      
      await sendRenewalReminderNotification({
        userId: user.id,
        userName: user.name || "お客様",
        userEmail: user.email || "",
        expiresAt: user.premiumExpiresAt,
        planType,
      });
      sentCount++;
    }
  }

  if (sentCount > 0) {
    await notifyOwner({
      title: "📧 継続確認通知送信完了",
      content: `${sentCount}人のユーザーに継続確認通知を送信しました。`,
    });
  }

  console.log(`[Email] Renewal reminders sent to ${sentCount} users`);
  return { success: true, count: sentCount };
}


/**
 * Send activation code expiration warning to admin
 * Notifies admin about codes expiring in 2 days
 */
export async function sendActivationCodeExpirationWarning(params: {
  code: string;
  customerEmail?: string;
  customerName?: string;
  expiresAt: Date;
  planType: "monthly" | "yearly";
}): Promise<void> {
  const { code, customerEmail, customerName, expiresAt, planType } = params;
  
  const formattedDate = expiresAt.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  
  const planName = planType === "yearly" ? "年間プラン" : "月額プラン";
  
  await notifyOwner({
    title: "⚠️ 合言葉の有効期限が近づいています",
    content: `発行済み合言葉の有効期限が近づいています。

【合言葉情報】
・コード: ${code}
・プラン: ${planName}
・有効期限: ${formattedDate}
${customerName ? `・お客様名: ${customerName}` : ""}
${customerEmail ? `・メールアドレス: ${customerEmail}` : ""}

お客様がまだ合言葉を使用されていない場合は、リマインドのご連絡をお願いします。`,
  });
  
  console.log(`[Email] Activation code expiration warning sent for code ${code}`);
}

/**
 * Check and send expiration warnings for activation codes expiring in 2 days
 */
export async function checkAndSendActivationCodeExpirationWarnings(): Promise<{ success: boolean; count: number }> {
  const db = await getDb();
  if (!db) return { success: false, count: 0 };

  const { activationCodes } = await import("../drizzle/schema");
  
  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Find codes expiring in 2 days (between 2 and 3 days from now)
  const expiringCodes = await db
    .select()
    .from(activationCodes)
    .where(
      and(
        eq(activationCodes.status, "pending"),
        gte(activationCodes.expiresAt, twoDaysFromNow),
        lt(activationCodes.expiresAt, threeDaysFromNow)
      )
    );

  let sentCount = 0;
  for (const code of expiringCodes) {
    if (code.expiresAt) {
      await sendActivationCodeExpirationWarning({
        code: code.code,
        customerEmail: code.customerEmail || undefined,
        customerName: code.customerName || undefined,
        expiresAt: code.expiresAt,
        planType: code.planType as "monthly" | "yearly",
      });
      sentCount++;
    }
  }

  if (sentCount > 0) {
    await notifyOwner({
      title: "📧 合言葉有効期限通知送信完了",
      content: `${sentCount}件の合言葉の有効期限通知を送信しました。`,
    });
  }

  console.log(`[Email] Activation code expiration warnings sent for ${sentCount} codes`);
  return { success: true, count: sentCount };
}


/**
 * Send referral reward notification to the referrer
 */
export async function sendReferralRewardNotification(
  referrerId: number,
  referrerName: string,
  referrerEmail: string | null,
  referredUserName: string,
  rewardAmount: number
): Promise<void> {
  // Notify owner about the reward
  await notifyOwner({
    title: "💰 紹介報酬発生通知",
    content: `紹介報酬が発生しました！\n\n紹介者: ${referrerName} (ID: ${referrerId})\nメール: ${referrerEmail || "未設定"}\n被紹介者: ${referredUserName}\n報酬額: ¥${rewardAmount.toLocaleString()}\n\n紹介報酬は管理画面から承認後、出金申請が可能になります。`,
  });

  // Log user notification
  userNotifications.push({
    userId: referrerId,
    type: "payment_success", // Using existing type for now
    data: { 
      notificationType: "referral_reward",
      referredUserName, 
      rewardAmount 
    },
  });

  console.log(`[Email] Referral reward notification sent for user ${referrerId}`);
}

/**
 * Send payout completed notification to the user
 */
export async function sendPayoutCompletedNotification(
  userId: number,
  userName: string,
  userEmail: string | null,
  payoutAmount: number,
  transferFee: number,
  actualTransferAmount: number,
  bankName: string,
  accountNumber: string
): Promise<void> {
  // Notify owner about the payout
  await notifyOwner({
    title: "💸 出金処理完了通知",
    content: `出金処理が完了しました。\n\nユーザー: ${userName} (ID: ${userId})\nメール: ${userEmail || "未設定"}\n出金申請額: ¥${payoutAmount.toLocaleString()}\n振込手数料: ¥${transferFee.toLocaleString()}\n実際の振込額: ¥${actualTransferAmount.toLocaleString()}\n振込先: ${bankName} ****${accountNumber.slice(-4)}\n\nユーザーへの振込処理を完了してください。`,
  });

  // Log user notification
  userNotifications.push({
    userId,
    type: "payment_success", // Using existing type for now
    data: { 
      notificationType: "payout_completed",
      payoutAmount, 
      transferFee,
      actualTransferAmount,
      bankName 
    },
  });

  console.log(`[Email] Payout completed notification sent for user ${userId}`);
}

/**
 * Send payout rejected notification to the user
 */
export async function sendPayoutRejectedNotification(
  userId: number,
  userName: string,
  userEmail: string | null,
  payoutAmount: number,
  reason: string
): Promise<void> {
  // Notify owner about the rejection
  await notifyOwner({
    title: "❌ 出金申請却下通知",
    content: `出金申請が却下されました。\n\nユーザー: ${userName} (ID: ${userId})\nメール: ${userEmail || "未設定"}\n申請額: ¥${payoutAmount.toLocaleString()}\n却下理由: ${reason}\n\nユーザーの報酬残高は元に戻されました。`,
  });

  // Log user notification
  userNotifications.push({
    userId,
    type: "payment_failed", // Using existing type for now
    data: { 
      notificationType: "payout_rejected",
      payoutAmount, 
      reason 
    },
  });

  console.log(`[Email] Payout rejected notification sent for user ${userId}`);
}


/**
 * Send reward notification email to user
 * Used for referral rewards and continuation bonuses
 */
export async function sendRewardNotificationEmail(
  email: string,
  userName: string,
  amount: number,
  rewardType: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const { notifications } = await import("../drizzle/schema");
  
  // Find user by email
  const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = userResult[0];
  
  if (!user) {
    console.warn(`[Email] User not found for email: ${email}`);
    return;
  }

  // Create in-app notification
  await db.insert(notifications).values({
    userId: user.id,
    type: "referral" as const,
    title: `🎉 ${rewardType}を獲得しました！`,
    message: `${userName}様、おめでとうございます！\n\n${rewardType}として${amount.toLocaleString()}円を獲得しました。\n\n報酬は「紹介報酬」ページから出金申請できます。`,
    link: "/rewards",
    isRead: false,
  });

  // Notify owner
  await notifyOwner({
    title: `💰 報酬付与: ${userName}`,
    content: `${rewardType}を付与しました。\n\nユーザー: ${userName}\nメール: ${email}\n金額: ¥${amount.toLocaleString()}`,
  });

  console.log(`[Email] Reward notification sent for user ${user.id}: ${rewardType} ¥${amount}`);
}


/**
 * Send plan activated notification when admin directly activates user's premium plan
 * (without activation code - one-click activation after bank transfer confirmation)
 */
export async function sendPlanActivatedNotification(params: {
  userId: number;
  userName: string;
  userEmail: string;
  durationDays: number;
  expiresAt: Date;
}): Promise<void> {
  const { userId, userName, userEmail, durationDays, expiresAt } = params;
  
  const formattedDate = expiresAt.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Notify owner about the activation
  await notifyOwner({
    title: "✅ プレミアムプラン直接有効化",
    content: `振込確認後、プレミアムプランを直接有効化しました。

お客様名: ${userName}
メールアドレス: ${userEmail}
有効期間: ${durationDays}日間
有効期限: ${formattedDate}
ユーザーID: ${userId}

合言葉なしでプランが有効化されました。`,
  });

  // Create in-app notification for user
  const db = await getDb();
  if (db) {
    const { notifications } = await import("../drizzle/schema");
    await db.insert(notifications).values({
      userId,
      type: "payment" as const,
      title: "🎉 プレミアムプランが有効になりました！",
      message: `${userName}様

お振込みを確認いたしました。
プレミアムプランが有効になりました！

【プラン詳細】
有効期間: ${durationDays}日間
有効期限: ${formattedDate}

すべての占い師への相談が無制限でご利用いただけます。
六神ノ間をお楽しみください！

今後ともよろしくお願いいたします。`,
      link: "/dashboard",
      isRead: false,
    });
  }

  console.log(`[Email] Plan activated notification sent for user ${userId}`);
}


/**
 * Send withdrawal completed notification to user
 * Notifies user when their withdrawal request has been completed
 */
export async function sendWithdrawalCompletedNotification(params: {
  userId: number;
  userName: string;
  userEmail: string | null;
  amount: number;
  bankName: string;
  accountNumber: string;
  scheduledTransferDate?: string | null;
}): Promise<void> {
  const { userId, userName, userEmail, amount, bankName, accountNumber, scheduledTransferDate } = params;
  
  const formattedAmount = `¥${amount.toLocaleString()}`;
  const maskedAccount = `****${accountNumber.slice(-4)}`;
  
  // Notify owner about the completed withdrawal
  await notifyOwner({
    title: "✅ 出金処理完了",
    content: `出金処理が完了しました。

■ ユーザー情報
・お名前: ${userName}
・メール: ${userEmail || "未設定"}
・ユーザーID: ${userId}

■ 出金内容
・金額: ${formattedAmount}
・振込先: ${bankName} ${maskedAccount}
${scheduledTransferDate ? `・振込予定日: ${scheduledTransferDate}` : ""}

ユーザーへ完了通知が送信されました。`,
  });

  // Create in-app notification for user
  const db = await getDb();
  if (db) {
    const { notifications } = await import("../drizzle/schema");
    
    let message = `${userName}様

出金申請が完了いたしました。

【出金内容】
・金額: ${formattedAmount}
・振込先: ${bankName} ${maskedAccount}`;

    if (scheduledTransferDate) {
      message += `
・振込予定日: ${scheduledTransferDate}`;
    }

    message += `

振込は上記の予定日に実施されます。
着金までに1〜2営業日かかる場合がございます。

ご不明な点がございましたら、お問い合わせください。

六神ノ間をご利用いただきありがとうございます。`;

    await db.insert(notifications).values({
      userId,
      type: "withdrawal" as const,
      title: "💸 出金完了のお知らせ",
      message,
      link: "/withdrawal",
      isRead: false,
    });
  }

  console.log(`[Email] Withdrawal completed notification sent for user ${userId}: ${formattedAmount}`);
}

/**
 * Send withdrawal approved notification to user
 * Notifies user when their withdrawal request has been approved and scheduled
 */
export async function sendWithdrawalApprovedNotification(params: {
  userId: number;
  userName: string;
  userEmail: string | null;
  amount: number;
  bankName: string;
  accountNumber: string;
  scheduledTransferDate?: string | null;
}): Promise<void> {
  const { userId, userName, userEmail, amount, bankName, accountNumber, scheduledTransferDate } = params;
  
  const formattedAmount = `¥${amount.toLocaleString()}`;
  const maskedAccount = `****${accountNumber.slice(-4)}`;
  
  // Notify owner about the approved withdrawal
  await notifyOwner({
    title: "📋 出金申請承認",
    content: `出金申請を承認しました。

■ ユーザー情報
・お名前: ${userName}
・メール: ${userEmail || "未設定"}
・ユーザーID: ${userId}

■ 出金内容
・金額: ${formattedAmount}
・振込先: ${bankName} ${maskedAccount}
${scheduledTransferDate ? `・振込予定日: ${scheduledTransferDate}` : ""}

振込処理をお願いします。`,
  });

  // Create in-app notification for user
  const db = await getDb();
  if (db) {
    const { notifications } = await import("../drizzle/schema");
    
    let message = `${userName}様

出金申請が承認されました。

【出金内容】
・金額: ${formattedAmount}
・振込先: ${bankName} ${maskedAccount}`;

    if (scheduledTransferDate) {
      message += `
・振込予定日: ${scheduledTransferDate}

上記の日程で振込を実施いたします。`;
    } else {
      message += `

近日中に振込を実施いたします。`;
    }

    message += `

振込完了後、改めてお知らせいたします。

六神ノ間をご利用いただきありがとうございます。`;

    await db.insert(notifications).values({
      userId,
      type: "withdrawal" as const,
      title: "✅ 出金申請が承認されました",
      message,
      link: "/withdrawal",
      isRead: false,
    });
  }

  console.log(`[Email] Withdrawal approved notification sent for user ${userId}: ${formattedAmount}`);
}


/**
 * Send notification to owner about pending withdrawal requests
 * Notifies owner when there are withdrawal requests pending for more than 3 days
 */
export async function notifyPendingWithdrawalRequests(): Promise<{ success: boolean; count: number }> {
  const db = await getDb();
  if (!db) return { success: false, count: 0 };

  const { withdrawalRequests, users: usersTable } = await import("../drizzle/schema");
  
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  // Find pending withdrawal requests older than 3 days
  const pendingRequests = await db
    .select({
      id: withdrawalRequests.id,
      userId: withdrawalRequests.userId,
      amount: withdrawalRequests.amount,
      createdAt: withdrawalRequests.createdAt,
      bankName: withdrawalRequests.bankName,
      userName: usersTable.name,
      userEmail: usersTable.email,
    })
    .from(withdrawalRequests)
    .leftJoin(usersTable, eq(withdrawalRequests.userId, usersTable.id))
    .where(
      and(
        eq(withdrawalRequests.status, "pending"),
        lt(withdrawalRequests.createdAt, threeDaysAgo)
      )
    );

  if (pendingRequests.length === 0) {
    console.log("[Email] No pending withdrawal requests older than 3 days");
    return { success: true, count: 0 };
  }

  // Calculate total pending amount
  const totalAmount = pendingRequests.reduce((sum, req) => sum + req.amount, 0);

  // Build request list
  const requestList = pendingRequests.map((req) => {
    const daysAgo = Math.floor((now.getTime() - new Date(req.createdAt).getTime()) / (24 * 60 * 60 * 1000));
    return `・${req.userName || "不明"} (ID: ${req.userId}) - ¥${req.amount.toLocaleString()} - ${daysAgo}日前`;
  }).join("\n");

  // Notify owner
  await notifyOwner({
    title: `⚠️ 未処理の出金申請があります（${pendingRequests.length}件）`,
    content: `3日以上経過した未処理の出金申請があります。

【未処理件数】${pendingRequests.length}件
【合計金額】¥${totalAmount.toLocaleString()}

【申請一覧】
${requestList}

管理画面「出金申請管理」から処理をお願いします。`,
  });

  console.log(`[Email] Pending withdrawal notification sent: ${pendingRequests.length} requests`);
  return { success: true, count: pendingRequests.length };
}

/**
 * Check and notify about pending withdrawal requests
 * Should be called daily as part of batch processing
 */
export async function checkPendingWithdrawals(): Promise<{ success: boolean; count: number }> {
  return await notifyPendingWithdrawalRequests();
}


/**
 * Send notification to referrer when their referred user reaches 3-month milestone
 * This triggers the referral reward confirmation
 */
export async function sendReferralMilestoneNotification(params: {
  referrerId: number;
  referrerName: string;
  referrerEmail: string | null;
  referredUserId: number;
  referredUserName: string;
  referrerRewardAmount: number;
  referredRewardAmount: number;
}): Promise<void> {
  const { 
    referrerId, 
    referrerName, 
    referrerEmail, 
    referredUserId,
    referredUserName, 
    referrerRewardAmount,
    referredRewardAmount 
  } = params;
  
  const formattedReferrerReward = `¥${referrerRewardAmount.toLocaleString()}`;
  const formattedReferredReward = `¥${referredRewardAmount.toLocaleString()}`;
  
  // Notify owner about the milestone achievement
  await notifyOwner({
    title: "🎉 紹介報酬確定通知",
    content: `被紹介者が3ヶ月継続を達成し、紹介報酬が確定しました！

■ 紹介者情報
・お名前: ${referrerName}
・メール: ${referrerEmail || "未設定"}
・ユーザーID: ${referrerId}
・報酬額: ${formattedReferrerReward}

■ 被紹介者情報
・お名前: ${referredUserName}
・ユーザーID: ${referredUserId}
・報酬額: ${formattedReferredReward}

両者の報酬が確定しました。出金申請が可能になります。`,
  });

  // Create in-app notification for referrer
  const db = await getDb();
  if (db) {
    const { notifications } = await import("../drizzle/schema");
    
    await db.insert(notifications).values({
      userId: referrerId,
      type: "referral" as const,
      title: "🎉 紹介報酬が確定しました！",
      message: `${referrerName}様

おめでとうございます！
あなたが紹介した${referredUserName}さんが3ヶ月継続を達成しました！

【報酬確定】
・紹介報酬: ${formattedReferrerReward}

この報酬は「紹介報酬」ページから出金申請できます。

引き続き友達紹介キャンペーンをご活用ください！
紹介すればするほど、報酬が増えます！

六神ノ間をご利用いただきありがとうございます。`,
      link: "/referral",
      isRead: false,
    });

    // Also notify the referred user about their reward
    await db.insert(notifications).values({
      userId: referredUserId,
      type: "referral" as const,
      title: "🎉 3ヶ月継続達成！報酬が確定しました！",
      message: `${referredUserName}様

おめでとうございます！
3ヶ月継続を達成しました！

【報酬確定】
・紹介特典報酬: ${formattedReferredReward}

この報酬は「紹介報酬」ページから出金申請できます。

これからも六神ノ間をお楽しみください！

六神ノ間をご利用いただきありがとうございます。`,
      link: "/referral",
      isRead: false,
    });
  }

  console.log(`[Email] Referral milestone notification sent: referrer ${referrerId}, referred ${referredUserId}`);
}
