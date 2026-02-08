CREATE TABLE `payout_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`bankName` varchar(100) NOT NULL,
	`branchName` varchar(100) NOT NULL,
	`accountType` enum('ordinary','checking') NOT NULL DEFAULT 'ordinary',
	`accountNumber` varchar(20) NOT NULL,
	`accountHolderName` varchar(100) NOT NULL,
	`status` enum('pending','processing','completed','rejected') NOT NULL DEFAULT 'pending',
	`processedAt` timestamp,
	`processedByAdminId` int,
	`transferReference` varchar(100),
	`rejectionReason` text,
	`adminNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payout_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referral_rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`referredUserId` int NOT NULL,
	`referralCodeId` int NOT NULL,
	`amount` int NOT NULL DEFAULT 500,
	`status` enum('pending','approved','paid','cancelled') NOT NULL DEFAULT 'pending',
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	`approvedAt` timestamp,
	`approvedByAdminId` int,
	`paidAt` timestamp,
	`paidByAdminId` int,
	`payoutRequestId` int,
	`adminNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referral_rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_bank_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bankName` varchar(100) NOT NULL,
	`branchName` varchar(100) NOT NULL,
	`accountType` enum('ordinary','checking') NOT NULL DEFAULT 'ordinary',
	`accountNumber` varchar(20) NOT NULL,
	`accountHolderName` varchar(100) NOT NULL,
	`isDefault` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_bank_accounts_id` PRIMARY KEY(`id`)
);
