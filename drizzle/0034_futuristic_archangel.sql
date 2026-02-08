ALTER TABLE `users` ADD `premiumExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `renewalReminderSent` boolean DEFAULT false NOT NULL;