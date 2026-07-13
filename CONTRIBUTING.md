# Contributing to Mahsaagent

Thanks for helping improve the Persian developer toolkit.

## Setup

```bash
git clone https://github.com/mjpt1/mahsaagent.git
cd mahsaagent
npm install
npm run build
npm test
node dist/index.js doctor
```

Node **18+** required.

## Workflow

1. Prefer small, focused PRs.
2. Run `npm run typecheck`, `npm test`, and `npm run build` before opening a PR.
3. For geo changes, document provenance in `docs/GEO-SOURCE.md` and `src/data/official/meta.json`.
4. Do not brand the product as an AI/LLM wrapper in user-facing copy.

## MCP local config

```bash
node dist/index.js init-mcp
```

Writes `.cursor/mcp.json` pointing at this checkout (refuses overwrite).

## HTTP server

- Default bind: `127.0.0.1`
- Non-loopback hosts require `MAHSAAGENT_TOKEN` (or explicit `MAHSAAGENT_ALLOW_INSECURE=1`)
- Prefer a token before any public tunnel

## Data trust

| Dataset | Notes |
|---------|--------|
| Official geo | iran-cities v3 — see `THIRD_PARTY_NOTICES.md` |
| Place hints (postal/landline) | Approximate prefixes only |
| Passport | Structural format only |
| Holidays (religious) | May be ±1 day |

## License

MIT — see `LICENSE`. Bundled third-party notices: `THIRD_PARTY_NOTICES.md`.
