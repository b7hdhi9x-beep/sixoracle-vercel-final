CREATE TABLE `favorite_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`messageId` int NOT NULL,
	`oracleId` varchar(50) NOT NULL,
	`cachedContent` text NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorite_messages_id` PRIMARY KEY(`id`)
);
