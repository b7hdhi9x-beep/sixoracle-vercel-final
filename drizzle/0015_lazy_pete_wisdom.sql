CREATE TABLE `email_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`isVerified` boolean NOT NULL DEFAULT false,
	`verificationToken` varchar(100),
	`verificationExpires` timestamp,
	`resetToken` varchar(100),
	`resetExpires` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_credentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_credentials_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `email_credentials_email_unique` UNIQUE(`email`)
);
