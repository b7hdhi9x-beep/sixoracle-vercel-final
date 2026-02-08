CREATE TABLE `payment_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`linkId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`provider` enum('telecom_credit','alpha_note','bank_transfer','other') NOT NULL,
	`planType` enum('monthly','yearly') NOT NULL,
	`amount` int NOT NULL,
	`status` enum('pending','completed','expired','cancelled') NOT NULL DEFAULT 'pending',
	`paymentUrl` text,
	`metadata` text,
	`expiresAt` timestamp,
	`completedAt` timestamp,
	`externalPaymentId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_links_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_links_linkId_unique` UNIQUE(`linkId`)
);
--> statement-breakpoint
CREATE TABLE `payment_webhooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` enum('telecom_credit','alpha_note','bank_transfer','other') NOT NULL,
	`payload` text NOT NULL,
	`eventType` varchar(100),
	`paymentLinkId` int,
	`status` enum('received','processed','failed','ignored') NOT NULL DEFAULT 'received',
	`errorMessage` text,
	`sourceIp` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_webhooks_id` PRIMARY KEY(`id`)
);
