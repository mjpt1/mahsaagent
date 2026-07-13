# Changelog

All notable changes to Mahsaagent are documented here.

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
