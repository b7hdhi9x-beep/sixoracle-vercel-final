CREATE TABLE `mbti_group_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shareId` varchar(32) NOT NULL,
	`userId` int,
	`groupName` varchar(100),
	`membersData` text NOT NULL,
	`groupScore` int NOT NULL,
	`analysisData` text NOT NULL,
	`matrixData` text NOT NULL,
	`viewCount` int NOT NULL DEFAULT 0,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mbti_group_results_id` PRIMARY KEY(`id`),
	CONSTRAINT `mbti_group_results_shareId_unique` UNIQUE(`shareId`)
);
