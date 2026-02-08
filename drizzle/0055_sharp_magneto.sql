ALTER TABLE `bank_transfer_requests` ADD `transferReported` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `bank_transfer_requests` ADD `transferReportedAt` timestamp;