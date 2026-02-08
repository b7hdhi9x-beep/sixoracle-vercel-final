CREATE TABLE `favorite_oracles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`oracleId` varchar(50) NOT NULL,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorite_oracles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`oracleId` varchar(50) NOT NULL,
	`messageType` enum('weekly_fortune','seasonal','special','daily_fortune') NOT NULL,
	`content` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`scheduledAt` timestamp NOT NULL,
	`deliveredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scheduled_messages_id` PRIMARY KEY(`id`)
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
ALTER TABLE `chat_sessions` ADD `category` enum('love','work','health','money','relationships','future','spiritual','other');