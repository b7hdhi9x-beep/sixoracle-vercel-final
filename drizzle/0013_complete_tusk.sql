CREATE TABLE `account_merge_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`primaryAccountId` int NOT NULL,
	`mergedAccountId` int NOT NULL,
	`mergedByAdminId` int NOT NULL,
	`mergeReason` text NOT NULL,
	`mergedAccountSnapshot` text NOT NULL,
	`transferredData` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `account_merge_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suspicious_account_patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountIds` text NOT NULL,
	`detectionType` enum('same_device','same_ip','similar_name','same_email_pattern','manual_flag') NOT NULL,
	`detectionDetails` text NOT NULL,
	`confidenceScore` int NOT NULL,
	`status` enum('pending','reviewed','dismissed','confirmed_fraud','confirmed_legitimate') NOT NULL DEFAULT 'pending',
	`reviewedByAdminId` int,
	`reviewedAt` timestamp,
	`reviewNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `suspicious_account_patterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_auth_methods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`authType` enum('email','phone','oauth') NOT NULL,
	`identifier` varchar(320) NOT NULL,
	`isPrimary` boolean NOT NULL DEFAULT false,
	`isVerified` boolean NOT NULL DEFAULT false,
	`verificationCode` varchar(10),
	`verificationExpiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_auth_methods_id` PRIMARY KEY(`id`)
);
