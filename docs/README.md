# Mahsaagent docs

Persian developer toolkit — RTL, Jalali, Iranian validation, geo, banks.

## Install

```bash
git clone https://github.com/mjpt1/mahsaagent.git
cd mahsaagent
npm install && npm run build
```

## Modules

| Import | Purpose |
|--------|---------|
| `mahsaagent` / CLI | Tools server + commands |
| `mahsaagent/zod` | Zod schemas for forms |
| `mahsaagent/jalali` | Jalali helpers |
| `mahsaagent/text` | Normalize / validate |

## New in 0.4

- `iran_cities` — ۱۱۹۵ شهر
- `iran_postal` / `iran_landline`
- `jalali_business_day` / `jalali_events`
- `persian_financial` / `iran_banks`
- Zod package + shadcn-persian skill/template

## CLI extras

```bash
npx mahsaagent cities شیراز
npx mahsaagent postal 7143611111
npx mahsaagent landline 02188776655
npx mahsaagent financial 6219861034529007
npx mahsaagent business today
```

## Branding

Do not describe this project using the names of generative model products. It is a locale/developer toolkit.
