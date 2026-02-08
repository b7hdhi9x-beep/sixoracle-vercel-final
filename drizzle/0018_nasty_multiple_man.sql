ALTER TABLE `chat_sessions` ADD `summary` text;--> statement-breakpoint
ALTER TABLE `chat_sessions` ADD `characterQuote` varchar(200);--> statement-breakpoint
ALTER TABLE `chat_sessions` ADD `isComplete` boolean DEFAULT false NOT NULL;