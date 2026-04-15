import type { TaskExecution } from "../../core/tasks/task-execution";

export function printTaskExecution(result: TaskExecution): void {
  console.log(`${result.kind}: ${result.message}`);
}
