import type { LogLevel, Logger } from "../../application/ports/logger";

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

export class ConsoleLogger implements Logger {
  constructor(private readonly level: LogLevel) {}

  debug(message: string, context?: Record<string, unknown>): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log("error", message, context);
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (LOG_LEVEL_ORDER[level] < LOG_LEVEL_ORDER[this.level]) {
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      level,
      service: "graphmemo-cli",
      operation: "command",
      message,
      context
    };

    const serializedPayload = JSON.stringify(payload);

    if (level === "error") {
      console.error(serializedPayload);
      return;
    }

    console.log(serializedPayload);
  }
}
