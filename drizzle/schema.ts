import { pgTable, varchar, text, timestamp, integer, pgEnum, boolean, json } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */

// Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const directiveStatusEnum = pgEnum("directive_status", ["active", "paused", "completed", "cancelled"]);
export const agentStatusEnum = pgEnum("agent_status", ["idle", "busy", "offline"]);
export const taskStatusEnum = pgEnum("task_status", ["pending", "in_progress", "completed", "failed", "blocked"]);
export const hitlStatusEnum = pgEnum("hitl_status", ["pending", "approved", "rejected"]);
export const hitlTypeEnum = pgEnum("hitl_type", ["budget_approval", "strategic_pivot", "agent_hiring", "high_risk_decision"]);

export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Strategic Directives - High-level goals from the user
export const directives = pgTable("directives", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  strategicContext: text("strategicContext"), // Full directive from user
  status: directiveStatusEnum("status").default("active").notNull(),
  priority: integer("priority").default(1),
  targetCompletion: timestamp("targetCompletion"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Directive = typeof directives.$inferSelect;
export type InsertDirective = typeof directives.$inferInsert;

// Agent Templates - Types of agents available
export const agentTemplates = pgTable("agentTemplates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  capabilities: json("capabilities").$type<string[]>(), // ["research", "coding", "writing"]
  systemPrompt: text("systemPrompt").notNull(),
  tools: json("tools").$type<string[]>(), // ["web_search", "code_execution"]
  costPerHour: integer("costPerHour").default(0), // in cents
  createdAt: timestamp("createdAt").defaultNow(),
});

export type AgentTemplate = typeof agentTemplates.$inferSelect;
export type InsertAgentTemplate = typeof agentTemplates.$inferInsert;

// Active Agents - Instances of agents working on tasks
export const agents = pgTable("agents", {
  id: varchar("id", { length: 64 }).primaryKey(),
  templateId: varchar("templateId", { length: 64 }).references(() => agentTemplates.id),
  name: varchar("name", { length: 255 }).notNull(),
  status: agentStatusEnum("status").default("idle").notNull(),
  currentTask: varchar("currentTask", { length: 64 }), // Reference to tasks.id
  performanceScore: integer("performanceScore").default(100), // 0-100
  totalTasksCompleted: integer("totalTasksCompleted").default(0),
  totalCostIncurred: integer("totalCostIncurred").default(0), // in cents
  specialization: text("specialization"), // Custom instructions
  createdAt: timestamp("createdAt").defaultNow(),
  lastActiveAt: timestamp("lastActiveAt").defaultNow(),
  retiredAt: timestamp("retiredAt"),
  retirementReason: text("retirementReason"),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// Tasks - Work items assigned to agents
export const tasks = pgTable("tasks", {
  id: varchar("id", { length: 64 }).primaryKey(),
  directiveId: varchar("directiveId", { length: 64 }).references(() => directives.id),
  assignedAgentId: varchar("assignedAgentId", { length: 64 }).references(() => agents.id),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("pending").notNull(),
  priority: integer("priority").default(1),
  dependencies: json("dependencies").$type<string[]>(), // Task IDs that must complete first
  estimatedHours: integer("estimatedHours"),
  actualHours: integer("actualHours"),
  result: text("result"), // Output/result of the task
  blockers: text("blockers"), // What's preventing completion
  createdAt: timestamp("createdAt").defaultNow(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  dueDate: timestamp("dueDate"),
  parentTaskId: varchar("parentTaskId", { length: 64 }), // For subtasks
  metadata: json("metadata"), // Flexible field for task-specific data
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// Agent Actions - Audit log of what agents are doing
export const agentActions = pgTable("agentActions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  agentId: varchar("agentId", { length: 64 }).references(() => agents.id),
  taskId: varchar("taskId", { length: 64 }),
  action: text("action").notNull(), // "started_task", "completed_research", etc.
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow(),
  costIncurred: integer("costIncurred").default(0), // in cents
});

export type AgentAction = typeof agentActions.$inferSelect;
export type InsertAgentAction = typeof agentActions.$inferInsert;

// HITL (Human-in-the-Loop) Requests - Decisions requiring human approval
export const hitlRequests = pgTable("hitlRequests", {
  id: varchar("id", { length: 64 }).primaryKey(),
  type: hitlTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  requestedBy: varchar("requestedBy", { length: 64 }), // Agent ID or "orchestrator"
  relatedDirectiveId: varchar("relatedDirectiveId", { length: 64 }),
  relatedTaskId: varchar("relatedTaskId", { length: 64 }),
  status: hitlStatusEnum("status").default("pending").notNull(),
  decision: text("decision"), // User's response
  createdAt: timestamp("createdAt").defaultNow(),
  resolvedAt: timestamp("resolvedAt"),
  metadata: json("metadata"), // Additional context
});

export type HitlRequest = typeof hitlRequests.$inferSelect;
export type InsertHitlRequest = typeof hitlRequests.$inferInsert;

// Messages - Communication between user and Magentic Manager
export const messages = pgTable("messages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  conversationId: varchar("conversationId", { length: 64 }), // Group related messages
  role: varchar("role", { length: 20 }).notNull(), // "user" or "assistant"
  content: text("content").notNull(),
  directiveId: varchar("directiveId", { length: 64 }), // Optional link to directive
  metadata: json("metadata"), // Tool calls, attachments, etc.
  createdAt: timestamp("createdAt").defaultNow(),
  userId: varchar("userId", { length: 64 }),
  isInternal: boolean("isInternal").default(false), // Internal agent communication
  parentMessageId: varchar("parentMessageId", { length: 64 }), // For threading
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Principles - Living document of operating principles
export const principles = pgTable("principles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  category: varchar("category", { length: 100 }), // "decision_making", "team_building", etc.
  principle: text("principle").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastApplied: timestamp("lastApplied"),
});

export type Principle = typeof principles.$inferSelect;
export type InsertPrinciple = typeof principles.$inferInsert;

// Goals - Business goals and metrics
export const goals = pgTable("goals", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  targetMetric: text("targetMetric"), // What success looks like
  currentValue: text("currentValue"),
  targetValue: text("targetValue"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;

// Work Sessions - Track 24/7 operation
export const workSessions = pgTable("workSessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  startedAt: timestamp("startedAt").defaultNow(),
  endedAt: timestamp("endedAt"),
  directivesProcessed: integer("directivesProcessed").default(0),
  tasksCreated: integer("tasksCreated").default(0),
  tasksCompleted: integer("tasksCompleted").default(0),
  agentsHired: integer("agentsHired").default(0),
  totalCost: integer("totalCost").default(0), // in cents
});

export type WorkSession = typeof workSessions.$inferSelect;
export type InsertWorkSession = typeof workSessions.$inferInsert;

