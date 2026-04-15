import { describe, expect, it } from "vitest";

import { normalizeImportedChat } from "../../src/core/chat-import/normalize-imported-chat";

describe("normalizeImportedChat", () => {
  it("normaliza chat para nota previsivel com metadata e mensagens", () => {
    const normalized = normalizeImportedChat({
      importedAt: "2026-04-15T12:00:00.000Z",
      noteIndex: 0,
      chat: {
        provider: "cursor",
        sourceFile: "exports/index-task.json",
        topic: "Indexador local",
        messages: [
          { role: "user", content: "Como implementar?" },
          { role: "assistant", content: "Comece pelo parser.", timestamp: "2026-04-15T12:00:10.000Z" }
        ]
      }
    });

    expect(normalized.noteFileName).toMatch(/^2026-04-15-indexador-local-index-task-[a-f0-9]{8}\.md$/);
    expect(normalized.tags).toContain("#import");
    expect(normalized.related).toContain("[[ADR-001]]");
    expect(normalized.noteContent).toContain("## Metadata");
    expect(normalized.noteContent).toContain("## Messages");
    expect(normalized.noteContent).toContain("## Related");
  });
});
