CREATE TABLE `game` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`player1_id` text NOT NULL,
	`player2_id` text,
	`status` text DEFAULT 'waiting' NOT NULL,
	`winner_id` text,
	`access_code` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`player1_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`player2_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`winner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `game_player1_idx` ON `game` (`player1_id`);--> statement-breakpoint
CREATE INDEX `game_player2_idx` ON `game` (`player2_id`);--> statement-breakpoint
CREATE INDEX `game_status_access_code_idx` ON `game` (`status`,`access_code`);--> statement-breakpoint
CREATE INDEX `game_created_at_idx` ON `game` (`created_at`);