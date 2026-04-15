export const SUPPORTED_TASKS = ["index", "context", "import-chats"] as const;

export type TaskKind = (typeof SUPPORTED_TASKS)[number];

export interface TaskExecution {
  kind: TaskKind;
  status: "stub";
  message: string;
}
