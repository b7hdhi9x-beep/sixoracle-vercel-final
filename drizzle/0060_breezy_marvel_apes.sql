ALTER TABLE `email_preferences` ADD `dailyFortune` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `email_preferences` ADD `monthlyFortune` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `email_preferences` ADD `consultationFollowup` boolean DEFAULT true NOT NULL;