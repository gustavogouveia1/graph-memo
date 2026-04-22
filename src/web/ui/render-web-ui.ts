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
      color-scheme: dark;
      --bg-canvas: #070b13;
      --bg-gradient-top: #111827;
      --bg-gradient-bottom: #060913;
      --surface-0: #0c1220;
      --surface-1: #10192b;
      --surface-2: #141f34;
      --surface-3: #1a2640;
      --border-soft: #25324b;
      --border-strong: #374968;
      --text-primary: #e8edf7;
      --text-secondary: #9caecc;
      --text-muted: #7d8fad;
      --text-code: #cfe2ff;
      --accent: #4f8cff;
      --accent-strong: #3d73d8;
      --accent-soft: rgba(79, 140, 255, 0.18);
      --success: #66d9a7;
      --danger: #ff8f95;
      --warning: #f5bf65;
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-xl: 20px;
      --shadow-panel: 0 18px 44px rgba(3, 6, 13, 0.48);
      --shadow-soft: 0 8px 24px rgba(2, 6, 16, 0.35);
      --focus-ring: 0 0 0 3px rgba(79, 140, 255, 0.32);
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
    }

    body {
      font-family: "Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
      letter-spacing: 0.01em;
      background:
        radial-gradient(1200px 560px at 12% -4%, rgba(79, 140, 255, 0.22), transparent 60%),
        radial-gradient(980px 420px at 90% -8%, rgba(52, 139, 94, 0.16), transparent 58%),
        linear-gradient(180deg, var(--bg-gradient-top) 0%, var(--bg-gradient-bottom) 65%);
      color: var(--text-primary);
      min-height: 100vh;
    }

    .page {
      max-width: 1120px;
      margin: 0 auto;
      padding: 36px 22px 56px;
    }

    .shell {
      background: linear-gradient(178deg, rgba(16, 25, 43, 0.96) 0%, rgba(10, 18, 33, 0.96) 100%);
      border: 1px solid rgba(55, 73, 104, 0.58);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-panel);
      padding: 28px;
      backdrop-filter: blur(4px);
    }

    .topbar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 24px;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 8px;
      color: var(--text-secondary);
      font-size: 0.78rem;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      font-weight: 600;
    }

    .eyebrow::before {
      content: "";
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: var(--accent);
      box-shadow: 0 0 0 5px rgba(79, 140, 255, 0.16);
    }

    h1 {
      margin: 0;
      font-size: clamp(1.42rem, 2.8vw, 1.9rem);
      line-height: 1.2;
      letter-spacing: -0.01em;
      font-weight: 700;
      color: #f4f7ff;
    }

    .subtitle {
      margin: 10px 0 0;
      color: var(--text-secondary);
      max-width: 70ch;
      font-size: 0.96rem;
      line-height: 1.56;
    }

    .meta-chip {
      align-self: flex-start;
      border: 1px solid rgba(88, 112, 148, 0.6);
      background: rgba(20, 31, 52, 0.7);
      color: var(--text-secondary);
      border-radius: 999px;
      padding: 9px 14px;
      font-size: 0.78rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-weight: 600;
    }

    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 6px;
      margin-bottom: 18px;
      border: 1px solid rgba(55, 73, 104, 0.5);
      border-radius: var(--radius-md);
      background: rgba(11, 18, 34, 0.72);
    }

    .tab-button {
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-secondary);
      border-radius: 10px;
      padding: 9px 14px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition:
        color 130ms ease,
        background-color 130ms ease,
        border-color 130ms ease,
        transform 130ms ease;
    }

    .tab-button:hover {
      color: var(--text-primary);
      border-color: rgba(88, 112, 148, 0.45);
      background: rgba(20, 31, 52, 0.88);
    }

    .tab-button:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
      border-color: rgba(105, 146, 230, 0.8);
    }

    .tab-button.active {
      color: #f5f8ff;
      border-color: rgba(105, 146, 230, 0.82);
      background: linear-gradient(180deg, rgba(37, 56, 90, 0.98) 0%, rgba(30, 47, 78, 0.98) 100%);
      box-shadow: inset 0 1px 0 rgba(150, 183, 255, 0.25);
    }

    .panel {
      display: none;
      background: linear-gradient(180deg, rgba(15, 25, 42, 0.94) 0%, rgba(11, 20, 35, 0.94) 100%);
      border: 1px solid rgba(56, 76, 108, 0.54);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: var(--shadow-soft);
      transition: border-color 180ms ease, box-shadow 180ms ease;
    }

    .panel.active {
      display: block;
    }

    .panel-heading {
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 10px;
    }

    .panel-title {
      margin: 0;
      font-size: 1.04rem;
      color: var(--text-primary);
    }

    .panel-hint {
      margin: 0;
      font-size: 0.84rem;
      color: var(--text-muted);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(228px, 1fr));
      gap: 14px;
    }

    .row {
      margin: 0;
    }

    .row-spaced {
      margin-top: 14px;
    }

    .field-group {
      display: grid;
      gap: 12px;
    }

    label {
      display: block;
      font-size: 0.83rem;
      color: var(--text-secondary);
      margin-bottom: 6px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .helper {
      margin: 6px 0 0;
      color: var(--text-muted);
      font-size: 0.78rem;
    }

    input,
    select,
    textarea {
      width: 100%;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-soft);
      background: linear-gradient(180deg, rgba(20, 31, 52, 0.9) 0%, rgba(17, 27, 45, 0.9) 100%);
      color: var(--text-primary);
      padding: 10px 12px;
      font-size: 0.9rem;
      transition:
        border-color 130ms ease,
        box-shadow 130ms ease,
        background-color 130ms ease;
    }

    input::placeholder,
    textarea::placeholder {
      color: #7588ab;
    }

    input:hover,
    select:hover,
    textarea:hover {
      border-color: var(--border-strong);
    }

    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible {
      outline: none;
      border-color: rgba(105, 146, 230, 0.85);
      box-shadow: var(--focus-ring);
      background: rgba(22, 35, 60, 0.95);
    }

    textarea {
      min-height: 108px;
      resize: vertical;
      line-height: 1.46;
    }

    .options {
      margin-top: 14px;
      display: flex;
      flex-wrap: wrap;
      gap: 12px 18px;
    }

    .checkbox {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.84rem;
      cursor: pointer;
      user-select: none;
    }

    .checkbox input {
      width: 16px;
      height: 16px;
      margin: 0;
      accent-color: var(--accent);
      border-radius: 4px;
    }

    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 16px;
    }

    button {
      border: 1px solid var(--border-soft);
      background: linear-gradient(180deg, #15213a 0%, #111a2d 100%);
      color: var(--text-primary);
      padding: 10px 14px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.86rem;
      letter-spacing: 0.02em;
      transition:
        transform 120ms ease,
        border-color 120ms ease,
        background-color 120ms ease,
        box-shadow 120ms ease,
        color 120ms ease;
    }

    button:hover:not(:disabled) {
      border-color: var(--border-strong);
      background: linear-gradient(180deg, #1a2948 0%, #132038 100%);
      transform: translateY(-1px);
    }

    button:active:not(:disabled) {
      transform: translateY(0);
      background: #14233f;
    }

    button:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    button:disabled {
      opacity: 0.62;
      cursor: not-allowed;
      transform: none;
      filter: saturate(0.8);
    }

    .primary {
      border-color: #5d92ff;
      background: linear-gradient(180deg, #3364bf 0%, #2a55a8 100%);
      color: #eff5ff;
      box-shadow: inset 0 1px 0 rgba(190, 212, 255, 0.24);
    }

    .primary:hover:not(:disabled) {
      border-color: #79a8ff;
      background: linear-gradient(180deg, #3c73d6 0%, #2f61bb 100%);
      box-shadow:
        inset 0 1px 0 rgba(209, 224, 255, 0.28),
        0 8px 20px rgba(22, 42, 76, 0.35);
    }

    .result {
      margin-top: 18px;
      border: 1px solid rgba(58, 76, 107, 0.68);
      border-radius: var(--radius-md);
      overflow: hidden;
      background: rgba(10, 18, 33, 0.92);
    }

    .result-header {
      padding: 11px 13px;
      background: rgba(21, 31, 50, 0.96);
      border-bottom: 1px solid rgba(58, 76, 107, 0.68);
      font-size: 0.84rem;
      color: var(--text-secondary);
      font-weight: 600;
      letter-spacing: 0.01em;
    }

    .result-header.success {
      color: var(--success);
    }

    .result-header.error {
      color: var(--danger);
    }

    .result-header.loading {
      color: var(--warning);
    }

    .result-body {
      margin: 0;
      padding: 13px;
      background: rgba(8, 14, 25, 0.92);
      color: var(--text-code);
      font-size: 0.82rem;
      overflow: auto;
      max-height: 320px;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.52;
      font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
    }

    @media (max-width: 760px) {
      .page {
        padding: 18px 12px 36px;
      }

      .shell {
        padding: 16px;
        border-radius: 14px;
      }

      .tabs {
        gap: 6px;
      }

      .tab-button {
        padding: 8px 11px;
        font-size: 0.84rem;
      }

      .panel {
        padding: 14px;
      }

      .actions {
        flex-direction: column;
      }

      .actions button {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">Graph-Memo Platform</p>
          <h1>Local-first operations cockpit</h1>
          <p class="subtitle">
            Mesma base de use cases da CLI, com interface premium para execucao segura e previsivel dos fluxos de index, query, import e context.
          </p>
        </div>
        <div class="meta-chip">Local-first runtime</div>
      </header>

      <div class="tabs" role="tablist" aria-label="Fluxos do Graph-Memo">
        <button class="tab-button active" data-tab="index" role="tab" aria-selected="true" aria-controls="panel-index" id="tab-index">Index</button>
        <button class="tab-button" data-tab="query" role="tab" aria-selected="false" aria-controls="panel-query" id="tab-query">Query</button>
        <button class="tab-button" data-tab="import" role="tab" aria-selected="false" aria-controls="panel-import" id="tab-import">Import chats</button>
        <button class="tab-button" data-tab="context" role="tab" aria-selected="false" aria-controls="panel-context" id="tab-context">Context builder</button>
      </div>

      <section class="panel active" data-panel="index" id="panel-index" role="tabpanel" aria-labelledby="tab-index">
        <div class="panel-heading">
          <h2 class="panel-title">Index workspace</h2>
          <p class="panel-hint">Atualiza o indice local com controle de dry-run e full reindex.</p>
        </div>
        <div class="field-group">
          <div class="grid">
            <div class="row">
              <label for="index-workspace">Workspace path</label>
              <input id="index-workspace" type="text" value="${escapedWorkspacePath}" />
              <p class="helper">Diretorio local para o indice do projeto.</p>
            </div>
          </div>
          <div class="options">
            <label class="checkbox"><input id="index-dry-run" type="checkbox" />Dry-run</label>
            <label class="checkbox"><input id="index-full" type="checkbox" />Full reindex</label>
          </div>
        </div>
        <div class="actions">
          <button class="primary" data-action="index">Executar index</button>
          <button data-action="use-demo">Usar fixture demo</button>
        </div>
        <div class="result" id="index-result" hidden>
          <div class="result-header" id="index-status"></div>
          <pre class="result-body" id="index-output"></pre>
        </div>
      </section>

      <section class="panel" data-panel="query" id="panel-query" role="tabpanel" aria-labelledby="tab-query" hidden>
        <div class="panel-heading">
          <h2 class="panel-title">Query index</h2>
          <p class="panel-hint">Consulta simbolos e relacoes no indice local.</p>
        </div>
        <div class="grid">
          <div class="row">
            <label for="query-workspace">Workspace path</label>
            <input id="query-workspace" type="text" value="${escapedWorkspacePath}" />
          </div>
          <div class="row"><label for="query-symbol">Symbol</label><input id="query-symbol" type="text" placeholder="Ex.: calculateCommission" /></div>
          <div class="row"><label for="query-module">Module</label><input id="query-module" type="text" placeholder="Ex.: src/domain" /></div>
          <div class="row"><label for="query-file">File</label><input id="query-file" type="text" placeholder="Ex.: src/core/index.ts" /></div>
          <div class="row"><label for="query-related">Related-to</label><input id="query-related" type="text" placeholder="Ex.: commission-policy" /></div>
        </div>
        <div class="options">
          <label class="checkbox"><input id="query-list-files" type="checkbox" />List files</label>
        </div>
        <div class="actions"><button class="primary" data-action="query">Executar query</button></div>
        <div class="result" id="query-result" hidden>
          <div class="result-header" id="query-status"></div>
          <pre class="result-body" id="query-output"></pre>
        </div>
      </section>

      <section class="panel" data-panel="import" id="panel-import" role="tabpanel" aria-labelledby="tab-import" hidden>
        <div class="panel-heading">
          <h2 class="panel-title">Import chats</h2>
          <p class="panel-hint">Ingestao de exports de chats para o workspace local.</p>
        </div>
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
        <div class="options">
          <label class="checkbox"><input id="import-dry-run" type="checkbox" />Dry-run</label>
        </div>
        <div class="actions">
          <button class="primary" data-action="import">Importar chats</button>
          <button data-action="prefill-import-demo">Preencher source demo</button>
        </div>
        <div class="result" id="import-result" hidden>
          <div class="result-header" id="import-status"></div>
          <pre class="result-body" id="import-output"></pre>
        </div>
      </section>

      <section class="panel" data-panel="context" id="panel-context" role="tabpanel" aria-labelledby="tab-context" hidden>
        <div class="panel-heading">
          <h2 class="panel-title">Context builder</h2>
          <p class="panel-hint">Gera contexto consolidado em markdown ou json.</p>
        </div>
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
        <div class="row row-spaced">
          <label for="context-task">Task</label>
          <textarea id="context-task" placeholder="Ex.: corrigir calculo de comissao premium"></textarea>
        </div>
        <div class="options">
          <label class="checkbox">
            <input id="context-refine-with-claude" type="checkbox" />
            Refinar com Claude (opcional)
          </label>
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
    function setLoadingResult(prefix, message) {
      const box = q(prefix + "-result");
      const statusEl = q(prefix + "-status");
      const output = q(prefix + "-output");
      box.hidden = false;
      statusEl.textContent = message;
      statusEl.className = "result-header loading";
      output.textContent = "Aguarde...";
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
      const panels = Array.from(document.querySelectorAll(".panel"));
      const activateTab = (button) => {
        const tab = button.dataset.tab;
        buttons.forEach((item) => {
          const active = item === button;
          item.classList.toggle("active", active);
          item.setAttribute("aria-selected", active ? "true" : "false");
          item.setAttribute("tabindex", active ? "0" : "-1");
        });
        panels.forEach((panel) => {
          const active = panel.dataset.panel === tab;
          panel.classList.toggle("active", active);
          panel.hidden = !active;
        });
      };

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          activateTab(button);
        });
        button.addEventListener("keydown", (event) => {
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
            return;
          }
          event.preventDefault();
          const currentIndex = buttons.indexOf(button);
          const movement = event.key === "ArrowRight" ? 1 : -1;
          const nextIndex = (currentIndex + movement + buttons.length) % buttons.length;
          const nextButton = buttons[nextIndex];
          activateTab(nextButton);
          nextButton.focus();
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
      setLoadingResult("index", "Index em processamento...");
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
      setLoadingResult("query", "Query em processamento...");
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
      setLoadingResult("import", "Importacao em processamento...");
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
      setLoadingResult("context", "Context builder em processamento...");
      try {
        const data = await post("/context", {
          workspacePath: q("context-workspace").value,
          task: q("context-task").value,
          symbol: textOrUndefined(q("context-symbol").value),
          module: textOrUndefined(q("context-module").value),
          format: q("context-format").value,
          refineWithClaude: q("context-refine-with-claude").checked
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
