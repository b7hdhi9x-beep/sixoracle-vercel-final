ALTER TABLE `users` ADD `planType` enum('free','standard','premium_unlimited') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `dailyReadingLimit` int DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `dailyReadingsUsed` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastDailyReset` date;