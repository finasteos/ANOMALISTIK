# ANOMALISTIK

Lab + control-plane for multimodal empirical structure detection.

**Stance:** measure → control → report · *Structure ≠ Message* · Layer 1 negative controls.

## Repo layout

| Path | Role |
|------|------|
| `src/` | React/Vite dashboard (atlas UI) |
| `server.ts` | Express + Gemini grounded search / adjudication |
| `wiki/` | Agent-compiled markdown knowledge (mutable) |
| `raw/` | Immutable source docs (SHA-256 meta) |
| `schemas/` | agent-wiki entity templates |

## Agent entry

Start at [`wiki/index.md`](wiki/index.md). Status tags: **LANDED** · **DESIGNED** · **NEVER**.

Data & credentials (no secrets):
- [`wiki/data-inventory.md`](wiki/data-inventory.md) — open DBs · OWN catalogs · OSINT
- [`wiki/api-keys.md`](wiki/api-keys.md) — which keys/accounts, env names only

Verdict source of truth = research lab `outputs/*/run.json` (TIN-STUDY / crop-circles), not dashboard severity alone.

## MCP

Unofficial docs MCP (GitMCP):

```json
"ANOMALISTIK Docs": { "url": "https://gitmcp.io/finasteos/ANOMALISTIK" }
```

Local agent-wiki MCP (compounding wiki):

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
