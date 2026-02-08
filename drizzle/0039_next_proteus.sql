ALTER TABLE `phone_credentials` ADD `dailyResendCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `phone_credentials` ADD `lastResendResetAt` timestamp;