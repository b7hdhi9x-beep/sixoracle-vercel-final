CREATE TABLE `user_reward_balances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalEarned` int NOT NULL DEFAULT 0,
	`totalWithdrawn` int NOT NULL DEFAULT 0,
	`pendingWithdrawal` int NOT NULL DEFAULT 0,
	`availableBalance` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_reward_balances_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_reward_balances_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `withdrawal_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`status` enum('pending','processing','completed','rejected') NOT NULL DEFAULT 'pending',
	`bankName` varchar(100) NOT NULL,
	`bankCode` varchar(10) NOT NULL,
	`branchName` varchar(100) NOT NULL,
	`branchCode` varchar(10) NOT NULL,
	`accountType` enum('ordinary','checking','savings') NOT NULL DEFAULT 'ordinary',
	`accountNumber` varchar(20) NOT NULL,
	`accountHolder` varchar(100) NOT NULL,
	`adminNote` text,
	`rejectionReason` text,
	`processedAt` timestamp,
	`completedAt` timestamp,
	`processedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `withdrawal_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_bank_accounts` MODIFY COLUMN `accountType` enum('ordinary','checking','savings') NOT NULL DEFAULT 'ordinary';--> statement-breakpoint
ALTER TABLE `user_bank_accounts` ADD `bankCode` varchar(10);--> statement-breakpoint
ALTER TABLE `user_bank_accounts` ADD `branchCode` varchar(10);--> statement-breakpoint
ALTER TABLE `user_bank_accounts` ADD `isVerified` boolean DEFAULT false NOT NULL;