import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Observatory routers
  directive: router({
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        strategicContext: z.string(),
        targetCompletion: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createDirective } = await import("./agentDb");
        const { randomUUID } = await import("crypto");
        return createDirective({
          id: randomUUID(),
          title: input.title,
          description: input.description,
          strategicContext: input.strategicContext,
          targetCompletion: input.targetCompletion ? new Date(input.targetCompletion) : undefined,
        });
      }),
    list: protectedProcedure.query(async () => {
      const { getActiveDirectives } = await import("./agentDb");
      return getActiveDirectives();
    }),
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const { getDirective } = await import("./agentDb");
        return getDirective(input.id);
      }),
  }),

  agent: router({
    list: protectedProcedure.query(async () => {
      const { getActiveAgents } = await import("./agentDb");
      return getActiveAgents();
    }),
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const { getAgent } = await import("./agentDb");
        return getAgent(input.id);
      }),
  }),

  task: router({
    list: protectedProcedure.query(async () => {
      const { getPendingTasks } = await import("./agentDb");
      return getPendingTasks();
    }),
    byDirective: protectedProcedure
      .input(z.object({ directiveId: z.string() }))
      .query(async ({ input }) => {
        const { getTasksByDirective } = await import("./agentDb");
        return getTasksByDirective(input.directiveId);
      }),
  }),

  hitl: router({
    list: protectedProcedure.query(async () => {
      const { getPendingHitlRequests } = await import("./agentDb");
      return getPendingHitlRequests();
    }),
    approve: protectedProcedure
      .input(z.object({
        id: z.string(),
        response: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateHitlRequest } = await import("./agentDb");
        await updateHitlRequest(input.id, {
          status: "approved",
          decision: input.response,
          resolvedAt: new Date(),
        });
        return { success: true };
      }),
    reject: protectedProcedure
      .input(z.object({
        id: z.string(),
        response: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateHitlRequest } = await import("./agentDb");
        await updateHitlRequest(input.id, {
          status: "rejected",
          decision: input.response,
          resolvedAt: new Date(),
        });
        return { success: true };
      }),
  }),

  message: router({
    list: protectedProcedure
      .input(z.object({
        conversationId: z.string().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const { getMessagesByConversation, getRecentMessages } = await import("./agentDb");
        if (input.conversationId) {
          return getMessagesByConversation(input.conversationId, input.limit);
        }
        return getRecentMessages(input.limit);
      }),
    send: protectedProcedure
      .input(z.object({
        content: z.string(),
        directiveId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { MagenticManager } = await import("./orchestrator");
        const manager = new MagenticManager();
        const response = await manager.processUserMessage(input.content, input.directiveId);
        return { response };
      }),
  }),

  orchestrator: router({
    runStrategicLoop: protectedProcedure
      .input(z.object({ directiveId: z.string() }))
      .mutation(async ({ input }) => {
        const { MagenticManager } = await import("./orchestrator");
        const { getDirective } = await import("./agentDb");
        const directive = await getDirective(input.directiveId);
        if (!directive) throw new Error("Directive not found");
        
        const manager = new MagenticManager();
        await manager.strategicLoop(directive);
        return { success: true };
      }),
  }),

  observatory: router({
    seed: protectedProcedure.mutation(async () => {
      const { seedInitialData } = await import("./seedData");
      await seedInitialData();
      return { success: true };
    }),
    principles: protectedProcedure.query(async () => {
      const { getLatestPrinciple } = await import("./agentDb");
      return getLatestPrinciple();
    }),
    goals: protectedProcedure.query(async () => {
      const { getActiveGoals } = await import("./agentDb");
      return getActiveGoals();
    }),
  }),
});

export type AppRouter = typeof appRouter;
