export const SUPPORTED_TASKS = ["index", "query", "context", "import-chats"] as const;

export type TaskKind = (typeof SUPPORTED_TASKS)[number];

export interface TaskExecution {
  kind: TaskKind;
  status: "stub" | "success" | "error";
  message: string;
  details?: unknown;
}
