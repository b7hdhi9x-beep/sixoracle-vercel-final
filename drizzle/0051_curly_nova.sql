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
