# ANOMALISTIK

Lab + control-plane for multimodal empirical structure detection.

**Stance:** measure → control → report · *Structure ≠ Message* · Layer 1 negative controls.

## Repo layout

| Path | Role | Survives AI Studio publish? |
|------|------|------------------------------|
| `src/` `server.ts` … | Dashboard (AI Studio owns this) | Yes (Studio writes it) |
| `wiki/` | Agent-compiled markdown knowledge | **No — wiped** |
| `raw/` | Immutable source docs | **No — wiped** |
| `schemas/` | agent-wiki templates | **No — wiped** |

## AI Studio rule (critical)

Google AI Studio **replaces the git tree** on publish. You cannot safely co-author `wiki/` / `raw/` in the same push as a Studio build.

**Workflow:**

1. Build UI in AI Studio → publish to `main`.
2. Immediately restore knowledge layer from branch `knowledge`:

```bash
./scripts/restore-knowledge.sh
git add wiki raw schemas .agent-wiki.yaml README.md
git commit -m "chore: restore knowledge layer after AI Studio publish"
git push
```

3. When you edit wiki/inventory locally, also update `knowledge`:

```bash
git checkout knowledge
git merge main -m "sync"
# or cherry-pick wiki-only commits
git push origin knowledge
```

Dashboard **Export Wiki MD** (sidebar) downloads a live snapshot of `labData` — drop it into `wiki/exports/` or `raw/` if you want it versioned.

## Agent entry

- [`wiki/index.md`](wiki/index.md)
- [`wiki/data-inventory.md`](wiki/data-inventory.md) — open DBs · OWN catalogs · OSINT
- [`wiki/api-keys.md`](wiki/api-keys.md) — credential names only (no secrets)

## MCP

```json
"ANOMALISTIK Docs": { "url": "https://gitmcp.io/finasteos/ANOMALISTIK" }
```

```json
"anomalistik-wiki": {
  "command": "npx",
  "args": ["-y", "@agent-wiki/mcp", "serve", "--wiki-path", "/Users/perbrinell/Documents/ANOMALISTIK"]
}
```

## Dev

```bash
cp .env.example .env   # GEMINI_API_KEY
bun install            # or npm install
bun run dev            # http://localhost:3000
```
