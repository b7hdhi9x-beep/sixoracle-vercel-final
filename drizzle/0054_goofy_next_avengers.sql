ALTER TABLE `feedback_box` ADD `deviceInfo` text;--> statement-breakpoint
ALTER TABLE `feedback_box` ADD `stepsToReproduce` text;--> statement-breakpoint
ALTER TABLE `feedback_box` ADD `expectedBehavior` text;--> statement-breakpoint
ALTER TABLE `feedback_box` ADD `actualBehavior` text;--> statement-breakpoint
ALTER TABLE `feedback_box` ADD `screenshotUrl` text;--> statement-breakpoint
ALTER TABLE `feedback_box` ADD `priority` enum('low','medium','high','critical') DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE `feedback_box` ADD `isFromTester` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isTester` boolean DEFAULT false NOT NULL;