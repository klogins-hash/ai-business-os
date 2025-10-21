import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  directives,
  agentTemplates,
  agents,
  tasks,
  agentActions,
  hitlRequests,
  messages,
  principles,
  goals,
  workSessions,
  type Directive,
  type InsertDirective,
  type AgentTemplate,
  type InsertAgentTemplate,
  type Agent,
  type InsertAgent,
  type Task,
  type InsertTask,
  type AgentAction,
  type InsertAgentAction,
  type HitlRequest,
  type InsertHitlRequest,
  type Message,
  type InsertMessage,
  type Principle,
  type InsertPrinciple,
  type Goal,
  type InsertGoal,
} from "../drizzle/schema";

// ============================================================================
// DIRECTIVES
// ============================================================================

export async function createDirective(data: InsertDirective): Promise<Directive> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(directives).values(data);
  const result = await db.select().from(directives).where(eq(directives.id, data.id!)).limit(1);
  return result[0]!;
}

export async function getDirective(id: string): Promise<Directive | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(directives).where(eq(directives.id, id)).limit(1);
  return result[0];
}

export async function getActiveDirectives(): Promise<Directive[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(directives).where(eq(directives.status, "active"));
}

export async function updateDirective(id: string, data: Partial<InsertDirective>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(directives).set(data).where(eq(directives.id, id));
}

// ============================================================================
// AGENT TEMPLATES
// ============================================================================

export async function createAgentTemplate(data: InsertAgentTemplate): Promise<AgentTemplate> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(agentTemplates).values(data);
  const result = await db.select().from(agentTemplates).where(eq(agentTemplates.id, data.id!)).limit(1);
  return result[0]!;
}

export async function getAgentTemplate(id: string): Promise<AgentTemplate | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(agentTemplates).where(eq(agentTemplates.id, id)).limit(1);
  return result[0];
}

export async function getAgentTemplateByName(name: string): Promise<AgentTemplate | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(agentTemplates).where(eq(agentTemplates.name, name)).limit(1);
  return result[0];
}

export async function getAllAgentTemplates(): Promise<AgentTemplate[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(agentTemplates);
}

// ============================================================================
// AGENTS
// ============================================================================

export async function createAgent(data: InsertAgent): Promise<Agent> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(agents).values(data);
  const result = await db.select().from(agents).where(eq(agents.id, data.id!)).limit(1);
  return result[0]!;
}

export async function getAgent(id: string): Promise<Agent | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return result[0];
}

export async function getActiveAgents(): Promise<Agent[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(agents).where(eq(agents.status, "active"));
}

export async function updateAgent(id: string, data: Partial<InsertAgent>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(agents).set(data).where(eq(agents.id, id));
}

// ============================================================================
// TASKS
// ============================================================================

export async function createTask(data: InsertTask): Promise<Task> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(tasks).values(data);
  const result = await db.select().from(tasks).where(eq(tasks.id, data.id!)).limit(1);
  return result[0]!;
}

export async function getTask(id: string): Promise<Task | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result[0];
}

export async function getTasksByDirective(directiveId: string): Promise<Task[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(tasks).where(eq(tasks.directiveId, directiveId));
}

export async function getTasksByAgent(agentId: string): Promise<Task[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(tasks).where(eq(tasks.assignedTo, agentId));
}

export async function getPendingTasks(): Promise<Task[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(tasks).where(eq(tasks.status, "pending")).orderBy(desc(tasks.priority));
}

export async function updateTask(id: string, data: Partial<InsertTask>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(tasks).set(data).where(eq(tasks.id, id));
}

// ============================================================================
// AGENT ACTIONS
// ============================================================================

export async function logAgentAction(data: InsertAgentAction): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(agentActions).values(data);
}

export async function getAgentActions(agentId: string, limit = 50): Promise<AgentAction[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(agentActions)
    .where(eq(agentActions.agentId, agentId))
    .orderBy(desc(agentActions.createdAt))
    .limit(limit);
}

// ============================================================================
// HITL REQUESTS
// ============================================================================

export async function createHitlRequest(data: InsertHitlRequest): Promise<HitlRequest> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(hitlRequests).values(data);
  const result = await db.select().from(hitlRequests).where(eq(hitlRequests.id, data.id!)).limit(1);
  return result[0]!;
}

export async function getPendingHitlRequests(): Promise<HitlRequest[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(hitlRequests)
    .where(eq(hitlRequests.status, "pending"))
    .orderBy(desc(hitlRequests.createdAt));
}

export async function updateHitlRequest(id: string, data: Partial<InsertHitlRequest>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(hitlRequests).set(data).where(eq(hitlRequests.id, id));
}

// ============================================================================
// MESSAGES
// ============================================================================

export async function createMessage(data: InsertMessage): Promise<Message> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(messages).values(data);
  const result = await db.select().from(messages).where(eq(messages.id, data.id!)).limit(1);
  return result[0]!;
}

export async function getMessagesByConversation(conversationId: string, limit = 100): Promise<Message[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

export async function getRecentMessages(limit = 50): Promise<Message[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(messages)
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

// ============================================================================
// PRINCIPLES
// ============================================================================

export async function createPrinciple(data: InsertPrinciple): Promise<Principle> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(principles).values(data);
  const result = await db.select().from(principles).where(eq(principles.id, data.id!)).limit(1);
  return result[0]!;
}

export async function getLatestPrinciple(): Promise<Principle | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(principles)
    .orderBy(desc(principles.updatedAt))
    .limit(1);
  return result[0];
}

// ============================================================================
// GOALS
// ============================================================================

export async function createGoal(data: InsertGoal): Promise<Goal> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(goals).values(data);
  const result = await db.select().from(goals).where(eq(goals.id, data.id!)).limit(1);
  return result[0]!;
}

export async function getActiveGoals(): Promise<Goal[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(goals).where(eq(goals.id, "active"));
}

export async function updateGoal(id: string, data: Partial<InsertGoal>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(goals).set(data).where(eq(goals.id, id));
}

