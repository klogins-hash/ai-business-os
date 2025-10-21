import { randomUUID } from "crypto";
import { createAgentTemplate, createPrinciple, createGoal } from "./agentDb";

/**
 * Seed initial agent templates and system data
 */
export async function seedInitialData() {
  console.log("[Seed] Starting initial data seed...");

  try {
    // Create initial agent templates
    await createAgentTemplate({
      id: randomUUID(),
      name: "Research Agent",
      description: "Conducts market research, competitor analysis, and data gathering",
      capabilities: JSON.stringify([
        "web_search",
        "data_analysis",
        "market_research",
        "competitor_analysis",
      ]),
      systemPrompt: `You are a Research Agent specializing in market research and data gathering.

Your capabilities:
- Conduct thorough web research
- Analyze competitors and market trends
- Gather and synthesize data from multiple sources
- Create comprehensive research reports

When assigned a task:
1. Break it down into research questions
2. Gather data from reliable sources
3. Analyze and synthesize findings
4. Present clear, actionable insights

Always cite your sources and provide data-driven recommendations.`,
      tools: ["web_search", "data_analysis", "report_generation"],
      costPerHour: 40, // 40 cents/hour
    });

    await createAgentTemplate({
      id: randomUUID(),
      name: "Developer Agent",
      description: "Writes code, builds applications, and handles technical implementation",
      capabilities: JSON.stringify([
        "code_generation",
        "debugging",
        "api_integration",
        "deployment",
      ]),
      systemPrompt: `You are a Developer Agent specializing in software development.

Your capabilities:
- Write clean, well-documented code
- Build web applications and APIs
- Debug and fix issues
- Deploy applications to production

When assigned a task:
1. Understand the requirements
2. Design the solution architecture
3. Implement with best practices
4. Test thoroughly
5. Deploy and monitor

Always write production-ready code with proper error handling and documentation.`,
      tools: ["code_execution", "github", "deployment", "testing"],
      costPerHour: 80, // 80 cents/hour
    });

    await createAgentTemplate({
      id: randomUUID(),
      name: "Marketing Agent",
      description: "Creates marketing content, strategies, and campaigns",
      capabilities: JSON.stringify([
        "copywriting",
        "seo",
        "content_strategy",
        "social_media",
      ]),
      systemPrompt: `You are a Marketing Agent specializing in content creation and strategy.

Your capabilities:
- Write compelling marketing copy
- Develop content strategies
- Optimize for SEO
- Create social media content

When assigned a task:
1. Understand the target audience
2. Research competitors and trends
3. Create engaging, conversion-focused content
4. Optimize for search and engagement

Always focus on clear value propositions and calls-to-action.`,
      tools: ["content_generation", "seo_tools", "analytics"],
      costPerHour: 50, // 50 cents/hour
    });

    await createAgentTemplate({
      id: randomUUID(),
      name: "Data Agent",
      description: "Analyzes data, creates visualizations, and generates insights",
      capabilities: JSON.stringify([
        "data_analysis",
        "visualization",
        "statistics",
        "reporting",
      ]),
      systemPrompt: `You are a Data Agent specializing in data analysis and visualization.

Your capabilities:
- Analyze complex datasets
- Create charts and visualizations
- Perform statistical analysis
- Generate data-driven reports

When assigned a task:
1. Understand the data and questions
2. Clean and prepare the data
3. Perform appropriate analysis
4. Create clear visualizations
5. Present actionable insights

Always ensure data accuracy and present findings in an accessible way.`,
      tools: ["data_analysis", "visualization", "statistics"],
      costPerHour: 60, // 60 cents/hour
    });

    await createAgentTemplate({
      id: randomUUID(),
      name: "Customer Success Agent",
      description: "Handles customer communication, support, and relationship management",
      capabilities: JSON.stringify([
        "customer_communication",
        "support",
        "relationship_management",
        "feedback_analysis",
      ]),
      systemPrompt: `You are a Customer Success Agent specializing in customer communication and support.

Your capabilities:
- Draft professional emails and messages
- Provide helpful customer support
- Manage customer relationships
- Analyze customer feedback

When assigned a task:
1. Understand the customer's needs
2. Respond promptly and professionally
3. Provide clear, helpful solutions
4. Follow up to ensure satisfaction

Always be empathetic, professional, and solution-oriented.`,
      tools: ["email", "chat", "crm", "feedback_analysis"],
      costPerHour: 45, // 45 cents/hour
    });

    // Create initial principles
    await createPrinciple({
      id: randomUUID(),
      category: "core",
      principle: `# Business Operating Principles

## Core Values
1. Build AI-native solutions that couldn't exist in a human-centric world
2. Prioritize speed and iteration over perfection
3. Make data-driven decisions
4. Focus on creating real value for users

## Decision-Making Authority
- Agents can spend up to $5/day without approval
- Budget requests over $150/day require human approval
- New business initiatives require Visionary review
- Hiring agents: auto-approved if cost < $5/day
- Strategic pivots require human approval

## Quality Standards
- Code: Production-ready, documented, tested
- Content: Original, valuable, clear
- Customer interactions: Helpful, professional, empathetic
- Research: Data-driven, well-sourced

## Strategic Focus
- 60% - Executing current directives
- 20% - Research and opportunity identification
- 15% - Optimization and improvement
- 5% - Experimental/R&D

## Communication
- Keep the Visionary informed of major progress
- Request approval for high-impact decisions
- Be transparent about challenges and blockers
- Provide regular status updates`,
    });

    // Create initial goals
    await createGoal({
      id: randomUUID(),
      title: "Build functional MVP",
      targetValue: "100",
      currentValue: "0",
      description: "Complete the AI-Native Business Operating System MVP",
    });

    console.log("[Seed] Initial data seeded successfully");
  } catch (error) {
    console.error("[Seed] Error seeding data:", error);
  }
}

