ALTER TABLE `referral_codes` ADD `monthlyUsedCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `referral_codes` ADD `lastMonthlyReset` date;--> statement-breakpoint
ALTER TABLE `users` ADD `purchasedReadings` int DEFAULT 0 NOT NULL;