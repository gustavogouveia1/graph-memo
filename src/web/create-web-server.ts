import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import type { ChatImportProvider } from "../core/chat-import/chat-import-provider";
import { CHAT_IMPORT_PROVIDERS } from "../core/chat-import/chat-import-provider";
import { GraphMemoError } from "../core/errors/graphmemo-error";
import type { ProjectConfig } from "../shared/config/project-config";
import { createRuntimeServices } from "../shared/bootstrap/create-runtime-services";
import { renderWebUiHtml } from "./ui/render-web-ui";

interface JsonObject {
  [key: string]: unknown;
}

interface HttpErrorPayload {
  error_code: string;
  message: string;
  correlation_id: string;
}

export function createWebServer(config: ProjectConfig) {
  const services = createRuntimeServices(config);
  const html = renderWebUiHtml(
    config.workspaceRoot,
    join(config.workspaceRoot, "tests/fixtures/sample-workspace")
  );

  return createServer((request, response) => {
    void handleRequest(request, response, config, services, html);
  });
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  config: ProjectConfig,
  services: ReturnType<typeof createRuntimeServices>,
  html: string
): Promise<void> {
  if (request.method === "GET" && request.url === "/") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(html);
    return;
  }

  if (request.method === "GET" && request.url === "/api/meta") {
    writeJson(response, 200, {
      workspaceRoot: config.workspaceRoot,
      demoFixturePath: join(config.workspaceRoot, "tests/fixtures/sample-workspace")
    });
    return;
  }

  if (request.method === "POST" && request.url === "/api/index") {
    await runEndpoint(response, async () => {
      const body = await readJsonBody(request);
      const result = await services.runIndexUseCase.execute({
        targetPath: readString(body, "workspacePath", "."),
        fullReindex: readBoolean(body, "fullReindex", false),
        dryRun: readBoolean(body, "dryRun", false)
      });
      writeJson(response, 200, { result });
    });
    return;
  }

  if (request.method === "POST" && request.url === "/api/query") {
    await runEndpoint(response, async () => {
      const body = await readJsonBody(request);
      const input = {
        targetPath: readString(body, "workspacePath", "."),
        listFiles: readBoolean(body, "listFiles", false),
        caseSensitive: readBoolean(body, "caseSensitive", true),
        exactMatch: readBoolean(body, "exactMatch", true)
      };
      const symbol = readOptionalString(body, "symbol");
      const file = readOptionalString(body, "file");
      const moduleSource = readOptionalString(body, "module");
      const relatedTo = readOptionalString(body, "relatedTo");
      if (symbol !== undefined) {
        Object.assign(input, { symbol });
      }
      if (file !== undefined) {
        Object.assign(input, { file });
      }
      if (moduleSource !== undefined) {
        Object.assign(input, { moduleSource });
      }
      if (relatedTo !== undefined) {
        Object.assign(input, { relatedTo });
      }

      const result = await services.queryIndexUseCase.execute(input);
      writeJson(response, 200, { result });
    });
    return;
  }

  if (request.method === "POST" && request.url === "/api/import-chats") {
    await runEndpoint(response, async () => {
      const body = await readJsonBody(request);
      const provider = readString(body, "provider", "generic");
      if (!(CHAT_IMPORT_PROVIDERS as readonly string[]).includes(provider)) {
        throw new GraphMemoError(
          "IMPORT_CHATS_INVALID_PROVIDER",
          `Provider invalido: ${provider}. Use um destes: ${CHAT_IMPORT_PROVIDERS.join(", ")}.`
        );
      }

      const result = await services.importChatsUseCase.execute({
        source: readString(body, "source"),
        provider: provider as ChatImportProvider,
        dryRun: readBoolean(body, "dryRun", false),
        workspacePath: readString(body, "workspacePath", config.workspaceRoot)
      });
      writeJson(response, 200, { result });
    });
    return;
  }

  if (request.method === "POST" && request.url === "/api/context") {
    await runEndpoint(response, async () => {
      const body = await readJsonBody(request);
      const format = readString(body, "format", "markdown");
      if (format !== "markdown" && format !== "json") {
        throw new GraphMemoError("CONTEXT_INVALID_INPUT", "Formato invalido. Use markdown ou json.");
      }
      const outputFormat: "markdown" | "json" = format;

      const input = {
        targetPath: readString(body, "workspacePath", "."),
        task: readString(body, "task"),
        format: outputFormat,
        caseSensitive: readBoolean(body, "caseSensitive", false),
        exactMatch: readBoolean(body, "exactMatch", false)
      };
      const symbol = readOptionalString(body, "symbol");
      const file = readOptionalString(body, "file");
      const moduleSource = readOptionalString(body, "module");
      if (symbol !== undefined) {
        Object.assign(input, { symbol });
      }
      if (file !== undefined) {
        Object.assign(input, { file });
      }
      if (moduleSource !== undefined) {
        Object.assign(input, { moduleSource });
      }

      const result = await services.buildContextUseCase.execute(input);
      writeJson(response, 200, { result });
    });
    return;
  }

  writeJson(response, 404, {
    error_code: "HTTP_NOT_FOUND",
    message: "Rota nao encontrada.",
    correlation_id: randomUUID()
  });
}

async function runEndpoint(response: ServerResponse, action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error: unknown) {
    const payload = buildErrorPayload(error);
    writeJson(response, mapErrorToStatusCode(error), payload);
  }
}

function buildErrorPayload(error: unknown): HttpErrorPayload {
  if (error instanceof GraphMemoError) {
    return {
      error_code: error.code,
      message: error.message,
      correlation_id: randomUUID()
    };
  }

  return {
    error_code: "HTTP_INTERNAL_ERROR",
    message: "Erro inesperado na camada web do Graph-Memo.",
    correlation_id: randomUUID()
  };
}

function mapErrorToStatusCode(error: unknown): number {
  if (!(error instanceof GraphMemoError)) {
    return 500;
  }
  if (
    error.code.endsWith("_INVALID_INPUT") ||
    error.code.endsWith("_INVALID_PROVIDER") ||
    error.code === "HTTP_INVALID_JSON"
  ) {
    return 400;
  }
  if (error.code.endsWith("_NOT_FOUND")) {
    return 404;
  }
  if (error.code.endsWith("_CORRUPTED")) {
    return 409;
  }
  return 500;
}

async function readJsonBody(request: IncomingMessage): Promise<JsonObject> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    if (typeof chunk === "string") {
      chunks.push(Buffer.from(chunk));
      continue;
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (raw.length === 0) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("json-body-precisa-ser-objeto");
    }
    return parsed as JsonObject;
  } catch (error: unknown) {
    throw new GraphMemoError(
      "HTTP_INVALID_JSON",
      "Payload JSON invalido. Envie um objeto JSON valido.",
      error
    );
  }
}

function readString(body: JsonObject, key: string, fallback?: string): string {
  const value = body[key];
  if (typeof value === "string") {
    return value;
  }
  if (fallback !== undefined) {
    return fallback;
  }
  throw new GraphMemoError("HTTP_INVALID_JSON", `Campo obrigatorio ausente ou invalido: ${key}.`);
}

function readOptionalString(body: JsonObject, key: string): string | undefined {
  const value = body[key];
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === "string") {
    return value;
  }
  throw new GraphMemoError("HTTP_INVALID_JSON", `Campo invalido: ${key}.`);
}

function readBoolean(body: JsonObject, key: string, fallback: boolean): boolean {
  const value = body[key];
  if (value === undefined || value === null) {
    return fallback;
  }
  if (typeof value === "boolean") {
    return value;
  }
  throw new GraphMemoError("HTTP_INVALID_JSON", `Campo booleano invalido: ${key}.`);
}

function writeJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload, null, 2));
}
