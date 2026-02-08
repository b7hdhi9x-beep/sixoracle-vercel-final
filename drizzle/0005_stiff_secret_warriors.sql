CREATE TABLE `anonymous_quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`oracleId` varchar(50) NOT NULL,
	`quoteContent` text NOT NULL,
	`category` enum('love','work','health','money','relationships','future','spiritual','other'),
	`userConsented` boolean NOT NULL DEFAULT false,
	`isApproved` boolean NOT NULL DEFAULT false,
	`viewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `anonymous_quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaign_claims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`campaignId` int NOT NULL,
	`discountApplied` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaign_claims_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `free_trials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceFingerprint` varchar(255) NOT NULL,
	`ipAddress` varchar(45),
	`trialUsed` boolean NOT NULL DEFAULT false,
	`oracleId` varchar(50),
	`usedAt` timestamp,
	`convertedUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `free_trials_id` PRIMARY KEY(`id`),
	CONSTRAINT `free_trials_deviceFingerprint_unique` UNIQUE(`deviceFingerprint`)
);
--> statement-breakpoint
CREATE TABLE `limited_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`type` enum('first_n_discount','time_limited','seasonal') NOT NULL,
	`discountPercent` int NOT NULL DEFAULT 0,
	`maxUsers` int NOT NULL,
	`claimedCount` int NOT NULL DEFAULT 0,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `limited_campaigns_id` PRIMARY KEY(`id`),
	CONSTRAINT `limited_campaigns_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `share_bonus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`platform` enum('twitter','instagram','line','facebook','other') NOT NULL,
	`sessionId` int,
	`bonusReadingsAwarded` int NOT NULL DEFAULT 1,
	`shareIdentifier` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `share_bonus_id` PRIMARY KEY(`id`)
);
