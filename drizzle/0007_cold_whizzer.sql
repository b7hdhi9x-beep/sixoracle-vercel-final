CREATE TABLE `contact_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inquiryId` int NOT NULL,
	`adminId` int NOT NULL,
	`message` text NOT NULL,
	`messageTranslated` text,
	`language` varchar(10) NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_replies_id` PRIMARY KEY(`id`)
);
