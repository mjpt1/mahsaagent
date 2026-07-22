# Changelog

All notable changes to Mahsaagent are documented here.

## [0.8.1] — 2026-07-14

### Completed (incomplete / stub gaps)
- Moadian: line math validation, `buildSampleMoadianInvoice`, sample MCP/CLI action
- Form builder: runnable Zod presets + `validateFormValues`
- IPG mock: amount-binding verify + richer raw responses
- Doc index: best-effort PDF text extraction
- `rtl_fix_snippet` + CLI for all Phase 1–2 tools
- Version single-source from `package.json`; docs synced to 0.8.1 / 64 tools
- Public export `mahsaagent/forms`

## [0.8.0] — 2026-07-14

### Added (Phase 2 — Iranian domain pack)
- `iran_address_complete` — smart address form fill + geo cascade
- `jalali_schedule_parse` — natural date/time scheduling (پس‌فردا ساعت ۳)
- `moadian_validate` / `moadian_explain` — invoice validator + field explainer
- `ipg_advise` / `ipg_simulate` — IPG integration guide + mock flow
- `bank_form_sync` — card/Sheba/bank code consistency fixes
- `persian_form_schema` — checkout/KYC/bank form presets + Zod hints
- `iran_business_rules` — shop/tax/shipping/payment rules + order calc

## [0.7.0] — 2026-07-14

### Added (offline MCP / DX pack)
- `local_doc_index` / `local_doc_search` — local doc index + search (md/txt/ts/json)
- `codebase_search` — repo search with Persian/Finglish query variants
- `persian_regex_pack` — Iranian data regex library
- `dev_error_explain` / `stacktrace_explain_fa` — offline error/stack KB in Persian
- `finglish_dev_normalize` — dev/tech Finglish normalizer
- `mock_user_profile` / `test_data_batch` — Iranian test data factory
- `rtl_lint_snippet` — RTL pattern linter for HTML/CSS/TSX
- `schema_labels_fa` — Persian form field labels for Zod/JSON Schema

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
