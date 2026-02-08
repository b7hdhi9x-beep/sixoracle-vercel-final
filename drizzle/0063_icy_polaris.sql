ALTER TABLE `scheduled_messages` MODIFY COLUMN `messageType` enum('weekly_fortune','seasonal','special','daily_fortune','calendar_event','anniversary_today','anniversary_reminder','daily_greeting') NOT NULL;--> statement-breakpoint
ALTER TABLE `scheduled_messages` ADD `title` varchar(200);--> statement-breakpoint
ALTER TABLE `scheduled_messages` ADD `status` enum('pending','sent','failed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `scheduled_messages` ADD `sentAt` timestamp;