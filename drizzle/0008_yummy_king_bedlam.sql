ALTER TABLE `users` ADD `autoArchiveEnabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `autoArchiveDays` int DEFAULT 30 NOT NULL;