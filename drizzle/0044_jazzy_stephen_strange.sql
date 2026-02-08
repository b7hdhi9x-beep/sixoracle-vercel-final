ALTER TABLE `referral_rewards` MODIFY COLUMN `status` enum('waiting_30days','pending','approved','paid','cancelled') NOT NULL DEFAULT 'waiting_30days';--> statement-breakpoint
ALTER TABLE `referral_rewards` ADD `retentionEndsAt` timestamp;--> statement-breakpoint
ALTER TABLE `referral_rewards` ADD `retentionPassed` boolean DEFAULT false NOT NULL;