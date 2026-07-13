# Mahsaagent docs

Persian developer toolkit — RTL, Jalali, Iranian validation, official geo, banks, MCP.

## Install

Until the package is published on npm, install from git:

```bash
git clone https://github.com/mjpt1/mahsaagent.git
cd mahsaagent
npm install && npm run build
node dist/index.js doctor
node dist/index.js init-mcp
```

## Guides

| Doc | Topic |
|-----|--------|
| [clients.md](clients.md) | Cursor / Claude Desktop / Codex / HTTP |
| [GEO-SOURCE.md](GEO-SOURCE.md) | Official iran-cities provenance |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | Dev setup + PR norms |
| [../SECURITY.md](../SECURITY.md) | HTTP auth / tunnel notes |
| [../CHANGELOG.md](../CHANGELOG.md) | Release notes |
| [site/index.html](site/index.html) | Product overview page (not full API docs) |

## Modules

| Import | Purpose |
|--------|---------|
| `mahsaagent` | Tools server exports |
| `mahsaagent/zod` | Zod schemas for forms |
| `mahsaagent/jalali` | Jalali helpers |
| `mahsaagent/text` | Normalize / validate |
| `mahsaagent/address` | Official address cascade |
| `mahsaagent/react` · `mahsaagent/react/forms` | React hooks |
| `mahsaagent/vue` | Vue composables |
| `mahsaagent/ipg` · `mahsaagent/moadian` | Payment / tax stubs |

## Current surface (0.6.2)

- **۴۳ ابزار** MCP (stdio + HTTP)
- Official geo (~۹۸k آبادی) as default for `iran_cities`
- Place hints marked approximate; passport is structural-only
- `serve-http` refuses non-loopback without `MAHSAAGENT_TOKEN`

## Branding

Do not describe this project using the names of generative model products. It is a locale/developer toolkit. Connecting to MCP *clients* (Cursor, Claude Desktop, ChatGPT/Codex) is documented separately.
