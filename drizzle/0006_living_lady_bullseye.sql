CREATE TABLE `contact_inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(200) NOT NULL,
	`email` varchar(320) NOT NULL,
	`category` enum('general','payment','subscription','technical','feedback','other') NOT NULL,
	`message` text NOT NULL,
	`messageTranslated` text,
	`language` varchar(10) NOT NULL,
	`status` enum('new','in_progress','resolved','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contact_inquiries_id` PRIMARY KEY(`id`)
);
