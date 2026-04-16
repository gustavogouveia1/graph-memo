function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderWebUiHtml(defaultWorkspacePath: string, demoFixturePath: string): string {
  const escapedWorkspacePath = escapeHtml(defaultWorkspacePath);
  const escapedDemoFixturePath = escapeHtml(demoFixturePath);

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Graph-Memo Web UI</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #111827;
      --panel: #1f2937;
      --panel-soft: #273549;
      --text: #f3f4f6;
      --muted: #9ca3af;
      --accent: #22c55e;
      --accent-soft: #166534;
      --danger: #ef4444;
      --border: #374151;
      --code: #0b1220;
    }
    body {
      margin: 0;
      font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
      background: radial-gradient(circle at top, #1f2937 0%, #0b1020 70%);
      color: var(--text);
      min-height: 100vh;
    }
    .container { max-width: 1080px; margin: 0 auto; padding: 24px; }
    h1 { margin: 0 0 8px; font-size: 1.7rem; }
    .subtitle { margin: 0 0 24px; color: var(--muted); }
    .tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .tab-button {
      background: var(--panel);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 14px;
      cursor: pointer;
      font-weight: 600;
    }
    .tab-button.active { border-color: var(--accent); background: var(--accent-soft); }
    .panel {
      display: none;
      background: rgba(17, 24, 39, 0.92);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .panel.active { display: block; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
    label { display: block; font-size: 0.9rem; color: var(--muted); margin-bottom: 6px; }
    input, select, textarea {
      width: 100%;
      box-sizing: border-box;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--panel-soft);
      color: var(--text);
      padding: 9px 10px;
      font-size: 0.95rem;
    }
    textarea { min-height: 88px; resize: vertical; }
    .checkbox { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    .checkbox input { width: auto; }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
    button {
      border: 1px solid var(--border);
      background: var(--panel);
      color: var(--text);
      padding: 9px 13px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
    .primary { background: var(--accent-soft); border-color: var(--accent); }
    .result { margin-top: 14px; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .result-header { padding: 10px 12px; background: #182132; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
    .result-header.success { color: #86efac; }
    .result-header.error { color: #fca5a5; }
    .result-body {
      margin: 0;
      padding: 12px;
      background: var(--code);
      color: #d1e9ff;
      font-size: 0.86rem;
      overflow: auto;
      max-height: 320px;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.45;
    }
    .row { margin-bottom: 12px; }
  </style>
</head>
<body>
  <main class="container">
    <h1>Graph-Memo Web UI</h1>
    <p class="subtitle">Camada web minima sobre os mesmos use cases da CLI (local-first).</p>
    <div class="tabs" role="tablist" aria-label="Fluxos do Graph-Memo">
      <button class="tab-button active" data-tab="index">Index</button>
      <button class="tab-button" data-tab="query">Query</button>
      <button class="tab-button" data-tab="import">Import Chats</button>
      <button class="tab-button" data-tab="context">Context Builder</button>
    </div>

    <section class="panel active" data-panel="index">
      <div class="grid">
        <div class="row">
          <label for="index-workspace">Workspace path</label>
          <input id="index-workspace" type="text" value="${escapedWorkspacePath}" />
        </div>
      </div>
      <label class="checkbox"><input id="index-dry-run" type="checkbox" /> Dry-run</label>
      <label class="checkbox"><input id="index-full" type="checkbox" /> Full reindex</label>
      <div class="actions">
        <button class="primary" data-action="index">Executar index</button>
        <button data-action="use-demo">Usar fixture demo</button>
      </div>
      <div class="result" id="index-result" hidden>
        <div class="result-header" id="index-status"></div>
        <pre class="result-body" id="index-output"></pre>
      </div>
    </section>

    <section class="panel" data-panel="query">
      <div class="grid">
        <div class="row">
          <label for="query-workspace">Workspace path</label>
          <input id="query-workspace" type="text" value="${escapedWorkspacePath}" />
        </div>
        <div class="row"><label for="query-symbol">Symbol</label><input id="query-symbol" type="text" /></div>
        <div class="row"><label for="query-module">Module</label><input id="query-module" type="text" /></div>
        <div class="row"><label for="query-file">File</label><input id="query-file" type="text" /></div>
        <div class="row"><label for="query-related">Related-to</label><input id="query-related" type="text" /></div>
      </div>
      <label class="checkbox"><input id="query-list-files" type="checkbox" /> List files</label>
      <div class="actions"><button class="primary" data-action="query">Executar query</button></div>
      <div class="result" id="query-result" hidden>
        <div class="result-header" id="query-status"></div>
        <pre class="result-body" id="query-output"></pre>
      </div>
    </section>

    <section class="panel" data-panel="import">
      <div class="grid">
        <div class="row">
          <label for="import-workspace">Workspace path</label>
          <input id="import-workspace" type="text" value="${escapedWorkspacePath}" />
        </div>
        <div class="row">
          <label for="import-source">Source path</label>
          <input id="import-source" type="text" />
        </div>
        <div class="row">
          <label for="import-provider">Provider</label>
          <select id="import-provider">
            <option value="generic">generic</option>
            <option value="claude">claude</option>
            <option value="cursor">cursor</option>
            <option value="chatgpt">chatgpt</option>
          </select>
        </div>
      </div>
      <label class="checkbox"><input id="import-dry-run" type="checkbox" /> Dry-run</label>
      <div class="actions">
        <button class="primary" data-action="import">Importar chats</button>
        <button data-action="prefill-import-demo">Preencher source demo</button>
      </div>
      <div class="result" id="import-result" hidden>
        <div class="result-header" id="import-status"></div>
        <pre class="result-body" id="import-output"></pre>
      </div>
    </section>

    <section class="panel" data-panel="context">
      <div class="grid">
        <div class="row">
          <label for="context-workspace">Workspace path</label>
          <input id="context-workspace" type="text" value="${escapedWorkspacePath}" />
        </div>
        <div class="row"><label for="context-symbol">Filtro symbol</label><input id="context-symbol" type="text" /></div>
        <div class="row"><label for="context-module">Filtro module</label><input id="context-module" type="text" /></div>
        <div class="row">
          <label for="context-format">Formato</label>
          <select id="context-format"><option value="markdown">markdown</option><option value="json">json</option></select>
        </div>
      </div>
      <div class="row">
        <label for="context-task">Task</label>
        <textarea id="context-task" placeholder="Ex.: corrigir calculo de comissao premium"></textarea>
      </div>
      <div class="actions">
        <button class="primary" data-action="context">Gerar contexto</button>
        <button data-action="copy-context">Copiar resultado</button>
      </div>
      <div class="result" id="context-result" hidden>
        <div class="result-header" id="context-status"></div>
        <pre class="result-body" id="context-output"></pre>
      </div>
    </section>
  </main>

  <script>
    const DEFAULT_WORKSPACE = "${escapedWorkspacePath}";
    const DEMO_FIXTURE_PATH = "${escapedDemoFixturePath}";
    const apiBase = "/api";
    let lastContextOutput = "";

    function q(id) { return document.getElementById(id); }
    function textOrUndefined(value) {
      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    }
    function setResult(prefix, status, message, payload) {
      const box = q(prefix + "-result");
      const statusEl = q(prefix + "-status");
      const output = q(prefix + "-output");
      box.hidden = false;
      statusEl.textContent = message;
      statusEl.className = "result-header " + status;
      output.textContent = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
    }
    async function post(path, body) {
      const response = await fetch(apiBase + path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) {
        throw data;
      }
      return data;
    }
    function bindAction(action, handler) {
      document.querySelector('[data-action="' + action + '"]').addEventListener("click", handler);
    }
    function setLoading(button, active) {
      if (active) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = "Processando...";
      } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || button.textContent;
      }
    }
    function bindTabNavigation() {
      const buttons = Array.from(document.querySelectorAll(".tab-button"));
      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const tab = button.dataset.tab;
          buttons.forEach((item) => item.classList.toggle("active", item === button));
          document.querySelectorAll(".panel").forEach((panel) => {
            panel.classList.toggle("active", panel.dataset.panel === tab);
          });
        });
      });
    }

    bindTabNavigation();

    bindAction("use-demo", () => {
      q("index-workspace").value = DEMO_FIXTURE_PATH;
      q("query-workspace").value = DEMO_FIXTURE_PATH;
      q("import-workspace").value = DEMO_FIXTURE_PATH;
      q("context-workspace").value = DEMO_FIXTURE_PATH;
      q("import-source").value = DEMO_FIXTURE_PATH + "/chat-exports";
    });
    bindAction("prefill-import-demo", () => {
      q("import-workspace").value = DEMO_FIXTURE_PATH;
      q("import-source").value = DEMO_FIXTURE_PATH + "/chat-exports";
    });

    bindAction("index", async (event) => {
      const button = event.currentTarget;
      setLoading(button, true);
      try {
        const data = await post("/index", {
          workspacePath: q("index-workspace").value,
          fullReindex: q("index-full").checked,
          dryRun: q("index-dry-run").checked
        });
        setResult("index", "success", data.result.message, data.result.details);
      } catch (error) {
        setResult("index", "error", "[" + error.error_code + "] " + error.message, error);
      } finally {
        setLoading(button, false);
      }
    });

    bindAction("query", async (event) => {
      const button = event.currentTarget;
      setLoading(button, true);
      try {
        const data = await post("/query", {
          workspacePath: q("query-workspace").value,
          symbol: textOrUndefined(q("query-symbol").value),
          module: textOrUndefined(q("query-module").value),
          file: textOrUndefined(q("query-file").value),
          relatedTo: textOrUndefined(q("query-related").value),
          listFiles: q("query-list-files").checked
        });
        setResult("query", "success", data.result.message, data.result.details);
      } catch (error) {
        setResult("query", "error", "[" + error.error_code + "] " + error.message, error);
      } finally {
        setLoading(button, false);
      }
    });

    bindAction("import", async (event) => {
      const button = event.currentTarget;
      setLoading(button, true);
      try {
        const data = await post("/import-chats", {
          workspacePath: q("import-workspace").value,
          source: q("import-source").value,
          provider: q("import-provider").value,
          dryRun: q("import-dry-run").checked
        });
        setResult("import", "success", data.result.message, data.result.details);
      } catch (error) {
        setResult("import", "error", "[" + error.error_code + "] " + error.message, error);
      } finally {
        setLoading(button, false);
      }
    });

    bindAction("context", async (event) => {
      const button = event.currentTarget;
      setLoading(button, true);
      try {
        const data = await post("/context", {
          workspacePath: q("context-workspace").value,
          task: q("context-task").value,
          symbol: textOrUndefined(q("context-symbol").value),
          module: textOrUndefined(q("context-module").value),
          format: q("context-format").value
        });
        const details = data.result.details;
        lastContextOutput = typeof details === "string" ? details : JSON.stringify(details, null, 2);
        setResult("context", "success", data.result.message, lastContextOutput);
      } catch (error) {
        setResult("context", "error", "[" + error.error_code + "] " + error.message, error);
      } finally {
        setLoading(button, false);
      }
    });

    bindAction("copy-context", async () => {
      if (lastContextOutput.length === 0) {
        setResult("context", "error", "Nada para copiar ainda.", "Gere contexto antes de copiar.");
        return;
      }
      try {
        await navigator.clipboard.writeText(lastContextOutput);
        setResult("context", "success", "Contexto copiado para a area de transferencia.", lastContextOutput);
      } catch {
        setResult("context", "error", "Falha ao copiar automaticamente.", "Copie manualmente pelo bloco de preview.");
      }
    });

    if (!q("index-workspace").value) {
      q("index-workspace").value = DEFAULT_WORKSPACE;
    }
  </script>
</body>
</html>`;
}
