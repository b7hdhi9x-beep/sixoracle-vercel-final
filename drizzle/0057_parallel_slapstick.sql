CREATE TABLE `premium_upgrade_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`message` text,
	`adminNote` text,
	`rejectionReason` text,
	`approvedAt` timestamp,
	`rejectedAt` timestamp,
	`processedBy` int,
	`durationDays` int NOT NULL DEFAULT 30,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `premium_upgrade_requests_id` PRIMARY KEY(`id`)
);
