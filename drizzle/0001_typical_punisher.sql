CREATE TABLE `automationSchedules` (
	`id` varchar(80) NOT NULL,
	`name` varchar(180) NOT NULL,
	`displayTime` varchar(80) NOT NULL,
	`timezone` varchar(100) NOT NULL,
	`detail` text NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`status` enum('active','prepared','blocked') NOT NULL DEFAULT 'active',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `automationSchedules_id` PRIMARY KEY(`id`)
);
