CREATE TABLE `activation_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`status` enum('pending','used','expired') NOT NULL DEFAULT 'pending',
	`planType` enum('monthly','yearly') NOT NULL DEFAULT 'monthly',
	`usedByUserId` int,
	`usedAt` timestamp,
	`durationDays` int NOT NULL DEFAULT 30,
	`createdByAdminId` int NOT NULL,
	`customerEmail` varchar(320),
	`customerName` varchar(200),
	`transferReference` varchar(200),
	`adminNote` text,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activation_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `activation_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `bank_transfer_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(200) NOT NULL,
	`planType` enum('monthly','yearly') NOT NULL DEFAULT 'monthly',
	`amount` int NOT NULL DEFAULT 1980,
	`status` enum('pending','confirmed','cancelled','rejected') NOT NULL DEFAULT 'pending',
	`activationCodeId` int,
	`confirmedByAdminId` int,
	`confirmedAt` timestamp,
	`adminNote` text,
	`userNote` text,
	`transferReported` boolean NOT NULL DEFAULT false,
	`transferReportedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bank_transfer_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `calendar_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameEn` varchar(100),
	`eventType` enum('seasonal','lunar','solar','traditional','special') NOT NULL,
	`month` int NOT NULL,
	`day` int NOT NULL,
	`year` int,
	`isRecurring` boolean NOT NULL DEFAULT true,
	`significance` text,
	`messageTemplate` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `calendar_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cancellation_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reason` enum('price','not_useful','not_accurate','found_alternative','temporary','other') NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cancellation_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`oracleId` varchar(50) NOT NULL,
	`userMessage` text NOT NULL,
	`assistantResponse` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`userId` int NOT NULL,
	`oracleId` varchar(50) NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`oracleId` varchar(50) NOT NULL,
	`title` varchar(200),
	`summary` text,
	`characterQuote` varchar(200),
	`category` enum('love','work','health','money','relationships','future','spiritual','other'),
	`isComplete` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chat_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(200) NOT NULL,
	`email` varchar(320) NOT NULL,
	`category` enum('general','payment','subscription','technical','feedback','other') NOT NULL,
	`message` text NOT NULL,
	`messageTranslated` text,
	`language` varchar(10) NOT NULL,
	`status` enum('new','in_progress','resolved','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contact_inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inquiryId` int NOT NULL,
	`adminId` int NOT NULL,
	`message` text NOT NULL,
	`messageTranslated` text,
	`language` varchar(10) NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `continuation_bonuses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`milestoneType` enum('3_months','6_months','12_months') NOT NULL,
	`amount` int NOT NULL,
	`status` enum('pending','approved','paid') NOT NULL DEFAULT 'pending',
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `continuation_bonuses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupon_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`couponId` int NOT NULL,
	`userId` int NOT NULL,
	`appliedAt` timestamp NOT NULL DEFAULT (now()),
	`premiumExpiresAt` timestamp,
	CONSTRAINT `coupon_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`description` text,
	`type` enum('premium_monthly','premium_lifetime','bonus_readings') NOT NULL,
	`value` int NOT NULL DEFAULT 0,
	`durationDays` int,
	`maxUses` int,
	`usedCount` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`expiresAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `daily_logins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`loginDate` date NOT NULL,
	`bonusPointsEarned` int NOT NULL DEFAULT 10,
	`streakMultiplier` int NOT NULL DEFAULT 100,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_logins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`usageDate` date NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`isVerified` boolean NOT NULL DEFAULT false,
	`verificationToken` varchar(100),
	`verificationExpires` timestamp,
	`resetToken` varchar(100),
	`resetExpires` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_credentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_credentials_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `email_credentials_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `email_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weeklyFortune` boolean NOT NULL DEFAULT true,
	`dailyFortune` boolean NOT NULL DEFAULT false,
	`monthlyFortune` boolean NOT NULL DEFAULT true,
	`consultationFollowup` boolean NOT NULL DEFAULT true,
	`newOracle` boolean NOT NULL DEFAULT true,
	`campaign` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `favorite_oracles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`oracleId` varchar(50) NOT NULL,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorite_oracles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedback_block_list` (
	`id` int AUTO_INCREMENT NOT NULL,
	`blockType` enum('ip','user') NOT NULL,
	`blockValue` varchar(255) NOT NULL,
	`reason` text,
	`blockedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `feedback_block_list_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedback_box` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`userName` varchar(200) NOT NULL,
	`category` enum('praise','suggestion','bug_report','feature_request','other') NOT NULL,
	`message` text NOT NULL,
	`messageTranslated` text,
	`language` varchar(10) NOT NULL,
	`rating` int,
	`isPublic` boolean NOT NULL DEFAULT true,
	`isApproved` boolean NOT NULL DEFAULT false,
	`isFlagged` boolean NOT NULL DEFAULT false,
	`adminNote` text,
	`status` enum('pending','approved','rejected','hidden') NOT NULL DEFAULT 'pending',
	`ipAddress` varchar(45),
	`userAgent` text,
	`deviceInfo` text,
	`stepsToReproduce` text,
	`expectedBehavior` text,
	`actualBehavior` text,
	`screenshotUrl` text,
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`isFromTester` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedback_box_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedback_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`feedbackId` int NOT NULL,
	`adminId` int NOT NULL,
	`adminName` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`messageTranslated` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedback_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `intimacy_rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requiredLevel` int NOT NULL,
	`rewardType` enum('title','image_style','special_greeting','exclusive_advice','anniversary_message','custom_avatar') NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`rewardData` text,
	`oracleId` varchar(50),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `intimacy_rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `login_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`loginMethod` enum('email','phone','oauth') NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`userAgent` text,
	`deviceType` varchar(50),
	`browser` varchar(100),
	`os` varchar(100),
	`country` varchar(100),
	`city` varchar(100),
	`success` boolean NOT NULL DEFAULT true,
	`failureReason` varchar(200),
	`sessionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `login_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monthly_activation_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`validMonth` varchar(7) NOT NULL,
	`planType` enum('monthly','yearly') NOT NULL DEFAULT 'monthly',
	`durationDays` int NOT NULL DEFAULT 30,
	`maxUses` int,
	`currentUses` int NOT NULL DEFAULT 0,
	`status` enum('active','inactive','expired') NOT NULL DEFAULT 'active',
	`createdByAdminId` int,
	`adminNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monthly_activation_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `monthly_activation_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `monthly_code_usages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`codeId` int NOT NULL,
	`usedMonth` varchar(7) NOT NULL,
	`premiumExpiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `monthly_code_usages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('new_oracle','weekly_fortune','payment','system','campaign','referral','withdrawal','consultation_followup','monthly_fortune','daily_fortune','oracle_message') NOT NULL,
	`metadata` text,
	`title` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`link` varchar(500),
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `oracle_referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fromOracleId` varchar(50) NOT NULL,
	`toOracleId` varchar(50) NOT NULL,
	`sessionId` int,
	`referralContext` text,
	`wasFollowed` boolean NOT NULL DEFAULT false,
	`followedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `oracle_referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payout_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`transferFee` int NOT NULL DEFAULT 300,
	`actualTransferAmount` int NOT NULL,
	`bankName` varchar(100) NOT NULL,
	`branchName` varchar(100) NOT NULL,
	`accountType` enum('ordinary','checking','savings') NOT NULL DEFAULT 'ordinary',
	`accountNumber` varchar(20) NOT NULL,
	`accountHolderName` varchar(100) NOT NULL,
	`status` enum('pending','processing','completed','rejected') NOT NULL DEFAULT 'pending',
	`processedAt` timestamp,
	`processedByAdminId` int,
	`transferReference` varchar(100),
	`rejectionReason` text,
	`adminNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payout_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `phone_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`isVerified` boolean NOT NULL DEFAULT false,
	`otpCode` varchar(6),
	`otpExpires` timestamp,
	`otpAttempts` int NOT NULL DEFAULT 0,
	`lastOtpSentAt` timestamp,
	`dailyResendCount` int NOT NULL DEFAULT 0,
	`lastResendResetAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `phone_credentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `phone_credentials_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `phone_credentials_phoneNumber_unique` UNIQUE(`phoneNumber`)
);
--> statement-breakpoint
CREATE TABLE `premium_grant_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`grantedByAdminId` int,
	`grantType` enum('manual','code','subscription','referral') NOT NULL,
	`durationDays` int NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`note` text,
	`relatedCode` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `premium_grant_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `premium_upgrade_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`message` text,
	`adminNote` text,
	`rejectionReason` text,
	`approvedAt` timestamp,
	`rejectedAt` timestamp,
	`processedBy` int,
	`durationDays` int NOT NULL DEFAULT 30,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `premium_upgrade_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('reading_recovery','additional_oracle','premium_subscription','premium_upgrade','daily_recovery') NOT NULL,
	`oracleId` varchar(50),
	`amount` int NOT NULL,
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`paymentId` varchar(255),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchase_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referral_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`usedCount` int NOT NULL DEFAULT 0,
	`monthlyUsedCount` int NOT NULL DEFAULT 0,
	`lastMonthlyReset` date,
	`bonusReadings` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referral_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_codes_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `referral_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `referral_rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`referredUserId` int NOT NULL,
	`referralCodeId` int NOT NULL,
	`amount` int NOT NULL DEFAULT 500,
	`status` enum('waiting_30days','waiting_90days','pending','approved','paid','cancelled') NOT NULL DEFAULT 'waiting_90days',
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	`retentionEndsAt` timestamp,
	`retentionPassed` boolean NOT NULL DEFAULT false,
	`approvedAt` timestamp,
	`approvedByAdminId` int,
	`paidAt` timestamp,
	`paidByAdminId` int,
	`payoutRequestId` int,
	`adminNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referral_rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referral_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referralCodeId` int NOT NULL,
	`referredUserId` int NOT NULL,
	`bonusGiven` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referral_usage_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_usage_referredUserId_unique` UNIQUE(`referredUserId`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`oracleId` varchar(50) NOT NULL,
	`messageType` enum('weekly_fortune','seasonal','special','daily_fortune','calendar_event','anniversary_today','anniversary_reminder','daily_greeting') NOT NULL,
	`title` varchar(200),
	`content` text NOT NULL,
	`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`isRead` boolean NOT NULL DEFAULT false,
	`scheduledAt` timestamp NOT NULL,
	`sentAt` timestamp,
	`deliveredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scheduled_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`consecutiveMonths` int NOT NULL DEFAULT 0,
	`lastBonusMilestone` enum('none','3_months','6_months','12_months') NOT NULL DEFAULT 'none',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suspicious_activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`activityType` enum('bot_detected','rate_limit_abuse','repetitive_messages','automated_pattern','high_frequency') NOT NULL,
	`suspicionScore` int NOT NULL,
	`triggerMessage` text,
	`details` text,
	`resultedInBlock` boolean NOT NULL DEFAULT false,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `suspicious_activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trial_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`oracleId` varchar(50) NOT NULL,
	`exchangeCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trial_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_anniversaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`month` int NOT NULL,
	`day` int NOT NULL,
	`year` int,
	`category` enum('love','work','family','health','personal','other') NOT NULL DEFAULT 'personal',
	`notificationEnabled` boolean NOT NULL DEFAULT true,
	`reminderDaysBefore` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_anniversaries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_bank_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bankName` varchar(100) NOT NULL,
	`bankCode` varchar(10),
	`branchName` varchar(100) NOT NULL,
	`branchCode` varchar(10),
	`accountType` enum('ordinary','checking','savings') NOT NULL DEFAULT 'ordinary',
	`accountNumber` varchar(20) NOT NULL,
	`accountHolderName` varchar(100) NOT NULL,
	`isDefault` boolean NOT NULL DEFAULT true,
	`isVerified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_bank_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_companion_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`watchModeEnabled` boolean NOT NULL DEFAULT false,
	`defaultConversationMode` enum('consultation','daily_sharing') NOT NULL DEFAULT 'consultation',
	`calendarNotificationsEnabled` boolean NOT NULL DEFAULT true,
	`anniversaryNotificationsEnabled` boolean NOT NULL DEFAULT true,
	`preferredOracleForNotifications` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_companion_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_companion_settings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `user_consultation_topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` enum('love','marriage','work','career','money','health','family','relationships','future','decision','spiritual','other') NOT NULL,
	`frequency` int NOT NULL DEFAULT 1,
	`lastConsultedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_consultation_topics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_message_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weeklyFortuneEnabled` boolean NOT NULL DEFAULT true,
	`weeklyFortuneOracleId` varchar(50),
	`seasonalMessagesEnabled` boolean NOT NULL DEFAULT true,
	`dailyFortuneEnabled` boolean NOT NULL DEFAULT false,
	`dailyFortuneOracleId` varchar(50),
	`preferredDeliveryHour` int NOT NULL DEFAULT 8,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_message_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_message_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `user_oracle_intimacy` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`oracleId` varchar(50) NOT NULL,
	`level` int NOT NULL DEFAULT 1,
	`experiencePoints` int NOT NULL DEFAULT 0,
	`pointsToNextLevel` int NOT NULL DEFAULT 100,
	`totalConversations` int NOT NULL DEFAULT 0,
	`totalMessages` int NOT NULL DEFAULT 0,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastInteractionDate` date,
	`unlockedFeatures` text,
	`firstInteractionAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_oracle_intimacy_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_reward_balances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalEarned` int NOT NULL DEFAULT 0,
	`totalWithdrawn` int NOT NULL DEFAULT 0,
	`pendingWithdrawal` int NOT NULL DEFAULT 0,
	`availableBalance` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_reward_balances_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_reward_balances_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`isPremium` boolean NOT NULL DEFAULT false,
	`planType` enum('free','trial','standard','premium_unlimited','premium') NOT NULL DEFAULT 'trial',
	`dailyReadingLimit` int NOT NULL DEFAULT 15,
	`dailyReadingsUsed` int NOT NULL DEFAULT 0,
	`lastDailyReset` date,
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`subscriptionStatus` enum('active','canceled','past_due','none') NOT NULL DEFAULT 'none',
	`premiumExpiresAt` timestamp,
	`renewalReminderSent` boolean NOT NULL DEFAULT false,
	`trialExchangesUsed` int NOT NULL DEFAULT 0,
	`totalFreeReadings` int NOT NULL DEFAULT 0,
	`usedFreeReadings` int NOT NULL DEFAULT 0,
	`bonusReadings` int NOT NULL DEFAULT 0,
	`purchasedReadings` int NOT NULL DEFAULT 0,
	`selectedOracleId` varchar(50),
	`purchasedOracleIds` text,
	`hasUsedFirstRecoveryDiscount` boolean NOT NULL DEFAULT false,
	`displayName` varchar(100),
	`birthDate` date,
	`zodiacSign` varchar(20),
	`bio` text,
	`avatarUrl` text,
	`isTester` boolean NOT NULL DEFAULT false,
	`currentSessionToken` varchar(64),
	`lastLoginAt` timestamp,
	`lastLoginDevice` text,
	`isBlocked` boolean NOT NULL DEFAULT false,
	`blockReason` enum('bot_detected','rate_limit_abuse','manual_block','terms_violation','other'),
	`blockedAt` timestamp,
	`blockedBy` int,
	`blockNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `withdrawal_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`status` enum('pending','processing','completed','rejected') NOT NULL DEFAULT 'pending',
	`bankName` varchar(100) NOT NULL,
	`bankCode` varchar(10) NOT NULL,
	`branchName` varchar(100) NOT NULL,
	`branchCode` varchar(10) NOT NULL,
	`accountType` enum('ordinary','checking','savings') NOT NULL DEFAULT 'ordinary',
	`accountNumber` varchar(20) NOT NULL,
	`accountHolder` varchar(100) NOT NULL,
	`adminNote` text,
	`rejectionReason` text,
	`scheduledTransferDate` date,
	`processedAt` timestamp,
	`completedAt` timestamp,
	`processedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `withdrawal_requests_id` PRIMARY KEY(`id`)
);
