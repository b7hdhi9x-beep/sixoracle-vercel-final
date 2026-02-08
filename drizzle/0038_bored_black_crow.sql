CREATE TABLE `phone_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`isVerified` boolean NOT NULL DEFAULT false,
	`otpCode` varchar(6),
	`otpExpires` timestamp,
	`otpAttempts` int NOT NULL DEFAULT 0,
	`lastOtpSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `phone_credentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `phone_credentials_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `phone_credentials_phoneNumber_unique` UNIQUE(`phoneNumber`)
);
