CREATE TABLE `login_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`loginMethod` enum('email','phone','oauth') NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`userAgent` text,
	`deviceType` varchar(50),
	`browser` varchar(100),
	`os` varchar(100),
	`country` varchar(100),
	`city` varchar(100),
	`success` boolean NOT NULL DEFAULT true,
	`failureReason` varchar(200),
	`sessionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `login_history_id` PRIMARY KEY(`id`)
);
