# Changelog

All notable changes to Mahsaagent are documented here.

## [0.6.2] — 2026-07-13

### Security / trust
- `serve-http` requires `MAHSAAGENT_TOKEN` on non-loopback (or explicit insecure override)
- Concurrent request limit + clearer 401 hints; CORS only when auth/token policy allows
- Legal ID no longer ORs with legacy library (false-positive fix)
- Passport validation tightened to letter + 8 digits; structural-only labeling
- Place hint APIs/tools marked approximate

### Data quality
- Official geo meta provenance (tag, URL, import date, MIT notice)
- FK integrity tests for official JSON; import script asserts non-empty + county FK
- `iran_cities` / CLI cities default to **official** iran-cities

### Developer experience
- Stronger `doctor` (geo counts, sample validate, tool registry)
- `init-mcp` writes local MCP config
- Package `exports` include `types`; CI typecheck + Node 18/20 + pack dry-run
- CONTRIBUTING, SECURITY, THIRD_PARTY_NOTICES; honest install docs until npm publish

## [0.6.1] — 2026-07-13

### Added
- Place hints: postal/landline → city, `iran_national_id_place`, plate city field
- Form kit template (RHF + Jalali datepicker + bank sync)
- Skills: `iran-ipg`, `laravel-persian-validation`
- `persian_bank_terminal`, richer polish, keyboard-typo date NLP
- GitHub Actions CI, changelog, release packaging

### Changed
- Villages use official iran-cities only (placeholder removed)
- README rewritten for install / tools / multi-client setup

## [0.6.0] — 2026-07-13

### Added
- Official iran-cities v3 geo (~98k abadi)
- `jalali_parse_phrase`, finglish, passport/crypto, GPS→province
- HTTP MCP transport (`serve-http`)
- React forms hooks, Vue composables, IPG contract + mock
- Docs site + client connection guides

## [0.5.x] — 2026-07

### Added
- Sheba ↔ account, Moadian stub, address cascade, SMS mock
- Multi-client MCP docs (Cursor / Claude Desktop / Codex)

## [0.4.0] — 2026-07

### Added
- Cities, banks, business days, Zod schemas, shadcn-persian skill

## [0.1.0 – 0.3.0] — 2026-07

### Added
- Initial MCP server, CLI, RTL extension, Jalali + validation core, skills
