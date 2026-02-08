CREATE TABLE `oracle_referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fromOracleId` varchar(50) NOT NULL,
	`toOracleId` varchar(50) NOT NULL,
	`sessionId` int,
	`referralContext` text,
	`wasFollowed` boolean NOT NULL DEFAULT false,
	`followedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `oracle_referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_consultation_topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` enum('love','marriage','work','career','money','health','family','relationships','future','decision','spiritual','other') NOT NULL,
	`frequency` int NOT NULL DEFAULT 1,
	`lastConsultedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_consultation_topics_id` PRIMARY KEY(`id`)
);
