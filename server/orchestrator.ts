import { randomUUID } from "crypto";
import { callClaude, callClaudeStructured } from "./claude";
import {
  createAgent,
  createTask,
  createHitlRequest,
  createMessage,
  logAgentAction,
  getActiveAgents,
  getTasksByDirective,
  getPendingTasks,
  updateTask,
  updateAgent,
  getAgentTemplate,
  getAgentTemplateByName,
  createAgentTemplate,
  getLatestPrinciple,
  getActiveGoals,
} from "./agentDb";
import type { Directive, Agent, Task } from "../drizzle/schema";

/**
 * Magentic Manager - The AI CEO/Orchestrator
 * 
 * Responsibilities:
 * - Analyze strategic directives
 * - Make decisions about team composition
 * - Hire/fire agents dynamically
 * - Delegate tasks to agents
 * - Monitor progress
 * - Request HITL approval when needed
 */
export class MagenticManager {
  private orchestratorId = "orchestrator-001";
  private conversationId: string;

  constructor(conversationId?: string) {
    this.conversationId = conversationId || randomUUID();
  }

  /**
   * Main strategic decision loop
   * This runs periodically to assess situation and make decisions
   */
  async strategicLoop(directive: Directive): Promise<void> {
    console.log(`[Orchestrator] Running strategic loop for directive: ${directive.title}`);

    try {
      // 1. Assess current state
      const state = await this.assessSituation(directive);

      // 2. Make strategic decisions
      const decisions = await this.makeDecisions(state);

      // 3. Execute decisions
      for (const decision of decisions) {
        await this.executeDecision(decision);
      }

      // 4. Log the loop completion
      await logAgentAction({
        id: randomUUID(),
        agentId: this.orchestratorId,
        action: "strategic_loop_completed",
        details: JSON.stringify({ directiveId: directive.id, decisionsCount: decisions.length }),
      });
    } catch (error) {
      console.error("[Orchestrator] Error in strategic loop:", error);
      await logAgentAction({
        id: randomUUID(),
        agentId: this.orchestratorId,
        action: "strategic_loop_error",
        details: JSON.stringify({ error: String(error) }),
      });
    }
  }

  /**
   * Assess the current situation
   */
  private async assessSituation(directive: Directive) {
    const agents = await getActiveAgents();
    const tasks = await getTasksByDirective(directive.id);
    const pendingTasks = await getPendingTasks();
    const principles = await getLatestPrinciple();
    const goals = await getActiveGoals();

    const completedTasks = tasks.filter((t) => t.status === "completed");
    const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
    const blockedTasks = tasks.filter((t) => t.status === "blocked");

    return {
      directive,
      agents,
      tasks,
      pendingTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      principles: principles?.principle || "No principles set",
      goals,
      teamSize: agents.length,
      progress: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
    };
  }

  /**
   * Make strategic decisions using Claude Sonnet 4.5
   */
  private async makeDecisions(state: any): Promise<Decision[]> {
    const systemPrompt = `You are the Magentic Manager, an AI CEO managing an autonomous team of AI agents.

Your role:
- Analyze the current situation
- Make strategic decisions about team composition and task allocation
- Hire new agents when needed
- Delegate tasks to appropriate agents
- Request human approval for major decisions (HITL)

Operating Principles:
${state.principles}

Current Goals:
${state.goals.map((g: any) => `- ${g.title}: ${g.currentValue}/${g.targetValue}`).join("\n")}

You must make decisions that move the directive forward efficiently.`;

    const userMessage = `Current Situation:

Directive: ${state.directive.title}
Description: ${state.directive.description}
Strategic Context: ${state.directive.strategicContext}

Team Status:
- Total agents: ${state.teamSize}
- Active agents: ${state.agents.filter((a: any) => a.status === "active").length}
- Idle agents: ${state.agents.filter((a: any) => a.status === "idle").length}

Task Status:
- Total tasks: ${state.tasks.length}
- Completed: ${state.completedTasks.length}
- In Progress: ${state.inProgressTasks.length}
- Pending: ${state.pendingTasks.length}
- Blocked: ${state.blockedTasks.length}

Progress: ${state.progress.toFixed(1)}%

Current Team:
${state.agents.map((a: any) => `- ${a.name} (${a.status}) - Template: ${a.templateId}`).join("\n")}

Analyze this situation and make strategic decisions. Consider:
1. Do we need to hire new agents? What type?
2. Should we create new tasks?
3. Should we reallocate agents?
4. Are there blockers to address?
5. Do we need human approval for anything?

Respond with a list of decisions.`;

    try {
      const decisions = await callClaudeStructured<{ decisions: Decision[] }>({
        systemPrompt,
        messages: [{ role: "user", content: userMessage }],
        schema: {
          name: "strategic_decisions",
          description: "Strategic decisions made by the Magentic Manager",
          input_schema: {
            type: "object",
            properties: {
              decisions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["hire_agent", "create_task", "reallocate_agent", "request_hitl", "update_status"],
                    },
                    reasoning: { type: "string" },
                    data: { type: "object" },
                  },
                  required: ["type", "reasoning", "data"],
                },
              },
            },
            required: ["decisions"],
          },
        },
        maxTokens: 4096,
      });

      return decisions.decisions;
    } catch (error) {
      console.error("[Orchestrator] Error making decisions:", error);
      return [];
    }
  }

  /**
   * Execute a strategic decision
   */
  private async executeDecision(decision: Decision): Promise<void> {
    console.log(`[Orchestrator] Executing decision: ${decision.type}`);

    try {
      switch (decision.type) {
        case "hire_agent":
          await this.hireAgent(decision.data as HireAgentData);
          break;
        case "create_task":
          await this.createTask(decision.data as CreateTaskData);
          break;
        case "reallocate_agent":
          await this.reallocateAgent(decision.data as ReallocateAgentData);
          break;
        case "request_hitl":
          await this.requestHitl(decision.data as RequestHitlData);
          break;
        case "update_status":
          await this.updateStatus(decision.data as UpdateStatusData);
          break;
      }

      // Log the decision execution
      await logAgentAction({
        id: randomUUID(),
        agentId: this.orchestratorId,
        action: `decision_executed_${decision.type}`,
        details: JSON.stringify(decision),
      });
    } catch (error) {
      console.error(`[Orchestrator] Error executing decision ${decision.type}:`, error);
    }
  }

  /**
   * Hire a new agent
   */
  private async hireAgent(data: HireAgentData): Promise<void> {
    console.log(`[Orchestrator] Hiring agent: ${data.agentType}`);

    // Check if template exists
    let template = await getAgentTemplateByName(data.agentType);

    // If not, create a custom template
    if (!template) {
      template = await this.createCustomAgentTemplate(data.agentType, data.specialization);
    }

    // Check if we need HITL approval based on cost
    const dailyCost = ((template?.costPerHour || 50) * 24) / 100; // Convert cents to dollars
    if (dailyCost > 5) {
      // Request approval for expensive agents
      await createHitlRequest({
        id: randomUUID(),
        type: "agent_hiring",
        requestedBy: this.orchestratorId,
        title: `Hire ${data.agentType} Agent`,
        description: `Cost: $${dailyCost.toFixed(2)}/day\nReason: ${data.reason}`,
        status: "pending",
      });
      return;
    }

    // Create the agent
    const agent = await createAgent({
      id: randomUUID(),
      templateId: template!.id,
      name: data.name || `${data.agentType} #${Date.now()}`,
      status: "idle",
      specialization: data.specialization,
      hiredBy: this.orchestratorId,
    });

    // Send message about the hire
    await createMessage({
      id: randomUUID(),
      conversationId: this.conversationId,
      role: "assistant",
      content: `✅ Hired new agent: ${agent.name}\nReason: ${data.reason}`,
    });

    console.log(`[Orchestrator] Agent hired: ${agent.id}`);
  }

  /**
   * Create a custom agent template
   */
  private async createCustomAgentTemplate(agentType: string, specialization?: string): Promise<any> {
    const systemPrompt = `You are a ${agentType} agent${specialization ? ` specializing in ${specialization}` : ""}.

Your role is to execute tasks assigned to you by the Magentic Manager.

You have access to various tools and should use them to complete your tasks effectively.

Always provide detailed updates on your progress.`;

    const template = await createAgentTemplate({
      id: randomUUID(),
      name: agentType,
      description: `${agentType} agent${specialization ? ` - ${specialization}` : ""}`,
      capabilities: [agentType.toLowerCase(), "task_execution"],
      systemPrompt,
      tools: ["web_search", "code_execution", "file_operations"],
      costPerHour: 50, // Default 50 cents/hour
    });

    return template;
  }

  /**
   * Create a new task
   */
  private async createTask(data: CreateTaskData): Promise<void> {
    const task = await createTask({
      id: randomUUID(),
      directiveId: data.directiveId,
      title: data.title,
      description: data.description,
      assignedAgentId: data.assignedTo,
      status: "pending",
      priority: data.priority || 1,
    });

    // Send message about task creation
    await createMessage({
      id: randomUUID(),
      conversationId: this.conversationId,
      role: "assistant",
      content: `📋 New task assigned: ${task.title}`,
      metadata: JSON.stringify({ taskId: task.id }),
    });

    console.log(`[Orchestrator] Task created: ${task.id}`);
  }

  /**
   * Reallocate an agent to a different task
   */
  private async reallocateAgent(data: ReallocateAgentData): Promise<void> {
    await updateAgent(data.agentId, {
      currentTask: data.newTaskId,
      status: "busy",
    });

    await updateTask(data.newTaskId, {
      assignedAgentId: data.agentId,
      status: "in_progress",
    });

    console.log(`[Orchestrator] Agent ${data.agentId} reallocated to task ${data.newTaskId}`);
  }

  /**
   * Request human-in-the-loop approval
   */
  private async requestHitl(data: RequestHitlData): Promise<void> {
    await createHitlRequest({
      id: randomUUID(),
      type: data.requestType as "budget_approval" | "strategic_pivot" | "agent_hiring" | "high_risk_decision",
      requestedBy: this.orchestratorId,
      title: data.title,
      description: data.description,
      status: "pending",
    });

    // Send message to user
    await createMessage({
      id: randomUUID(),
      conversationId: this.conversationId,
      role: "assistant",
      content: `🚨 Approval needed: ${data.title}\n\n${data.description}`,
    });

    console.log(`[Orchestrator] HITL request created: ${data.title}`);
  }

  /**
   * Update status/progress
   */
  private async updateStatus(data: UpdateStatusData): Promise<void> {
    // Send progress update to user
    await createMessage({
      id: randomUUID(),
      conversationId: this.conversationId,
      role: "assistant",
      content: data.message,
    });

    console.log(`[Orchestrator] Status update: ${data.message}`);
  }

  /**
   * Process a user message and respond
   */
  async processUserMessage(message: string, directiveId?: string): Promise<string> {
    const systemPrompt = `You are the Magentic Manager, an AI CEO managing an autonomous team of AI agents.

You are having a conversation with the user (the Visionary/Strategist).

Your role:
- Understand their strategic directives
- Provide updates on progress
- Ask clarifying questions
- Explain your decisions
- Be professional but conversational

Always be helpful and transparent about what the team is working on.`;

    try {
      const response = await callClaude({
        systemPrompt,
        messages: [{ role: "user", content: message }],
        maxTokens: 2048,
      });

      // Store the conversation
      await createMessage({
        id: randomUUID(),
        conversationId: this.conversationId,
        role: "user",
        content: message,
      });

      await createMessage({
        id: randomUUID(),
        conversationId: this.conversationId,
        role: "assistant",
        content: response.principle,
      });

      return response.principle;
    } catch (error) {
      console.error("[Orchestrator] Error processing user message:", error);
      return "I apologize, but I encountered an error processing your message. Please try again.";
    }
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface Decision {
  type: "hire_agent" | "create_task" | "reallocate_agent" | "request_hitl" | "update_status";
  reasoning: string;
  data: any;
}

interface HireAgentData {
  agentType: string;
  name?: string;
  specialization?: string;
  reason: string;
}

interface CreateTaskData {
  directiveId: string;
  title: string;
  description: string;
  assignedTo?: string;
  priority?: number;
  requiresHitl?: boolean;
}

interface ReallocateAgentData {
  agentId: string;
  newTaskId: string;
}

interface RequestHitlData {
  requestType: string;
  title: string;
  description: string;
}

interface UpdateStatusData {
  message: string;
}

