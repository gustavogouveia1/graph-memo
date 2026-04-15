import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import { loadProjectConfig } from "../../src/shared/config/load-project-config";
import { PROJECT_CONFIG_FILE } from "../../src/shared/config/project-config";

const tempDirectories: string[] = [];

async function createTempWorkspace(): Promise<string> {
  const workspace = await mkdtemp(join(tmpdir(), "graphmemo-"));
  tempDirectories.push(workspace);
  return workspace;
}

describe("loadProjectConfig", () => {
  afterEach(async () => {
    await Promise.all(
      tempDirectories.map(async (workspace) => {
        await rm(workspace, { recursive: true, force: true });
      })
    );
    tempDirectories.length = 0;
  });

  it("retorna defaults quando arquivo de config nao existe", async () => {
    const workspace = await createTempWorkspace();

    const config = await loadProjectConfig(workspace);

    expect(config).toMatchObject({
      workspaceRoot: workspace,
      docsDir: "docs",
      knowledgeDir: "knowledge",
      stateDir: ".graphmemo",
      logLevel: "info"
    });
  });

  it("mescla config local com defaults", async () => {
    const workspace = await createTempWorkspace();
    const configPath = join(workspace, PROJECT_CONFIG_FILE);

    await writeFile(
      configPath,
      JSON.stringify({
        docsDir: "engineering",
        logLevel: "debug"
      }),
      "utf8"
    );

    const config = await loadProjectConfig(workspace);

    expect(config).toMatchObject({
      workspaceRoot: workspace,
      docsDir: "engineering",
      knowledgeDir: "knowledge",
      stateDir: ".graphmemo",
      logLevel: "debug"
    });
  });
});
