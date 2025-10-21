CREATE TABLE `agentActions` (
	`id` varchar(64) NOT NULL,
	`agentId` varchar(64),
	`actionType` varchar(100) NOT NULL,
	`taskId` varchar(64),
	`details` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `agentActions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agentTemplates` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`capabilities` text,
	`systemPrompt` text,
	`tools` text,
	`costPerHour` int DEFAULT 50,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `agentTemplates_id` PRIMARY KEY(`id`),
	CONSTRAINT `agentTemplates_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` varchar(64) NOT NULL,
	`templateId` varchar(64),
	`instanceName` varchar(255) NOT NULL,
	`status` enum('active','idle','busy','terminated') NOT NULL DEFAULT 'idle',
	`currentTaskId` varchar(64),
	`specialization` text,
	`performanceScore` int DEFAULT 100,
	`totalTasksCompleted` int DEFAULT 0,
	`costToDate` int DEFAULT 0,
	`hiredAt` timestamp DEFAULT (now()),
	`hiredBy` varchar(64),
	`managerId` varchar(64),
	`terminatedAt` timestamp,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `directives` (
	`id` varchar(64) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`strategicContext` text,
	`status` enum('active','paused','completed','cancelled') NOT NULL DEFAULT 'active',
	`priority` int DEFAULT 1,
	`targetCompletion` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `directives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` varchar(64) NOT NULL,
	`title` varchar(500) NOT NULL,
	`targetValue` int,
	`currentValue` int DEFAULT 0,
	`status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
	`quarter` varchar(20),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hitlRequests` (
	`id` varchar(64) NOT NULL,
	`requestType` varchar(100) NOT NULL,
	`requestedBy` varchar(64),
	`directiveId` varchar(64),
	`title` varchar(500) NOT NULL,
	`description` text,
	`context` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`humanResponse` text,
	`createdAt` timestamp DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `hitlRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` varchar(64) NOT NULL,
	`conversationId` varchar(64),
	`fromType` varchar(50) NOT NULL,
	`fromId` varchar(64),
	`toType` varchar(50),
	`toId` varchar(64),
	`messageType` varchar(50) NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `principles` (
	`id` varchar(64) NOT NULL,
	`version` varchar(50) NOT NULL,
	`content` text NOT NULL,
	`updatedBy` varchar(64),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `principles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` varchar(64) NOT NULL,
	`directiveId` varchar(64),
	`parentTaskId` varchar(64),
	`title` varchar(500) NOT NULL,
	`description` text,
	`assignedTo` varchar(64),
	`createdBy` varchar(64),
	`status` enum('pending','in_progress','blocked','completed','failed') NOT NULL DEFAULT 'pending',
	`priority` int DEFAULT 1,
	`requiresHitl` int DEFAULT 0,
	`hitlApproved` int DEFAULT 0,
	`dependencies` text,
	`outputs` text,
	`createdAt` timestamp DEFAULT (now()),
	`startedAt` timestamp,
	`completedAt` timestamp,
	`estimatedHours` int,
	`actualHours` int,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workSessions` (
	`id` varchar(64) NOT NULL,
	`directiveId` varchar(64),
	`agentsActive` int DEFAULT 0,
	`tasksCompleted` int DEFAULT 0,
	`costIncurred` int DEFAULT 0,
	`summary` text,
	`startedAt` timestamp DEFAULT (now()),
	`endedAt` timestamp,
	CONSTRAINT `workSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `agentActions` ADD CONSTRAINT `agentActions_agentId_agents_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agents` ADD CONSTRAINT `agents_templateId_agentTemplates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `agentTemplates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_directiveId_directives_id_fk` FOREIGN KEY (`directiveId`) REFERENCES `directives`(`id`) ON DELETE no action ON UPDATE no action;