CREATE TABLE `purchase_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('reading_recovery','additional_oracle','premium_subscription','premium_upgrade') NOT NULL,
	`oracleId` varchar(50),
	`amount` int NOT NULL,
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`paymentId` varchar(255),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchase_history_id` PRIMARY KEY(`id`)
);
