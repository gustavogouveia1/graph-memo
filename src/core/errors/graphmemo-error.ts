export class GraphMemoError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "GraphMemoError";
  }
}
