CREATE TABLE `mbti_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`mbtiType` varchar(4) NOT NULL,
	`eScore` int NOT NULL DEFAULT 0,
	`sScore` int NOT NULL DEFAULT 0,
	`tScore` int NOT NULL DEFAULT 0,
	`jScore` int NOT NULL DEFAULT 0,
	`testSource` enum('quick_test','full_test','chat') NOT NULL DEFAULT 'quick_test',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mbti_history_id` PRIMARY KEY(`id`)
);
