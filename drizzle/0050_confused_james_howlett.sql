CREATE TABLE `monthly_activation_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`validMonth` varchar(7) NOT NULL,
	`planType` enum('monthly','yearly') NOT NULL DEFAULT 'monthly',
	`durationDays` int NOT NULL DEFAULT 30,
	`maxUses` int,
	`currentUses` int NOT NULL DEFAULT 0,
	`status` enum('active','inactive','expired') NOT NULL DEFAULT 'active',
	`createdByAdminId` int NOT NULL,
	`adminNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monthly_activation_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `monthly_activation_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `monthly_code_usages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`codeId` int NOT NULL,
	`usedMonth` varchar(7) NOT NULL,
	`premiumExpiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `monthly_code_usages_id` PRIMARY KEY(`id`)
);
