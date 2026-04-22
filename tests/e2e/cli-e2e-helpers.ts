import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

import { vi } from "vitest";

import { createCli } from "../../src/cli/create-cli";
import type { ProjectConfig } from "../../src/shared/config/project-config";

/** Vitest/npm scripts executam com cwd na raiz do repositorio. */
export const E2E_REPO_ROOT = process.cwd();
export const FIXTURE_ROOT = join(E2E_REPO_ROOT, "tests/fixtures/sample-workspace");

const requireFromE2eHelpers = createRequire(join(E2E_REPO_ROOT, "tests/e2e/cli-e2e-helpers.ts"));

export interface CliRunResult {
  logs: string[];
  errors: string[];
}

export function createFixtureConfig(workspaceRoot: string): ProjectConfig {
  return {
    workspaceRoot,
    docsDir: "docs",
    knowledgeDir: "knowledge",
    stateDir: ".graphmemo",
    logLevel: "error",
    aiRefinement: {
      enabled: false,
      apiKey: "",
      model: "claude-3-5-sonnet-latest",
      timeoutMs: 8000
    }
  };
}

export async function runCliCommand(
  config: ProjectConfig,
  commandArgs: string[]
): Promise<CliRunResult> {
  const logs: string[] = [];
  const errors: string[] = [];
  const logSpy = vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
    logs.push(args.map((arg) => String(arg)).join(" "));
  });
  const errorSpy = vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    errors.push(args.map((arg) => String(arg)).join(" "));
  });

  try {
    await createCli(config).parseAsync(["node", "graphmemo", ...commandArgs]);
    return { logs, errors };
  } finally {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  }
}

export async function createWorkspaceFromFixture(tempDirectories: string[]): Promise<string> {
  const tempRoot = await mkdtemp(join(tmpdir(), "graphmemo-e2e-"));
  tempDirectories.push(tempRoot);
  const workspacePath = join(tempRoot, "workspace");
  await cp(FIXTURE_ROOT, workspacePath, { recursive: true });
  return workspacePath;
}

export async function createBareWorkspace(tempDirectories: string[]): Promise<string> {
  const tempRoot = await mkdtemp(join(tmpdir(), "graphmemo-e2e-empty-"));
  tempDirectories.push(tempRoot);
  return tempRoot;
}

/**
 * Executa a mesma entrada que o binario (`main.ts`) via tsx, para validar exit code e stderr real.
 */
export async function runMainScript(
  args: string[],
  options: { cwd?: string } = {}
): Promise<{ exitCode: number | null; stderr: string; stdout: string }> {
  const cwd = options.cwd ?? E2E_REPO_ROOT;
  const tsxPackageDir = dirname(requireFromE2eHelpers.resolve("tsx/package.json"));
  const tsxCli = join(tsxPackageDir, "dist/cli.mjs");
  const mainTs = join(E2E_REPO_ROOT, "src/cli/main.ts");

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [tsxCli, mainTs, ...args], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env }
    });

    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      resolve({ exitCode, stderr, stdout });
    });
  });
}

export async function cleanupTempDirectories(tempDirectories: string[]): Promise<void> {
  await Promise.all(
    tempDirectories.map(async (directory) => {
      await rm(directory, { recursive: true, force: true });
    })
  );
  tempDirectories.length = 0;
}
