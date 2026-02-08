ALTER TABLE `users` ADD `subscriptionStartDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `continuousMonths` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `unlockedBenefits` text;