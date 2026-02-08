CREATE TABLE `suspicious_activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`activityType` enum('bot_detected','rate_limit_abuse','repetitive_messages','automated_pattern','high_frequency') NOT NULL,
	`suspicionScore` int NOT NULL,
	`triggerMessage` text,
	`details` text,
	`resultedInBlock` boolean NOT NULL DEFAULT false,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `suspicious_activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `isBlocked` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `blockReason` enum('bot_detected','rate_limit_abuse','manual_block','terms_violation','other');--> statement-breakpoint
ALTER TABLE `users` ADD `blockedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `blockedBy` int;--> statement-breakpoint
ALTER TABLE `users` ADD `blockNote` text;