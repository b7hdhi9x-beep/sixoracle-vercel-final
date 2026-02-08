CREATE TABLE `feedback_block_list` (
	`id` int AUTO_INCREMENT NOT NULL,
	`blockType` enum('ip','user') NOT NULL,
	`blockValue` varchar(255) NOT NULL,
	`reason` text,
	`blockedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `feedback_block_list_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedback_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`feedbackId` int NOT NULL,
	`adminId` int NOT NULL,
	`adminName` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`messageTranslated` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedback_replies_id` PRIMARY KEY(`id`)
);
