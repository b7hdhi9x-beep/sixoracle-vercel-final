ALTER TABLE `chat_sessions` ADD `isDeleted` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `chat_sessions` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `chat_sessions` ADD `deletedReason` varchar(500);--> statement-breakpoint
ALTER TABLE `chat_sessions` ADD `restoredAt` timestamp;--> statement-breakpoint
ALTER TABLE `chat_sessions` ADD `restoredByAdminId` int;