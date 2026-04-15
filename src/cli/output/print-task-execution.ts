import type { TaskExecution } from "../../core/tasks/task-execution";

export function printTaskExecution(result: TaskExecution): void {
  const status = result.status.toUpperCase();
  console.log(`[${status}] ${result.kind}: ${result.message}`);

  if (result.details !== undefined) {
    console.log(JSON.stringify(result.details, null, 2));
  }
}
