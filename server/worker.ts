import { MagenticManager } from "./orchestrator";
import { getActiveDirectives } from "./agentDb";

/**
 * Background worker for 24/7 autonomous operation
 * 
 * This runs the strategic loop for all active directives periodically
 */

const LOOP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let isRunning = false;

export async function startWorker() {
  if (isRunning) {
    console.log("[Worker] Already running");
    return;
  }

  isRunning = true;
  console.log("[Worker] Starting 24/7 autonomous worker");
  console.log(`[Worker] Loop interval: ${LOOP_INTERVAL / 1000 / 60} minutes`);

  // Run immediately on start
  await runWorkerLoop();

  // Then run periodically
  setInterval(async () => {
    await runWorkerLoop();
  }, LOOP_INTERVAL);
}

async function runWorkerLoop() {
  try {
    console.log("[Worker] Running strategic loop for all active directives");

    const directives = await getActiveDirectives();
    
    if (directives.length === 0) {
      console.log("[Worker] No active directives");
      return;
    }

    console.log(`[Worker] Found ${directives.length} active directive(s)`);

    // Run strategic loop for each directive
    for (const directive of directives) {
      try {
        const manager = new MagenticManager();
        await manager.strategicLoop(directive);
        console.log(`[Worker] Completed loop for directive: ${directive.title}`);
      } catch (error) {
        console.error(`[Worker] Error in loop for directive ${directive.id}:`, error);
      }
    }

    console.log("[Worker] Loop completed");
  } catch (error) {
    console.error("[Worker] Error in worker loop:", error);
  }
}

export function stopWorker() {
  isRunning = false;
  console.log("[Worker] Stopped");
}

