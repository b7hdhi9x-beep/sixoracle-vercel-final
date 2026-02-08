CREATE TABLE IF NOT EXISTS `trial_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`oracleId` varchar(50) NOT NULL,
	`exchangeCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trial_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `planType` enum('free','trial','standard','premium_unlimited') NOT NULL DEFAULT 'trial';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `totalFreeReadings` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `trialExchangesUsed` int DEFAULT 0 NOT NULL;
