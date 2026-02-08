ALTER TABLE `users` ADD `totalFreeReadings` int DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `usedFreeReadings` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `bonusReadings` int DEFAULT 0 NOT NULL;