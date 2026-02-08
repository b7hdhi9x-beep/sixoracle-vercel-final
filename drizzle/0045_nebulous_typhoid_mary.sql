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
