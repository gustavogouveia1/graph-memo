import type { AddressInfo } from "node:net";

import { afterEach, describe, expect, it } from "vitest";

import { createWebServer } from "../../src/web/create-web-server";
import {
  cleanupTempDirectories,
  createFixtureConfig,
  createWorkspaceFromFixture
} from "./cli-e2e-helpers";

const tempDirectories: string[] = [];

describe("Web API e2e (camada fina sobre use cases)", () => {
  afterEach(async () => {
    await cleanupTempDirectories(tempDirectories);
  });

  it("executa index e query com sucesso via HTTP", async () => {
    const workspace = await createWorkspaceFromFixture(tempDirectories);
    const { baseUrl, close } = await startTestServer(workspace);

    try {
      const indexResponse = await postJson(baseUrl, "/api/index", {
        workspacePath: workspace
      });
      const indexBody = indexResponse.body as { result: { kind: string } };
      expect(indexResponse.status).toBe(200);
      expect(indexBody.result.kind).toBe("index");

      const queryResponse = await postJson(baseUrl, "/api/query", {
        workspacePath: workspace,
        symbol: "calculateCommission"
      });
      const queryBody = queryResponse.body as {
        result: {
          kind: string;
          details: { filesBySymbol: string[] };
        };
      };
      expect(queryResponse.status).toBe(200);
      expect(queryBody.result.kind).toBe("query");
      expect(queryBody.result.details.filesBySymbol).toContain("src/domain/commission-policy.ts");
    } finally {
      await close();
    }
  });

  it("retorna erro tipado quando query nao recebe filtros", async () => {
    const workspace = await createWorkspaceFromFixture(tempDirectories);
    const { baseUrl, close } = await startTestServer(workspace);

    try {
      const response = await postJson(baseUrl, "/api/query", {
        workspacePath: workspace
      });
      const body = response.body as {
        error_code: string;
        message: string;
        correlation_id: string;
      };
      expect(response.status).toBe(400);
      expect(body.error_code).toBe("QUERY_INVALID_INPUT");
      expect(body.message).toContain("Informe ao menos um filtro");
      expect(typeof body.correlation_id).toBe("string");
    } finally {
      await close();
    }
  });

  it("retorna camada de refinamento opcional sem quebrar contexto base", async () => {
    const workspace = await createWorkspaceFromFixture(tempDirectories);
    const { baseUrl, close } = await startTestServer(workspace);

    try {
      const indexResponse = await postJson(baseUrl, "/api/index", { workspacePath: workspace });
      expect(indexResponse.status).toBe(200);

      const response = await postJson(baseUrl, "/api/context", {
        workspacePath: workspace,
        task: "corrigir calculo de comissao premium",
        refineWithClaude: true
      });
      const body = response.body as {
        result: {
          details: {
            deterministicContext: {
              relevantFiles: string[];
            };
            refinement: {
              status: string;
              reasonCode: string;
            };
          };
        };
      };

      expect(response.status).toBe(200);
      expect(body.result.details.deterministicContext.relevantFiles).toContain(
        "src/domain/commission-policy.ts"
      );
      expect(body.result.details.refinement.status).toBe("skipped");
      expect(body.result.details.refinement.reasonCode).toBe("AI_REFINEMENT_DISABLED");
    } finally {
      await close();
    }
  });
});

async function startTestServer(workspaceRoot: string) {
  const server = createWebServer(createFixtureConfig(workspaceRoot));
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error !== undefined) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    }
  };
}

async function postJson(baseUrl: string, path: string, payload: Record<string, unknown>) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const body = (await response.json()) as Record<string, unknown>;
  return {
    status: response.status,
    body
  };
}
