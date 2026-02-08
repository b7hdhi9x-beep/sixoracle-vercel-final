ALTER TABLE `payout_requests` ADD `transferFee` int DEFAULT 300 NOT NULL;--> statement-breakpoint
ALTER TABLE `payout_requests` ADD `actualTransferAmount` int NOT NULL;