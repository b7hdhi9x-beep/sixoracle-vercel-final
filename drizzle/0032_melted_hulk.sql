CREATE TABLE `activation_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`status` enum('pending','used','expired') NOT NULL DEFAULT 'pending',
	`usedByUserId` int,
	`usedAt` timestamp,
	`durationDays` int NOT NULL DEFAULT 30,
	`createdByAdminId` int NOT NULL,
	`customerEmail` varchar(320),
	`customerName` varchar(200),
	`transferReference` varchar(200),
	`adminNote` text,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activation_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `activation_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `bank_transfer_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(200) NOT NULL,
	`amount` int NOT NULL DEFAULT 1980,
	`status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
	`activationCodeId` int,
	`confirmedByAdminId` int,
	`confirmedAt` timestamp,
	`adminNote` text,
	`userNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bank_transfer_requests_id` PRIMARY KEY(`id`)
);
