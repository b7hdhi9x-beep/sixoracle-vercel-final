CREATE TABLE `feedback_box` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(200) NOT NULL,
	`category` enum('praise','suggestion','bug_report','feature_request','other') NOT NULL,
	`message` text NOT NULL,
	`messageTranslated` text,
	`language` varchar(10) NOT NULL,
	`rating` int,
	`isPublic` boolean NOT NULL DEFAULT true,
	`isApproved` boolean NOT NULL DEFAULT false,
	`isFlagged` boolean NOT NULL DEFAULT false,
	`adminNote` text,
	`status` enum('pending','approved','rejected','hidden') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedback_box_id` PRIMARY KEY(`id`)
);
