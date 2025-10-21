import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Strategic Directives - High-level goals from the user
export const directives = mysqlTable("directives", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  strategicContext: text("strategicContext"), // Full directive from user
  status: mysqlEnum("status", ["active", "paused", "completed", "cancelled"]).default("active").notNull(),
  priority: int("priority").default(1),
  targetCompletion: timestamp("targetCompletion"),
  createdAt: timestamp("createdAt").defaultNow(),
  completedAt: timestamp("completedAt"),
});

export type Directive = typeof directives.$inferSelect;
export type InsertDirective = typeof directives.$inferInsert;

// Agent Templates - Defines types of agents that can be created
export const agentTemplates = mysqlTable("agentTemplates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  capabilities: text("capabilities"), // JSON array of capabilities
  systemPrompt: text("systemPrompt"),
  tools: text("tools"), // JSON array of available tools
  costPerHour: int("costPerHour").default(50), // in cents
  createdAt: timestamp("createdAt").defaultNow(),
});

export type AgentTemplate = typeof agentTemplates.$inferSelect;
export type InsertAgentTemplate = typeof agentTemplates.$inferInsert;

// Agent Instances - Actual running agents
export const agents = mysqlTable("agents", {
  id: varchar("id", { length: 64 }).primaryKey(),
  templateId: varchar("templateId", { length: 64 }).references(() => agentTemplates.id),
  instanceName: varchar("instanceName", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "idle", "busy", "terminated"]).default("idle").notNull(),
  currentTaskId: varchar("currentTaskId", { length: 64 }),
  specialization: text("specialization"),
  performanceScore: int("performanceScore").default(100), // 0-100
  totalTasksCompleted: int("totalTasksCompleted").default(0),
  costToDate: int("costToDate").default(0), // in cents
  hiredAt: timestamp("hiredAt").defaultNow(),
  hiredBy: varchar("hiredBy", { length: 64 }),
  managerId: varchar("managerId", { length: 64 }),
  terminatedAt: timestamp("terminatedAt"),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// Tasks - Work items
export const tasks = mysqlTable("tasks", {
  id: varchar("id", { length: 64 }).primaryKey(),
  directiveId: varchar("directiveId", { length: 64 }).references(() => directives.id),
  parentTaskId: varchar("parentTaskId", { length: 64 }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  assignedTo: varchar("assignedTo", { length: 64 }),
  createdBy: varchar("createdBy", { length: 64 }),
  status: mysqlEnum("status", ["pending", "in_progress", "blocked", "completed", "failed"]).default("pending").notNull(),
  priority: int("priority").default(1),
  requiresHitl: int("requiresHitl").default(0), // boolean as int
  hitlApproved: int("hitlApproved").default(0), // boolean as int
  dependencies: text("dependencies"), // JSON array of task IDs
  outputs: text("outputs"), // JSON object of results
  createdAt: timestamp("createdAt").defaultNow(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  estimatedHours: int("estimatedHours"),
  actualHours: int("actualHours"),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// Agent Actions - Audit log
export const agentActions = mysqlTable("agentActions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  agentId: varchar("agentId", { length: 64 }).references(() => agents.id),
  actionType: varchar("actionType", { length: 100 }).notNull(),
  taskId: varchar("taskId", { length: 64 }),
  details: text("details"), // JSON object
  createdAt: timestamp("createdAt").defaultNow(),
});

export type AgentAction = typeof agentActions.$inferSelect;
export type InsertAgentAction = typeof agentActions.$inferInsert;

// HITL Requests - Human-in-the-loop approvals
export const hitlRequests = mysqlTable("hitlRequests", {
  id: varchar("id", { length: 64 }).primaryKey(),
  requestType: varchar("requestType", { length: 100 }).notNull(),
  requestedBy: varchar("requestedBy", { length: 64 }),
  directiveId: varchar("directiveId", { length: 64 }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  context: text("context"), // JSON object
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  humanResponse: text("humanResponse"),
  createdAt: timestamp("createdAt").defaultNow(),
  resolvedAt: timestamp("resolvedAt"),
});

export type HitlRequest = typeof hitlRequests.$inferSelect;
export type InsertHitlRequest = typeof hitlRequests.$inferInsert;

// Messages - Agent-to-agent and user communication
export const messages = mysqlTable("messages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  conversationId: varchar("conversationId", { length: 64 }),
  fromType: varchar("fromType", { length: 50 }).notNull(), // 'user', 'orchestrator', 'agent'
  fromId: varchar("fromId", { length: 64 }),
  toType: varchar("toType", { length: 50 }),
  toId: varchar("toId", { length: 64 }),
  messageType: varchar("messageType", { length: 50 }).notNull(), // 'chat', 'handoff', 'update', 'request'
  content: text("content").notNull(),
  metadata: text("metadata"), // JSON object
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Principles - Living document of operating principles
export const principles = mysqlTable("principles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  version: varchar("version", { length: 50 }).notNull(),
  content: text("content").notNull(), // Markdown
  updatedBy: varchar("updatedBy", { length: 64 }),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Principle = typeof principles.$inferSelect;
export type InsertPrinciple = typeof principles.$inferInsert;

// Goals - Strategic business goals
export const goals = mysqlTable("goals", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  targetValue: int("targetValue"),
  currentValue: int("currentValue").default(0),
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  quarter: varchar("quarter", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;

// Work Sessions - Track 24/7 operation
export const workSessions = mysqlTable("workSessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  directiveId: varchar("directiveId", { length: 64 }),
  agentsActive: int("agentsActive").default(0),
  tasksCompleted: int("tasksCompleted").default(0),
  costIncurred: int("costIncurred").default(0), // in cents
  summary: text("summary"),
  startedAt: timestamp("startedAt").defaultNow(),
  endedAt: timestamp("endedAt"),
});

export type WorkSession = typeof workSessions.$inferSelect;
export type InsertWorkSession = typeof workSessions.$inferInsert;
