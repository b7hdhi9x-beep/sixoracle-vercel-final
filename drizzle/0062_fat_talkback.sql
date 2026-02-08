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
