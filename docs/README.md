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
| `mahsaagent/forms` | Form presets + `validateFormValues` |
| `mahsaagent/jalali` | Jalali helpers |
| `mahsaagent/text` | Normalize / validate |
| `mahsaagent/address` | Official address cascade |
| `mahsaagent/react` · `mahsaagent/react/forms` | React hooks |
| `mahsaagent/vue` | Vue composables |
| `mahsaagent/ipg` · `mahsaagent/moadian` | Payment / tax offline helpers |

## Current surface (0.8.1)

- **۶۴ ابزار** MCP (stdio + HTTP)
- Phase 1: offline doc/code search, errors, regex, RTL lint/fix, test data
- Phase 2: address complete, schedule NLP, Moadian+, IPG advisor, bank sync, form schema, business rules
- Live Moadian/IPG submit still intentionally disabled (local-first)

## Branding

Do not describe this project using the names of generative model products. It is a locale/developer toolkit. Connecting to MCP *clients* (Cursor, Claude Desktop, ChatGPT/Codex) is documented separately.
