import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeResponse {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Call Claude Sonnet 4.5 for agent reasoning
 */
export async function callClaude(params: {
  systemPrompt: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  temperature?: number;
}): Promise<ClaudeResponse> {
  const { systemPrompt, messages, maxTokens = 4096, temperature = 1.0 } = params;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514", // Claude Sonnet 4.5 (Oct 2025)
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    return {
      content: content.text,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    };
  } catch (error) {
    console.error("[Claude] Error:", error);
    throw error;
  }
}

/**
 * Call Claude with structured JSON output
 */
export async function callClaudeStructured<T>(params: {
  systemPrompt: string;
  messages: ClaudeMessage[];
  schema: {
    name: string;
    description: string;
    input_schema: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
  maxTokens?: number;
}): Promise<T> {
  const { systemPrompt, messages, schema, maxTokens = 4096 } = params;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      tools: [
        {
          name: schema.name,
          description: schema.description,
          input_schema: schema.input_schema,
        },
      ],
      tool_choice: { type: "tool", name: schema.name },
    });

    // Find the tool use block
    const toolUse = response.content.find((block: any) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("No tool use found in response");
    }

    return toolUse.input as T;
  } catch (error) {
    console.error("[Claude Structured] Error:", error);
    throw error;
  }
}

