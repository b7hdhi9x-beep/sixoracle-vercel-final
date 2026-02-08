import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isPremium: boolean("isPremium").default(false).notNull(),
  // Plan type: trial (トライアル3往復/占い師), standard (¥980/月・10回/日), premium (¥1,980/月・無制限)
  // Note: 'free', 'premium_unlimited' are kept for backward compatibility
  planType: mysqlEnum("planType", ["free", "trial", "standard", "premium_unlimited", "premium"]).default("trial").notNull(),
  // Daily usage limit (standard: 10/day, premium: unlimited, resets at midnight)
  dailyReadingLimit: int("dailyReadingLimit").default(10).notNull(),
  dailyReadingsUsed: int("dailyReadingsUsed").default(0).notNull(),
  lastDailyReset: date("lastDailyReset"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "canceled", "past_due", "none"]).default("none").notNull(),
  // Premium expiration date (for 1-month subscription cycle)
  premiumExpiresAt: timestamp("premiumExpiresAt"),
  // Renewal reminder sent flag
  renewalReminderSent: boolean("renewalReminderSent").default(false).notNull(),
  // Trial readings tracking (2-3 exchanges per oracle)
  trialExchangesUsed: int("trialExchangesUsed").default(0).notNull(), // Used trial exchanges (max 3 per oracle)
  // Legacy fields (kept for backward compatibility, no longer used for new users)
  totalFreeReadings: int("totalFreeReadings").default(0).notNull(), // Deprecated
  usedFreeReadings: int("usedFreeReadings").default(0).notNull(), // Deprecated
  bonusReadings: int("bonusReadings").default(0).notNull(), // Bonus readings from referrals (still used)
  purchasedReadings: int("purchasedReadings").default(0).notNull(), // Deprecated
  // Selected oracle for free users (only one allowed)
  selectedOracleId: varchar("selectedOracleId", { length: 50 }),
  // Additional oracles purchased by free users (JSON array of oracle IDs)
  // First additional oracle is free, subsequent ones cost 300円 each
  purchasedOracleIds: text("purchasedOracleIds"), // JSON array: ["shion", "seiran"]
  // First reading recovery purchase flag (for ¥200 campaign)
  hasUsedFirstRecoveryDiscount: boolean("hasUsedFirstRecoveryDiscount").default(false).notNull(),
  // Subscription start date for continuous months calculation
  subscriptionStartDate: timestamp("subscriptionStartDate"),
  // Continuous subscription months (updated monthly)
  continuousMonths: int("continuousMonths").default(0).notNull(),
  // Unlocked benefits based on continuous months (JSON array)
  // Benefits: "detailed_reading" (3mo), "bonus_oracle" (6mo), "all_oracles" (12mo), "vip_badge" (12mo)
  unlockedBenefits: text("unlockedBenefits"),
  // Profile fields
  displayName: varchar("displayName", { length: 100 }),
  birthDate: date("birthDate"),
  zodiacSign: varchar("zodiacSign", { length: 20 }),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  // User-editable nickname and personal memo
  nickname: varchar("nickname", { length: 50 }),
  memo: text("memo"),
  // Tester flag for beta testers who can use premium features for free
  isTester: boolean("isTester").default(false).notNull(),
  // Session token for preventing duplicate logins (only the latest token is valid)
  currentSessionToken: varchar("currentSessionToken", { length: 64 }),
  // Last login timestamp and device info for security
  lastLoginAt: timestamp("lastLoginAt"),
  lastLoginDevice: text("lastLoginDevice"),
  // Auto-archive settings
  autoArchiveEnabled: boolean("autoArchiveEnabled").default(false).notNull(),
  autoArchiveDays: int("autoArchiveDays").default(30).notNull(), // Archive sessions older than X days
  // Block/suspension fields
  isBlocked: boolean("isBlocked").default(false).notNull(),
  blockReason: mysqlEnum("blockReason", ["bot_detected", "rate_limit_abuse", "manual_block", "terms_violation", "other"]),
  blockedAt: timestamp("blockedAt"),
  blockedBy: int("blockedBy"), // Admin user ID who blocked this user (null for auto-block)
  blockNote: text("blockNote"), // Additional notes about the block
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Chat sessions table for grouping conversations
 */
export const chatSessions = mysqlTable("chat_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  oracleId: varchar("oracleId", { length: 50 }).notNull(),
  title: varchar("title", { length: 200 }),
  // AI-generated summary of the reading (3 lines, in oracle's voice)
  summary: text("summary"),
  // Character-style one-liner for list display
  characterQuote: varchar("characterQuote", { length: 200 }),
  // Category of the consultation (auto-detected by AI)
  category: mysqlEnum("category", ["love", "work", "health", "money", "relationships", "future", "spiritual", "other"]),
  // Whether the session is complete (has a summary)
  isComplete: boolean("isComplete").default(false).notNull(),
  // Pinned sessions appear at the top of the list
  isPinned: boolean("isPinned").default(false).notNull(),
  // Archived sessions are hidden from the main list
  isArchived: boolean("isArchived").default(false).notNull(),
  // Soft delete fields - data is retained for crime prevention purposes
  isDeleted: boolean("isDeleted").default(false).notNull(),
  deletedAt: timestamp("deletedAt"),
  deletedReason: varchar("deletedReason", { length: 500 }),
  // Admin restore tracking
  restoredAt: timestamp("restoredAt"),
  restoredByAdminId: int("restoredByAdminId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

/**
 * Chat messages table for storing individual messages
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  userId: int("userId").notNull(),
  oracleId: varchar("oracleId", { length: 50 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  // Palm image URL for Shion's palm reading (optional)
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Chat logs table for storing conversation history (legacy)
 */
export const chatLogs = mysqlTable("chat_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  oracleId: varchar("oracleId", { length: 50 }).notNull(),
  userMessage: text("userMessage").notNull(),
  assistantResponse: text("assistantResponse").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatLog = typeof chatLogs.$inferSelect;
export type InsertChatLog = typeof chatLogs.$inferInsert;

/**
 * Daily usage tracking for rate limiting
 */
export const dailyUsage = mysqlTable("daily_usage", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  usageDate: date("usageDate").notNull(),
  count: int("count").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyUsage = typeof dailyUsage.$inferSelect;
export type InsertDailyUsage = typeof dailyUsage.$inferInsert;

/**
 * Cancellation feedback for retention analytics
 */
export const cancellationFeedback = mysqlTable("cancellation_feedback", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  reason: mysqlEnum("reason", ["price", "not_useful", "not_accurate", "found_alternative", "temporary", "other"]).notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CancellationFeedback = typeof cancellationFeedback.$inferSelect;
export type InsertCancellationFeedback = typeof cancellationFeedback.$inferInsert;

/**
 * In-app notifications for users
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["new_oracle", "weekly_fortune", "payment", "system", "campaign", "referral", "withdrawal", "consultation_followup", "monthly_fortune", "daily_fortune", "oracle_message"]).notNull(),
  // Optional metadata for followup notifications (JSON)
  metadata: text("metadata"),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  link: varchar("link", { length: 500 }),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Push notification subscriptions (Web Push)
 */
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/**
 * Email notification preferences
 */
export const emailPreferences = mysqlTable("email_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  weeklyFortune: boolean("weeklyFortune").default(true).notNull(),
  dailyFortune: boolean("dailyFortune").default(false).notNull(), // Daily fortune notifications (opt-in)
  monthlyFortune: boolean("monthlyFortune").default(true).notNull(), // Monthly fortune notifications
  consultationFollowup: boolean("consultationFollowup").default(true).notNull(), // Consultation followup notifications
  newOracle: boolean("newOracle").default(true).notNull(),
  campaign: boolean("campaign").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailPreference = typeof emailPreferences.$inferSelect;
export type InsertEmailPreference = typeof emailPreferences.$inferInsert;

/**
 * Contact inquiries from users
 */
export const contactInquiries = mysqlTable("contact_inquiries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  category: mysqlEnum("category", ["general", "payment", "subscription", "technical", "feedback", "other"]).notNull(),
  message: text("message").notNull(),
  messageTranslated: text("messageTranslated"),
  language: varchar("language", { length: 10 }).notNull(),
  status: mysqlEnum("status", ["new", "in_progress", "resolved", "closed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContactInquiry = typeof contactInquiries.$inferSelect;
export type InsertContactInquiry = typeof contactInquiries.$inferInsert;

/**
 * Contact inquiry replies from admin
 */
export const contactReplies = mysqlTable("contact_replies", {
  id: int("id").autoincrement().primaryKey(),
  inquiryId: int("inquiryId").notNull(),
  adminId: int("adminId").notNull(),
  message: text("message").notNull(),
  messageTranslated: text("messageTranslated"),
  language: varchar("language", { length: 10 }).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});

export type ContactReply = typeof contactReplies.$inferSelect;
export type InsertContactReply = typeof contactReplies.$inferInsert;


/**
 * Feedback/Review box for service improvement
 */
export const feedbackBox = mysqlTable("feedback_box", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // Nullable for anonymous feedback
  userName: varchar("userName", { length: 200 }).notNull(),
  category: mysqlEnum("category", ["praise", "suggestion", "bug_report", "feature_request", "other"]).notNull(),
  message: text("message").notNull(),
  messageTranslated: text("messageTranslated"),
  language: varchar("language", { length: 10 }).notNull(),
  rating: int("rating"), // 1-5 stars (optional)
  isPublic: boolean("isPublic").default(true).notNull(), // Whether to show publicly
  isApproved: boolean("isApproved").default(false).notNull(), // Admin approval for public display
  isFlagged: boolean("isFlagged").default(false).notNull(), // Flagged for review
  adminNote: text("adminNote"), // Admin's internal note
  status: mysqlEnum("status", ["pending", "approved", "rejected", "hidden"]).default("pending").notNull(),
  // Submitter tracking info (visible only to admin)
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  userAgent: text("userAgent"), // Browser/device info
  // Bug report specific fields
  deviceInfo: text("deviceInfo"), // Device/browser info for bug reports
  stepsToReproduce: text("stepsToReproduce"), // Steps to reproduce the bug
  expectedBehavior: text("expectedBehavior"), // What should happen
  actualBehavior: text("actualBehavior"), // What actually happened
  screenshotUrl: text("screenshotUrl"), // Screenshot URL for bug reports
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  isFromTester: boolean("isFromTester").default(false).notNull(), // Whether submitted by a tester
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeedbackBox = typeof feedbackBox.$inferSelect;
export type InsertFeedbackBox = typeof feedbackBox.$inferInsert;


/**
 * Blocked users/IPs for feedback box
 */
export const feedbackBlockList = mysqlTable("feedback_block_list", {
  id: int("id").autoincrement().primaryKey(),
  blockType: mysqlEnum("blockType", ["ip", "user"]).notNull(),
  blockValue: varchar("blockValue", { length: 255 }).notNull(), // IP address or user ID
  reason: text("reason"), // Reason for blocking
  blockedBy: int("blockedBy").notNull(), // Admin user ID who blocked
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"), // Optional expiration date
});

export type FeedbackBlockList = typeof feedbackBlockList.$inferSelect;
export type InsertFeedbackBlockList = typeof feedbackBlockList.$inferInsert;

/**
 * Admin replies to feedback
 */
export const feedbackReplies = mysqlTable("feedback_replies", {
  id: int("id").autoincrement().primaryKey(),
  feedbackId: int("feedbackId").notNull(), // Reference to feedback_box.id
  adminId: int("adminId").notNull(), // Admin user ID who replied
  adminName: varchar("adminName", { length: 200 }).notNull(),
  message: text("message").notNull(),
  messageTranslated: text("messageTranslated"), // Translated to user's language
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FeedbackReplies = typeof feedbackReplies.$inferSelect;
export type InsertFeedbackReplies = typeof feedbackReplies.$inferInsert;


/**
 * Referral codes for user referral program
 */
export const referralCodes = mysqlTable("referral_codes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(), // One code per user
  code: varchar("code", { length: 20 }).notNull().unique(), // Unique referral code
  usedCount: int("usedCount").default(0).notNull(), // Number of times this code was used
  monthlyUsedCount: int("monthlyUsedCount").default(0).notNull(), // Monthly referral count (resets monthly, max 10)
  lastMonthlyReset: date("lastMonthlyReset"), // Last monthly reset date
  bonusReadings: int("bonusReadings").default(0).notNull(), // Bonus readings earned from referrals
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReferralCode = typeof referralCodes.$inferSelect;
export type InsertReferralCode = typeof referralCodes.$inferInsert;

/**
 * Referral usage tracking
 */
export const referralUsage = mysqlTable("referral_usage", {
  id: int("id").autoincrement().primaryKey(),
  referralCodeId: int("referralCodeId").notNull(), // Reference to referral_codes.id
  referredUserId: int("referredUserId").notNull().unique(), // User who used the code (one code per user)
  bonusGiven: boolean("bonusGiven").default(false).notNull(), // Whether bonus was given to referrer
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReferralUsage = typeof referralUsage.$inferSelect;
export type InsertReferralUsage = typeof referralUsage.$inferInsert;


/**
 * Coupon/Promo codes for premium upgrades
 */
export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(), // Unique coupon code
  description: text("description"), // Description of the coupon
  type: mysqlEnum("type", ["premium_monthly", "premium_lifetime", "bonus_readings"]).notNull(),
  value: int("value").default(0).notNull(), // For bonus_readings type, number of readings to add
  durationDays: int("durationDays"), // For premium_monthly, number of days (null = 30 days default)
  maxUses: int("maxUses"), // Maximum number of times this coupon can be used (null = unlimited)
  usedCount: int("usedCount").default(0).notNull(), // Number of times this coupon was used
  isActive: boolean("isActive").default(true).notNull(), // Whether the coupon is active
  expiresAt: timestamp("expiresAt"), // Optional expiration date
  createdBy: int("createdBy").notNull(), // Admin user ID who created the coupon
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

/**
 * Coupon usage tracking
 */
export const couponUsage = mysqlTable("coupon_usage", {
  id: int("id").autoincrement().primaryKey(),
  couponId: int("couponId").notNull(), // Reference to coupons.id
  userId: int("userId").notNull(), // User who used the coupon
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  premiumExpiresAt: timestamp("premiumExpiresAt"), // When premium expires (for premium coupons)
});

export type CouponUsage = typeof couponUsage.$inferSelect;
export type InsertCouponUsage = typeof couponUsage.$inferInsert;


/**
 * Email authentication credentials
 * Stores password hash and email verification status for email-based login
 */
export const emailCredentials = mysqlTable("email_credentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(), // Reference to users.id
  email: varchar("email", { length: 320 }).notNull().unique(), // Email for login
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(), // bcrypt hash
  isVerified: boolean("isVerified").default(false).notNull(), // Email verified
  verificationToken: varchar("verificationToken", { length: 100 }), // Email verification token
  verificationExpires: timestamp("verificationExpires"), // Token expiration
  resetToken: varchar("resetToken", { length: 100 }), // Password reset token
  resetExpires: timestamp("resetExpires"), // Reset token expiration
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailCredential = typeof emailCredentials.$inferSelect;
export type InsertEmailCredential = typeof emailCredentials.$inferInsert;


/**
 * Purchase history for tracking all user purchases
 * Includes: reading recovery, additional oracles, premium subscription
 */
export const purchaseHistory = mysqlTable("purchase_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["reading_recovery", "additional_oracle", "premium_subscription", "premium_upgrade", "daily_recovery"]).notNull(),
  // For additional_oracle: the oracle ID purchased
  oracleId: varchar("oracleId", { length: 50 }),
  // Amount in JPY
  amount: int("amount").notNull(),
  // Status of the purchase
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  // External payment reference (from Telecom Credit, etc.)
  paymentId: varchar("paymentId", { length: 255 }),
  // Description of the purchase
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PurchaseHistory = typeof purchaseHistory.$inferSelect;
export type InsertPurchaseHistory = typeof purchaseHistory.$inferInsert;


/**
 * Trial usage tracking per oracle
 * Tracks how many exchanges a trial user has used with each oracle (max 3 per oracle)
 */
export const trialUsage = mysqlTable("trial_usage", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  oracleId: varchar("oracleId", { length: 50 }).notNull(),
  exchangeCount: int("exchangeCount").default(0).notNull(), // Number of exchanges (user message + assistant response = 1 exchange)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrialUsage = typeof trialUsage.$inferSelect;
export type InsertTrialUsage = typeof trialUsage.$inferInsert;


/**
 * Oracle referral tracking
 * Tracks when one oracle recommends another oracle to a user
 */
export const oracleReferrals = mysqlTable("oracle_referrals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fromOracleId: varchar("fromOracleId", { length: 50 }).notNull(), // The oracle who made the referral
  toOracleId: varchar("toOracleId", { length: 50 }).notNull(), // The oracle being recommended
  sessionId: int("sessionId"), // Optional: the chat session where referral was made
  // Context of the referral (what topic/concern led to the recommendation)
  referralContext: text("referralContext"),
  // Whether the user followed the referral and started a session with the recommended oracle
  wasFollowed: boolean("wasFollowed").default(false).notNull(),
  followedAt: timestamp("followedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OracleReferral = typeof oracleReferrals.$inferSelect;
export type InsertOracleReferral = typeof oracleReferrals.$inferInsert;

/**
 * User consultation topics for recommendation engine
 * Stores analyzed topics from user conversations for better oracle matching
 */
export const userConsultationTopics = mysqlTable("user_consultation_topics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: mysqlEnum("topic", [
    "love",           // 恋愛
    "marriage",       // 結婚
    "work",           // 仕事
    "career",         // キャリア
    "money",          // 金運
    "health",         // 健康
    "family",         // 家族
    "relationships",  // 人間関係
    "future",         // 将来
    "decision",       // 決断
    "spiritual",      // スピリチュアル
    "other"           // その他
  ]).notNull(),
  frequency: int("frequency").default(1).notNull(), // How many times this topic was discussed
  lastConsultedAt: timestamp("lastConsultedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserConsultationTopic = typeof userConsultationTopics.$inferSelect;
export type InsertUserConsultationTopic = typeof userConsultationTopics.$inferInsert;


/**
 * Activation codes for bank transfer payments
 * Admin generates codes after confirming bank transfer, users enter code to activate premium
 */
export const activationCodes = mysqlTable("activation_codes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(), // Unique activation code (合言葉)
  // Code status
  status: mysqlEnum("status", ["pending", "used", "expired"]).default("pending").notNull(),
  // Plan type (monthly or yearly) - determines duration and pricing
  planType: mysqlEnum("planType", ["monthly", "yearly"]).default("monthly").notNull(),
  // User who used the code (null until used)
  usedByUserId: int("usedByUserId"),
  usedAt: timestamp("usedAt"),
  // Duration of premium access in days (30 for monthly, 365 for yearly)
  durationDays: int("durationDays").default(30).notNull(),
  // Admin who created the code
  createdByAdminId: int("createdByAdminId").notNull(),
  // Optional: email of the customer who made the bank transfer (for tracking)
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerName: varchar("customerName", { length: 200 }),
  // Bank transfer reference (振込名義人など)
  transferReference: varchar("transferReference", { length: 200 }),
  // Notes from admin
  adminNote: text("adminNote"),
  // Expiration date (code becomes invalid after this date)
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ActivationCode = typeof activationCodes.$inferSelect;
export type InsertActivationCode = typeof activationCodes.$inferInsert;

/**
 * Bank transfer requests
 * Tracks users who have requested bank transfer payment
 */
export const bankTransferRequests = mysqlTable("bank_transfer_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // User's email for sending activation code
  email: varchar("email", { length: 320 }).notNull(),
  // User's name for bank transfer matching
  name: varchar("name", { length: 200 }).notNull(),
  // Plan type (monthly or yearly)
  planType: mysqlEnum("planType", ["monthly", "yearly"]).default("monthly").notNull(),
  // Amount in JPY (1980 for monthly, 19800 for yearly)
  amount: int("amount").default(1980).notNull(),
  // Status of the request
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "rejected"]).default("pending").notNull(),
  // Activation code issued for this request (after confirmation)
  activationCodeId: int("activationCodeId"),
  // Admin who confirmed the transfer
  confirmedByAdminId: int("confirmedByAdminId"),
  confirmedAt: timestamp("confirmedAt"),
  // Notes
  adminNote: text("adminNote"),
  userNote: text("userNote"), // User's note about the transfer (振込名義人が異なる場合など)
  // User reported transfer completion
  transferReported: boolean("transferReported").default(false).notNull(),
  transferReportedAt: timestamp("transferReportedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BankTransferRequest = typeof bankTransferRequests.$inferSelect;
export type InsertBankTransferRequest = typeof bankTransferRequests.$inferInsert;


/**
 * Phone credentials for SMS-based login
 * Stores phone number and verification codes for phone authentication
 */
export const phoneCredentials = mysqlTable("phone_credentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(), // Reference to users.id
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull().unique(), // Phone number (E.164 format)
  isVerified: boolean("isVerified").default(false).notNull(), // Phone verified
  // OTP (One-Time Password) for verification
  otpCode: varchar("otpCode", { length: 6 }), // 6-digit verification code
  otpExpires: timestamp("otpExpires"), // OTP expiration (5 minutes)
  otpAttempts: int("otpAttempts").default(0).notNull(), // Failed attempts (max 5)
  lastOtpSentAt: timestamp("lastOtpSentAt"), // Rate limiting
  // Daily resend limit (max 5 per day)
  dailyResendCount: int("dailyResendCount").default(0).notNull(), // Resends today
  lastResendResetAt: timestamp("lastResendResetAt"), // When daily count was last reset
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PhoneCredential = typeof phoneCredentials.$inferSelect;
export type InsertPhoneCredential = typeof phoneCredentials.$inferInsert;


/**
 * Login history for security tracking
 * Records each login attempt with device and location information
 */
export const loginHistory = mysqlTable("login_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Reference to users.id
  // Login method used
  loginMethod: mysqlEnum("loginMethod", ["email", "phone", "oauth"]).notNull(),
  // IP address of the login attempt
  ipAddress: varchar("ipAddress", { length: 45 }).notNull(), // IPv6 max length
  // User agent string from the browser
  userAgent: text("userAgent"),
  // Parsed device information
  deviceType: varchar("deviceType", { length: 50 }), // mobile, tablet, desktop
  browser: varchar("browser", { length: 100 }), // Chrome, Safari, Firefox, etc.
  os: varchar("os", { length: 100 }), // Windows, macOS, iOS, Android, etc.
  // Location information (optional, from IP geolocation)
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  // Login result
  success: boolean("success").default(true).notNull(),
  failureReason: varchar("failureReason", { length: 200 }), // If login failed
  // Session information
  sessionId: varchar("sessionId", { length: 255 }), // JWT session ID or token hash
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LoginHistory = typeof loginHistory.$inferSelect;
export type InsertLoginHistory = typeof loginHistory.$inferInsert;


/**
 * Referral rewards tracking
 * Tracks cash rewards earned from referrals (500 yen per paid referral)
 */
export const referralRewards = mysqlTable("referral_rewards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // User who earned the reward (referrer)
  referredUserId: int("referredUserId").notNull(), // User who was referred and became paid
  referralCodeId: int("referralCodeId").notNull(), // Reference to referral_codes.id
  // Reward amount in yen (500 yen per referral)
  amount: int("amount").default(500).notNull(),
  // Status of the reward: waiting_90days -> approved -> paid
  // waiting_90days: Waiting for 90-day (3-month) retention period
  status: mysqlEnum("status", ["waiting_30days", "waiting_90days", "pending", "approved", "paid", "cancelled"]).default("waiting_90days").notNull(),
  // When the referred user became a paid member
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
  // When the 90-day (3-month) retention period ends (earnedAt + 90 days)
  retentionEndsAt: timestamp("retentionEndsAt"),
  // Whether the 90-day (3-month) retention check has passed
  retentionPassed: boolean("retentionPassed").default(false).notNull(),
  // When the reward was approved by admin
  approvedAt: timestamp("approvedAt"),
  approvedByAdminId: int("approvedByAdminId"),
  // When the reward was paid out
  paidAt: timestamp("paidAt"),
  paidByAdminId: int("paidByAdminId"),
  // Payout request ID (if part of a batch payout)
  payoutRequestId: int("payoutRequestId"),
  // Notes
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReferralReward = typeof referralRewards.$inferSelect;
export type InsertReferralReward = typeof referralRewards.$inferInsert;

/**
 * Payout requests from users
 * Users can request payout when they have accumulated rewards
 */
export const payoutRequests = mysqlTable("payout_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // User requesting payout
  // Total amount requested in yen
  amount: int("amount").notNull(),
  // Transfer fee in yen
  transferFee: int("transferFee").default(300).notNull(),
  // Actual transfer amount (amount - transferFee)
  actualTransferAmount: int("actualTransferAmount").notNull(),
  // Bank account information
  bankName: varchar("bankName", { length: 100 }).notNull(),
  branchName: varchar("branchName", { length: 100 }).notNull(),
  accountType: mysqlEnum("accountType", ["ordinary", "checking", "savings"]).default("ordinary").notNull(), // 普通/当座/貯蓄
  accountNumber: varchar("accountNumber", { length: 20 }).notNull(),
  accountHolderName: varchar("accountHolderName", { length: 100 }).notNull(), // カタカナ
  // Status
  status: mysqlEnum("status", ["pending", "processing", "completed", "rejected"]).default("pending").notNull(),
  // Processing information
  processedAt: timestamp("processedAt"),
  processedByAdminId: int("processedByAdminId"),
  // Transfer reference number (振込番号)
  transferReference: varchar("transferReference", { length: 100 }),
  // Rejection reason if rejected
  rejectionReason: text("rejectionReason"),
  // Notes
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PayoutRequest = typeof payoutRequests.$inferSelect;
export type InsertPayoutRequest = typeof payoutRequests.$inferInsert;

/**
 * User bank accounts (saved for future payouts)
 */
export const userBankAccounts = mysqlTable("user_bank_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Bank account information
  bankName: varchar("bankName", { length: 100 }).notNull(),
  bankCode: varchar("bankCode", { length: 10 }),
  branchName: varchar("branchName", { length: 100 }).notNull(),
  branchCode: varchar("branchCode", { length: 10 }),
  accountType: mysqlEnum("accountType", ["ordinary", "checking", "savings"]).default("ordinary").notNull(),
  accountNumber: varchar("accountNumber", { length: 20 }).notNull(),
  accountHolderName: varchar("accountHolderName", { length: 100 }).notNull(), // カタカナ
  // Is this the default account for payouts?
  isDefault: boolean("isDefault").default(true).notNull(),
  // Verification status
  isVerified: boolean("isVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserBankAccount = typeof userBankAccounts.$inferSelect;
export type InsertUserBankAccount = typeof userBankAccounts.$inferInsert;


/**
 * Continuation bonuses for premium subscribers
 * Tracks milestone bonuses for long-term subscribers
 * 3 months: 500 yen, 6 months: 1,000 yen, 12 months: 2,000 yen
 */
export const continuationBonuses = mysqlTable("continuation_bonuses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Milestone type: 3_months, 6_months, 12_months
  milestoneType: mysqlEnum("milestoneType", ["3_months", "6_months", "12_months"]).notNull(),
  // Bonus amount in yen
  amount: int("amount").notNull(),
  // Status: pending (waiting for payout), approved, paid
  status: mysqlEnum("status", ["pending", "approved", "paid"]).default("pending").notNull(),
  // When the bonus was earned
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
  // When the bonus was paid out
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContinuationBonus = typeof continuationBonuses.$inferSelect;
export type InsertContinuationBonus = typeof continuationBonuses.$inferInsert;

/**
 * User subscription history for tracking premium duration
 * Used to calculate continuation bonuses
 */
export const subscriptionHistory = mysqlTable("subscription_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Start date of the subscription period
  startDate: timestamp("startDate").notNull(),
  // End date (null if still active)
  endDate: timestamp("endDate"),
  // Total consecutive months subscribed
  consecutiveMonths: int("consecutiveMonths").default(0).notNull(),
  // Last bonus milestone awarded (to prevent duplicate awards)
  lastBonusMilestone: mysqlEnum("lastBonusMilestone", ["none", "3_months", "6_months", "12_months"]).default("none").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionHistory = typeof subscriptionHistory.$inferSelect;
export type InsertSubscriptionHistory = typeof subscriptionHistory.$inferInsert;



/**
 * Withdrawal requests from users
 */
export const withdrawalRequests = mysqlTable("withdrawal_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Amount to withdraw (in yen)
  amount: int("amount").notNull(),
  // Status: pending (申請中), processing (処理中), completed (振込済み), rejected (却下)
  status: mysqlEnum("status", ["pending", "processing", "completed", "rejected"]).default("pending").notNull(),
  // Bank account snapshot at time of request
  bankName: varchar("bankName", { length: 100 }).notNull(),
  bankCode: varchar("bankCode", { length: 10 }).notNull(),
  branchName: varchar("branchName", { length: 100 }).notNull(),
  branchCode: varchar("branchCode", { length: 10 }).notNull(),
  accountType: mysqlEnum("accountType", ["ordinary", "checking", "savings"]).default("ordinary").notNull(),
  accountNumber: varchar("accountNumber", { length: 20 }).notNull(),
  accountHolder: varchar("accountHolder", { length: 100 }).notNull(),
  // Admin notes
  adminNote: text("adminNote"),
  // Rejection reason (if rejected)
  rejectionReason: text("rejectionReason"),
  // Scheduled transfer date (set by admin when approving)
  scheduledTransferDate: date("scheduledTransferDate"),
  // Processing timestamps
  processedAt: timestamp("processedAt"),
  completedAt: timestamp("completedAt"),
  // Admin who processed the request
  processedBy: int("processedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = typeof withdrawalRequests.$inferInsert;

/**
 * User reward balance tracking
 * Tracks total earned, withdrawn, and available balance
 */
export const userRewardBalances = mysqlTable("user_reward_balances", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  // Total rewards earned (referral + continuation bonuses)
  totalEarned: int("totalEarned").default(0).notNull(),
  // Total amount withdrawn
  totalWithdrawn: int("totalWithdrawn").default(0).notNull(),
  // Pending withdrawal amount (in processing)
  pendingWithdrawal: int("pendingWithdrawal").default(0).notNull(),
  // Available balance = totalEarned - totalWithdrawn - pendingWithdrawal
  // This is calculated, but stored for quick access
  availableBalance: int("availableBalance").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserRewardBalance = typeof userRewardBalances.$inferSelect;
export type InsertUserRewardBalance = typeof userRewardBalances.$inferInsert;


/**
 * Monthly activation codes
 * Admin generates unique codes each month, each user can only use one code per month
 */
export const monthlyActivationCodes = mysqlTable("monthly_activation_codes", {
  id: int("id").autoincrement().primaryKey(),
  // Unique code (e.g., "SIXORACLE-2026-01-ABC123")
  code: varchar("code", { length: 50 }).notNull().unique(),
  // Year and month this code is valid for (e.g., "2026-01")
  validMonth: varchar("validMonth", { length: 7 }).notNull(),
  // Plan type (monthly or yearly)
  planType: mysqlEnum("planType", ["monthly", "yearly"]).default("monthly").notNull(),
  // Duration of premium access in days
  durationDays: int("durationDays").default(30).notNull(),
  // Maximum number of uses allowed (null = unlimited)
  maxUses: int("maxUses"),
  // Current number of times this code has been used
  currentUses: int("currentUses").default(0).notNull(),
  // Status: active (can be used), inactive (disabled by admin), expired (past valid month)
  status: mysqlEnum("status", ["active", "inactive", "expired"]).default("active").notNull(),
  // Admin who created the code (null for token-based creation)
  createdByAdminId: int("createdByAdminId"),
  // Notes from admin
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MonthlyActivationCode = typeof monthlyActivationCodes.$inferSelect;
export type InsertMonthlyActivationCode = typeof monthlyActivationCodes.$inferInsert;

/**
 * Monthly code usage tracking
 * Tracks which users have used which monthly codes (one use per user per month)
 */
export const monthlyCodeUsages = mysqlTable("monthly_code_usages", {
  id: int("id").autoincrement().primaryKey(),
  // User who used the code
  userId: int("userId").notNull(),
  // Code that was used
  codeId: int("codeId").notNull(),
  // Month the code was used for (e.g., "2026-01")
  usedMonth: varchar("usedMonth", { length: 7 }).notNull(),
  // Premium expiration date after using this code
  premiumExpiresAt: timestamp("premiumExpiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MonthlyCodeUsage = typeof monthlyCodeUsages.$inferSelect;
export type InsertMonthlyCodeUsage = typeof monthlyCodeUsages.$inferInsert;


/**
 * Premium grant history
 * Tracks when and by whom premium was granted to users
 */
export const premiumGrantHistory = mysqlTable("premium_grant_history", {
  id: int("id").autoincrement().primaryKey(),
  // User who received premium
  userId: int("userId").notNull(),
  // Admin who granted premium (null if system-granted)
  grantedByAdminId: int("grantedByAdminId"),
  // Type of grant: manual (admin), code (activation code), subscription (Stripe)
  grantType: mysqlEnum("grantType", ["manual", "code", "subscription", "referral"]).notNull(),
  // Premium duration in days
  durationDays: int("durationDays").notNull(),
  // Premium start date
  startDate: timestamp("startDate").notNull(),
  // Premium end date
  endDate: timestamp("endDate").notNull(),
  // Optional note from admin
  note: text("note"),
  // Related code (if grantType is 'code')
  relatedCode: varchar("relatedCode", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PremiumGrantHistory = typeof premiumGrantHistory.$inferSelect;
export type InsertPremiumGrantHistory = typeof premiumGrantHistory.$inferInsert;


/**
 * Premium upgrade requests
 * Users can request to upgrade to premium, admin approves to activate
 */
export const premiumUpgradeRequests = mysqlTable("premium_upgrade_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Status: pending (申請中), approved (承認済み), rejected (却下)
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  // User's message (optional)
  message: text("message"),
  // Admin notes
  adminNote: text("adminNote"),
  // Rejection reason (if rejected)
  rejectionReason: text("rejectionReason"),
  // Processing timestamps
  approvedAt: timestamp("approvedAt"),
  rejectedAt: timestamp("rejectedAt"),
  // Admin who processed the request
  processedBy: int("processedBy"),
  // Premium duration in days (default 30 for monthly)
  durationDays: int("durationDays").default(30).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PremiumUpgradeRequest = typeof premiumUpgradeRequests.$inferSelect;
export type InsertPremiumUpgradeRequest = typeof premiumUpgradeRequests.$inferInsert;


/**
 * Suspicious activity logs for tracking and analysis
 */
export const suspiciousActivityLogs = mysqlTable("suspicious_activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Type of suspicious activity
  activityType: mysqlEnum("activityType", ["bot_detected", "rate_limit_abuse", "repetitive_messages", "automated_pattern", "high_frequency", "admin_session_delete"]).notNull(),
  // Suspicion score at the time of detection
  suspicionScore: int("suspicionScore").notNull(),
  // The message that triggered the detection (if applicable)
  triggerMessage: text("triggerMessage"),
  // Additional details (JSON format)
  details: text("details"),
  // Whether this resulted in an automatic block
  resultedInBlock: boolean("resultedInBlock").default(false).notNull(),
  // IP address (if available)
  ipAddress: varchar("ipAddress", { length: 45 }),
  // User agent (if available)
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SuspiciousActivityLog = typeof suspiciousActivityLogs.$inferSelect;
export type InsertSuspiciousActivityLog = typeof suspiciousActivityLogs.$inferInsert;


/**
 * Favorite oracles for users
 * Users can mark oracles as favorites for quick access
 */
export const favoriteOracles = mysqlTable("favorite_oracles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  oracleId: varchar("oracleId", { length: 50 }).notNull(),
  // Order for display (lower = higher priority)
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FavoriteOracle = typeof favoriteOracles.$inferSelect;
export type InsertFavoriteOracle = typeof favoriteOracles.$inferInsert;


/**
 * Scheduled messages from oracles
 * Weekly fortune and personalized messages from selected oracles
 */
export const scheduledMessages = mysqlTable("scheduled_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  oracleId: varchar("oracleId", { length: 50 }).notNull(),
  // Message type: weekly_fortune (週間運勢), seasonal (季節の変わり目), special (特別なメッセージ), daily_fortune (日運), calendar_event (暦イベント), anniversary_today (記念日当日), anniversary_reminder (記念日リマインダー), daily_greeting (朝の挨拶)
  messageType: mysqlEnum("messageType", ["weekly_fortune", "seasonal", "special", "daily_fortune", "calendar_event", "anniversary_today", "anniversary_reminder", "daily_greeting"]).notNull(),
  // Message title (optional)
  title: varchar("title", { length: 200 }),
  // Message content (generated by AI)
  content: text("content").notNull(),
  // Message status
  status: mysqlEnum("status", ["pending", "sent", "failed"]).default("pending").notNull(),
  // Whether the message has been read
  isRead: boolean("isRead").default(false).notNull(),
  // Scheduled delivery time
  scheduledAt: timestamp("scheduledAt").notNull(),
  // Actual sent time (null if not yet sent)
  sentAt: timestamp("sentAt"),
  // Actual delivery time (null if not yet delivered)
  deliveredAt: timestamp("deliveredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScheduledMessage = typeof scheduledMessages.$inferSelect;
export type InsertScheduledMessage = typeof scheduledMessages.$inferInsert;


/**
 * User message preferences
 * Users can select which oracles to receive scheduled messages from
 */
export const userMessagePreferences = mysqlTable("user_message_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  // Enable weekly fortune messages
  weeklyFortuneEnabled: boolean("weeklyFortuneEnabled").default(true).notNull(),
  // Selected oracle for weekly fortune (null = random from favorites)
  weeklyFortuneOracleId: varchar("weeklyFortuneOracleId", { length: 50 }),
  // Enable seasonal messages
  seasonalMessagesEnabled: boolean("seasonalMessagesEnabled").default(true).notNull(),
  // Enable daily fortune messages
  dailyFortuneEnabled: boolean("dailyFortuneEnabled").default(false).notNull(),
  // Selected oracle for daily fortune (null = random from favorites)
  dailyFortuneOracleId: varchar("dailyFortuneOracleId", { length: 50 }),
  // Preferred delivery time (hour in JST, 0-23)
  preferredDeliveryHour: int("preferredDeliveryHour").default(8).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserMessagePreference = typeof userMessagePreferences.$inferSelect;
export type InsertUserMessagePreference = typeof userMessagePreferences.$inferInsert;



/**
 * User companion settings
 * Settings for digital companion features (watch mode, notification preferences)
 */
export const userCompanionSettings = mysqlTable("user_companion_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  // Watch mode: AI only responds when user initiates, no proactive messages
  watchModeEnabled: boolean("watchModeEnabled").default(false).notNull(),
  // Conversation mode: consultation (悩み相談) or daily_sharing (日常共有)
  defaultConversationMode: mysqlEnum("defaultConversationMode", ["consultation", "daily_sharing"]).default("consultation").notNull(),
  // Important calendar notifications (節分, 新月, 春分 etc.)
  calendarNotificationsEnabled: boolean("calendarNotificationsEnabled").default(true).notNull(),
  // Anniversary notifications (user's important dates)
  anniversaryNotificationsEnabled: boolean("anniversaryNotificationsEnabled").default(true).notNull(),
  // Preferred oracle for important date messages (null = favorite oracle)
  preferredOracleForNotifications: varchar("preferredOracleForNotifications", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserCompanionSetting = typeof userCompanionSettings.$inferSelect;
export type InsertUserCompanionSetting = typeof userCompanionSettings.$inferInsert;


/**
 * User anniversaries (important dates)
 * User-defined important dates for personalized notifications
 */
export const userAnniversaries = mysqlTable("user_anniversaries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Date name (e.g., "結婚記念日", "彼との出会った日", "転職記念日")
  name: varchar("name", { length: 100 }).notNull(),
  // Date (month and day, year is optional)
  month: int("month").notNull(), // 1-12
  day: int("day").notNull(), // 1-31
  year: int("year"), // Optional: specific year for age calculation
  // Category for personalized messages
  category: mysqlEnum("category", ["love", "work", "family", "health", "personal", "other"]).default("personal").notNull(),
  // Whether to receive notification on this date
  notificationEnabled: boolean("notificationEnabled").default(true).notNull(),
  // Days before to send reminder (0 = on the day, 1 = day before, etc.)
  reminderDaysBefore: int("reminderDaysBefore").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserAnniversary = typeof userAnniversaries.$inferSelect;
export type InsertUserAnniversary = typeof userAnniversaries.$inferInsert;


/**
 * Important calendar dates (system-wide)
 * Japanese calendar events and astronomical events
 */
export const calendarEvents = mysqlTable("calendar_events", {
  id: int("id").autoincrement().primaryKey(),
  // Event name (e.g., "節分", "新月", "春分の日")
  name: varchar("name", { length: 100 }).notNull(),
  // Event name in English for display
  nameEn: varchar("nameEn", { length: 100 }),
  // Event type
  eventType: mysqlEnum("eventType", ["seasonal", "lunar", "solar", "traditional", "special"]).notNull(),
  // Date (for recurring events, year is ignored)
  month: int("month").notNull(),
  day: int("day").notNull(),
  year: int("year"), // Optional: for specific year events
  // Is this a recurring annual event?
  isRecurring: boolean("isRecurring").default(true).notNull(),
  // Fortune/spiritual significance description
  significance: text("significance"),
  // Message template for oracles to use
  messageTemplate: text("messageTemplate"),
  // Is this event active?
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;


/**
 * User-Oracle intimacy (親密度)
 * Tracks relationship level between user and each oracle
 */
export const userOracleIntimacy = mysqlTable("user_oracle_intimacy", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  oracleId: varchar("oracleId", { length: 50 }).notNull(),
  // Intimacy level (1-10, increases with interactions)
  level: int("level").default(1).notNull(),
  // Total experience points
  experiencePoints: int("experiencePoints").default(0).notNull(),
  // Points needed for next level
  pointsToNextLevel: int("pointsToNextLevel").default(100).notNull(),
  // Total conversations with this oracle
  totalConversations: int("totalConversations").default(0).notNull(),
  // Total messages exchanged
  totalMessages: int("totalMessages").default(0).notNull(),
  // Consecutive days of interaction (streak)
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastInteractionDate: date("lastInteractionDate"),
  // Unlocked features/rewards at this level
  unlockedFeatures: text("unlockedFeatures"), // JSON array of unlocked feature IDs
  // First interaction date
  firstInteractionAt: timestamp("firstInteractionAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserOracleIntimacy = typeof userOracleIntimacy.$inferSelect;
export type InsertUserOracleIntimacy = typeof userOracleIntimacy.$inferInsert;


/**
 * Intimacy rewards/features
 * Defines what features unlock at each intimacy level
 */
export const intimacyRewards = mysqlTable("intimacy_rewards", {
  id: int("id").autoincrement().primaryKey(),
  // Required intimacy level to unlock
  requiredLevel: int("requiredLevel").notNull(),
  // Reward type
  rewardType: mysqlEnum("rewardType", ["title", "image_style", "special_greeting", "exclusive_advice", "anniversary_message", "custom_avatar", "exclusive_menu", "deep_reading", "special_prompt"]).notNull(),
  // Reward name
  name: varchar("name", { length: 100 }).notNull(),
  // Reward description
  description: text("description"),
  // Reward data (JSON, varies by type)
  rewardData: text("rewardData"),
  // Oracle-specific or universal?
  oracleId: varchar("oracleId", { length: 50 }), // null = universal
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IntimacyReward = typeof intimacyRewards.$inferSelect;
export type InsertIntimacyReward = typeof intimacyRewards.$inferInsert;


/**
 * Daily login tracking for intimacy bonuses
 */
export const dailyLogins = mysqlTable("daily_logins", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  loginDate: date("loginDate").notNull(),
  // Bonus points earned for this login
  bonusPointsEarned: int("bonusPointsEarned").default(10).notNull(),
  // Streak bonus multiplier (1.0 = no bonus, 1.5 = 50% bonus, etc.)
  streakMultiplier: int("streakMultiplier").default(100).notNull(), // Stored as percentage (100 = 1.0x)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyLogin = typeof dailyLogins.$inferSelect;
export type InsertDailyLogin = typeof dailyLogins.$inferInsert;


/**
 * Favorite messages saved by users
 */
export const favoriteMessages = mysqlTable("favorite_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  messageId: int("messageId").notNull(), // Reference to chatMessages.id
  oracleId: varchar("oracleId", { length: 50 }).notNull(),
  // Cached content for quick display (in case original message is deleted)
  cachedContent: text("cachedContent").notNull(),
  // Optional note from user
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FavoriteMessage = typeof favoriteMessages.$inferSelect;
export type InsertFavoriteMessage = typeof favoriteMessages.$inferInsert;


/**
 * Share bonus tracking - rewards users for sharing reading results
 */
export const shareBonus = mysqlTable("share_bonus", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Platform where the share was made
  platform: mysqlEnum("platform", ["twitter", "instagram", "line", "facebook", "other"]).notNull(),
  // Session ID that was shared (optional, for tracking)
  sessionId: int("sessionId"),
  // Bonus readings awarded for this share
  bonusReadingsAwarded: int("bonusReadingsAwarded").default(1).notNull(),
  // Share URL or identifier (for verification)
  shareIdentifier: varchar("shareIdentifier", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ShareBonus = typeof shareBonus.$inferSelect;
export type InsertShareBonus = typeof shareBonus.$inferInsert;

/**
 * Limited time campaigns - for first N users discounts
 */
export const limitedCampaigns = mysqlTable("limited_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  // Campaign name/identifier
  name: varchar("name", { length: 100 }).notNull().unique(),
  // Campaign description
  description: text("description"),
  // Type of campaign
  type: mysqlEnum("type", ["first_n_discount", "time_limited", "seasonal"]).notNull(),
  // Discount percentage (e.g., 50 for 50% off)
  discountPercent: int("discountPercent").default(0).notNull(),
  // Maximum number of users who can claim this campaign
  maxUsers: int("maxUsers").notNull(),
  // Current number of users who have claimed
  claimedCount: int("claimedCount").default(0).notNull(),
  // Campaign start and end dates
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  // Whether the campaign is active
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LimitedCampaign = typeof limitedCampaigns.$inferSelect;
export type InsertLimitedCampaign = typeof limitedCampaigns.$inferInsert;

/**
 * Campaign claims - tracks which users have claimed which campaigns
 */
export const campaignClaims = mysqlTable("campaign_claims", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  campaignId: int("campaignId").notNull(),
  // Discount applied (stored for historical record)
  discountApplied: int("discountApplied").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CampaignClaim = typeof campaignClaims.$inferSelect;
export type InsertCampaignClaim = typeof campaignClaims.$inferInsert;

/**
 * Anonymous reading quotes - for viral content feature
 * Stores anonymized, shareable quotes from readings
 */
export const anonymousQuotes = mysqlTable("anonymous_quotes", {
  id: int("id").autoincrement().primaryKey(),
  // Original session ID (for internal tracking, not exposed)
  sessionId: int("sessionId").notNull(),
  // Oracle who gave the reading
  oracleId: varchar("oracleId", { length: 50 }).notNull(),
  // Anonymized quote content
  quoteContent: text("quoteContent").notNull(),
  // Category of the reading
  category: mysqlEnum("category", ["love", "work", "health", "money", "relationships", "future", "spiritual", "other"]),
  // Whether the user consented to share (opt-in)
  userConsented: boolean("userConsented").default(false).notNull(),
  // Whether this quote is approved for public display
  isApproved: boolean("isApproved").default(false).notNull(),
  // Number of times this quote has been viewed/shared
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnonymousQuote = typeof anonymousQuotes.$inferSelect;
export type InsertAnonymousQuote = typeof anonymousQuotes.$inferInsert;

/**
 * Free trial tracking - for one-time free reading before registration
 */
export const freeTrials = mysqlTable("free_trials", {
  id: int("id").autoincrement().primaryKey(),
  // Device fingerprint or session identifier
  deviceFingerprint: varchar("deviceFingerprint", { length: 255 }).notNull().unique(),
  // IP address (for additional verification)
  ipAddress: varchar("ipAddress", { length: 45 }),
  // Whether the free trial has been used
  trialUsed: boolean("trialUsed").default(false).notNull(),
  // Oracle used for the trial
  oracleId: varchar("oracleId", { length: 50 }),
  // When the trial was used
  usedAt: timestamp("usedAt"),
  // If the user later registered, link to their user ID
  convertedUserId: int("convertedUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FreeTrial = typeof freeTrials.$inferSelect;
export type InsertFreeTrial = typeof freeTrials.$inferInsert;


/**
 * MBTI type history
 * Tracks user's MBTI test results over time
 */
export const mbtiHistory = mysqlTable("mbti_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // MBTI type result (e.g., "INTJ", "ENFP")
  mbtiType: varchar("mbtiType", { length: 4 }).notNull(),
  // Individual dimension scores (for detailed analysis)
  eScore: int("eScore").default(0).notNull(), // Extraversion score (positive = E, negative = I)
  sScore: int("sScore").default(0).notNull(), // Sensing score (positive = S, negative = N)
  tScore: int("tScore").default(0).notNull(), // Thinking score (positive = T, negative = F)
  jScore: int("jScore").default(0).notNull(), // Judging score (positive = J, negative = P)
  // Test source: quick_test (12問), full_test (将来的に追加), chat (心理との会話から)
  testSource: mysqlEnum("testSource", ["quick_test", "full_test", "chat"]).default("quick_test").notNull(),
  // Optional notes from the test
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MbtiHistory = typeof mbtiHistory.$inferSelect;
export type InsertMbtiHistory = typeof mbtiHistory.$inferInsert;


/**
 * Shared MBTI group compatibility results for link sharing
 */
export const mbtiGroupResults = mysqlTable("mbti_group_results", {
  id: int("id").autoincrement().primaryKey(),
  // Unique share ID for URL (e.g., "abc123xyz")
  shareId: varchar("shareId", { length: 32 }).notNull().unique(),
  // Creator user ID (optional, null for anonymous shares)
  userId: int("userId"),
  // Group name (optional)
  groupName: varchar("groupName", { length: 100 }),
  // Members data as JSON: [{ name: string, type: MBTIType }]
  membersData: text("membersData").notNull(),
  // Calculated group score
  groupScore: int("groupScore").notNull(), // Stored as score * 100 for precision (e.g., 3.75 -> 375)
  // Analysis results as JSON: { strengths: string[], weaknesses: string[], tips: string[] }
  analysisData: text("analysisData").notNull(),
  // Compatibility matrix as JSON: [{ member1: string, member2: string, score: number }]
  matrixData: text("matrixData").notNull(),
  // View count for analytics
  viewCount: int("viewCount").default(0).notNull(),
  // Expiration date (optional, null = never expires)
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MbtiGroupResult = typeof mbtiGroupResults.$inferSelect;
export type InsertMbtiGroupResult = typeof mbtiGroupResults.$inferInsert;


/**
 * Account merge history - tracks when accounts are merged by admin
 */
export const accountMergeHistory = mysqlTable("account_merge_history", {
  id: int("id").autoincrement().primaryKey(),
  // The primary account that remains after merge
  primaryAccountId: int("primaryAccountId").notNull(),
  // The secondary account that was merged into primary
  mergedAccountId: int("mergedAccountId").notNull(),
  // Admin who performed the merge
  mergedByAdminId: int("mergedByAdminId").notNull(),
  // Reason for the merge
  mergeReason: text("mergeReason").notNull(),
  // Snapshot of merged account data before merge (for audit purposes)
  mergedAccountSnapshot: text("mergedAccountSnapshot").notNull(), // JSON
  // What was transferred: sessions, purchases, subscription, etc.
  transferredData: text("transferredData").notNull(), // JSON: { sessions: number, purchases: number, ... }
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AccountMergeHistory = typeof accountMergeHistory.$inferSelect;
export type InsertAccountMergeHistory = typeof accountMergeHistory.$inferInsert;

/**
 * User authentication methods - allows multiple auth methods per user
 */
export const userAuthMethods = mysqlTable("user_auth_methods", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Type of authentication method
  authType: mysqlEnum("authType", ["email", "phone", "oauth"]).notNull(),
  // The identifier (email address, phone number, or oauth provider ID)
  identifier: varchar("identifier", { length: 320 }).notNull(),
  // Is this the primary auth method?
  isPrimary: boolean("isPrimary").default(false).notNull(),
  // Verification status
  isVerified: boolean("isVerified").default(false).notNull(),
  // Verification code (for pending verifications)
  verificationCode: varchar("verificationCode", { length: 10 }),
  verificationExpiresAt: timestamp("verificationExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserAuthMethod = typeof userAuthMethods.$inferSelect;
export type InsertUserAuthMethod = typeof userAuthMethods.$inferInsert;

/**
 * Suspicious account patterns - tracks potential duplicate/fraudulent accounts
 */
export const suspiciousAccountPatterns = mysqlTable("suspicious_account_patterns", {
  id: int("id").autoincrement().primaryKey(),
  // The accounts that are suspected to be related
  accountIds: text("accountIds").notNull(), // JSON array of user IDs
  // Detection method
  detectionType: mysqlEnum("detectionType", ["same_device", "same_ip", "similar_name", "same_email_pattern", "manual_flag"]).notNull(),
  // Detection details
  detectionDetails: text("detectionDetails").notNull(), // JSON with specific match info
  // Confidence score (0-100)
  confidenceScore: int("confidenceScore").notNull(),
  // Status
  status: mysqlEnum("status", ["pending", "reviewed", "dismissed", "confirmed_fraud", "confirmed_legitimate"]).default("pending").notNull(),
  // Admin review
  reviewedByAdminId: int("reviewedByAdminId"),
  reviewedAt: timestamp("reviewedAt"),
  reviewNote: text("reviewNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SuspiciousAccountPattern = typeof suspiciousAccountPatterns.$inferSelect;
export type InsertSuspiciousAccountPattern = typeof suspiciousAccountPatterns.$inferInsert;


/**
 * Payment links - tracks payment links generated for users
 * Supports multiple payment providers (Telecom Credit, Alpha Note, etc.)
 */
export const paymentLinks = mysqlTable("payment_links", {
  id: int("id").autoincrement().primaryKey(),
  // Unique link ID for tracking
  linkId: varchar("linkId", { length: 64 }).notNull().unique(),
  userId: int("userId").notNull(),
  // Payment provider (to be configured when provider is selected)
  provider: mysqlEnum("provider", ["telecom_credit", "alpha_note", "bank_transfer", "other"]).notNull(),
  // Plan type being purchased
  planType: mysqlEnum("planType", ["monthly", "yearly"]).notNull(),
  // Amount in JPY
  amount: int("amount").notNull(),
  // Link status
  status: mysqlEnum("status", ["pending", "completed", "expired", "cancelled"]).default("pending").notNull(),
  // The actual payment URL (generated by provider or custom)
  paymentUrl: text("paymentUrl"),
  // Metadata for the payment (JSON)
  metadata: text("metadata"), // { userEmail, userName, etc. }
  // Expiration time for the link
  expiresAt: timestamp("expiresAt"),
  // When payment was completed
  completedAt: timestamp("completedAt"),
  // External payment reference from provider
  externalPaymentId: varchar("externalPaymentId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentLink = typeof paymentLinks.$inferSelect;
export type InsertPaymentLink = typeof paymentLinks.$inferInsert;

/**
 * Payment webhooks - logs all incoming payment notifications
 * For debugging and audit purposes
 */
export const paymentWebhooks = mysqlTable("payment_webhooks", {
  id: int("id").autoincrement().primaryKey(),
  // Provider that sent the webhook
  provider: mysqlEnum("provider", ["telecom_credit", "alpha_note", "bank_transfer", "other"]).notNull(),
  // Raw payload received
  payload: text("payload").notNull(),
  // Parsed event type
  eventType: varchar("eventType", { length: 100 }),
  // Related payment link ID (if found)
  paymentLinkId: int("paymentLinkId"),
  // Processing status
  status: mysqlEnum("status", ["received", "processed", "failed", "ignored"]).default("received").notNull(),
  // Error message if processing failed
  errorMessage: text("errorMessage"),
  // IP address of the webhook sender
  sourceIp: varchar("sourceIp", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PaymentWebhook = typeof paymentWebhooks.$inferSelect;
export type InsertPaymentWebhook = typeof paymentWebhooks.$inferInsert;

