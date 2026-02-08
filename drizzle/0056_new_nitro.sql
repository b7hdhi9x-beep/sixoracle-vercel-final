ALTER TABLE `users` ADD `currentSessionToken` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `lastLoginAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `lastLoginDevice` text;