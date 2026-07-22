# Mahsaagent

[![CI](https://github.com/mjpt1/mahsaagent/actions/workflows/ci.yml/badge.svg)](https://github.com/mjpt1/mahsaagent/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)
[![version](https://img.shields.io/badge/version-0.8.1-blue.svg)](CHANGELOG.md)

**جعبه ابزار فارسی برای توسعه‌دهندگان** — راست‌چین (RTL)، تاریخ شمسی، اعتبارسنجی داده‌های ایرانی، تقسیمات کشوری رسمی، بانک/شبا، و سرور ابزار استاندارد (MCP) برای چند کلاینت.

**Mahsaagent** is a Persian (Farsi) developer toolkit: RTL helpers, Jalali utilities, Iranian validation, official geo data, banking helpers, and an MCP tools server.

[نصب](#نصب) · [CLI](#cli) · [اتصال کلاینت‌ها](#اتصال-کلاینتها) · [ابزارها](#فهرست-ابزارها) · [کتابخانه](#استفاده-بهعنوان-کتابخانه) · [مهارت‌ها و قالب‌ها](#مهارتها-و-قالبها) · [توسعه](#توسعه) · [Changelog](CHANGELOG.md)

---

## چرا Mahsaagent؟

به‌جای ده‌ها پکیج جدا، یک نقطهٔ ورود برای کار روزمرهٔ اپ فارسی:

| حوزه | چه دارید |
|------|----------|
| **تاریخ** | تبدیل جلالی، تعطیلات، روز کاری، parse عبارات («فردا»، فینگلیش) |
| **اعتبارسنجی** | کدملی، شناسه حقوقی، شبا، کارت، موبایل، کدپستی، گذرنامه، پلاک، قبض |
| **جغرافیا** | دادهٔ رسمی iran-cities (~۹۸ هزار آبادی) + GPS→استان |
| **بانک** | تشخیص بانک، شبا↔حساب، لوگو CDN، همگام‌سازی فرم |
| **متن** | نرمال‌سازی، اسلاگ، ویراستاری، فینگلیش |
| **ادیتور** | افزونه RTL، مهارت‌های Cursor، قالب Next |
| **سرور ابزار** | stdio + HTTP برای Cursor / Claude Desktop / ChatGPT (Codex) |

نسخهٔ فعلی: **0.8.1** · **۶۴ ابزار**

---

## نصب

فعلاً از git (پکیج هنوز روی npm منتشر نشده):

```bash
git clone https://github.com/mjpt1/mahsaagent.git
cd mahsaagent
npm install
npm run build
node dist/index.js doctor
node dist/index.js init-mcp   # می‌نویسد .cursor/mcp.json
```

بعد از publish روی npm: `npm install mahsaagent`.

---

## CLI

```bash
node dist/index.js                  # سرور ابزار (stdio)
node dist/index.js serve-http       # HTTP روی /mcp — برای تونل حتماً MAHSAAGENT_TOKEN
node dist/index.js tools
node dist/index.js today
node dist/index.js convert 2026-03-21
node dist/index.js polish "سلام ,دنیا?"
node dist/index.js validate national_id 0499370899
node dist/index.js sheba sheba_to_account IR820540102680020817909002
node dist/index.js cities شیراز     # پیش‌فرض: دادهٔ رسمی
node dist/index.js address --province تهران
node dist/index.js villages --province فارس
node dist/index.js money 10000 toman rial
node dist/index.js moadian
node dist/index.js install-skills
```

---

## اتصال کلاینت‌ها

راهنمای کامل: [`docs/clients.md`](docs/clients.md)

### stdio (محلی)

برای Cursor، Claude Desktop، و ChatGPT Desktop / Codex:

```json
{
  "mcpServers": {
    "mahsaagent": {
      "command": "node",
      "args": ["ABS_PATH/mahsaagent/dist/index.js"]
    }
  }
}
```

`ABS_PATH` را با مسیر واقعی کلون عوض کنید. نمونه‌ها:

- [`config/mcp.local.example.json`](config/mcp.local.example.json)
- [`config/claude_desktop.example.json`](config/claude_desktop.example.json)
- [`config/codex.config.example.toml`](config/codex.config.example.toml)

### HTTP (remote / تونل)

```bash
# loopback بدون توکن مجاز است؛ برای تونل/هاست عمومی توکن اجباری است
node dist/index.js serve-http --host 127.0.0.1 --port 3847
```

Endpoint: `http://127.0.0.1:3847/mcp` — جزئیات امنیتی: [`SECURITY.md`](SECURITY.md).

---

## فهرست ابزارها

### جلالی

| ابزار | کار |
|--------|-----|
| `jalali_today` | امروز شمسی |
| `jalali_convert` | میلادی ↔ شمسی |
| `jalali_shift` | جابه‌جایی روز / اختلاف |
| `jalali_holidays` | تعطیلات خورشیدی |
| `jalali_month` | خلاصه ماه |
| `jalali_business_day` | روز کاری |
| `jalali_events` | رویداد فرهنگی / مذهبی تقریبی |
| `jalali_parse_phrase` | parse «فردا»، «۲۱ خرداد»، فینگلیش |

### متن و اعتبارسنجی

| ابزار | کار |
|--------|-----|
| `persian_normalize` / `persian_digits` / `persian_slugify` | نرمال‌سازی متن |
| `persian_polish` | ویراستاری (نیم‌فاصله، علائم، …) |
| `persian_finglish` | فینگلیش ↔ فارسی |
| `persian_validate` / `persian_batch_validate` | کدملی، شبا، کارت، موبایل، … |
| `persian_plate` / `persian_bill` | پلاک و قبض |
| `persian_amount` / `persian_words_to_number` / `persian_money` | مبلغ و ریال/تومان |
| `persian_financial` / `persian_sheba_convert` / `persian_bank_terminal` | بانک و شبا |
| `persian_passport` / `persian_crypto` | گذرنامه و آدرس کیف‌پول |
| `persian_generate_test` / `persian_sms_mock` | دادهٔ تست و OTP mock |

### ایران / جغرافیا

| ابزار | کار |
|--------|-----|
| `iran_provinces` / `iran_cities` / `iran_address` | استان و شهر و آبشار آدرس |
| `iran_villages` | جستجوی آبادی (دادهٔ رسمی) |
| `iran_postal` / `iran_landline` | کدپستی و تلفن ثابت → **حدس تقریبی** استان/شهر |
| `iran_address_complete` | تکمیل هوشمند فرم آدرس |
| `jalali_schedule_parse` | «پس‌فردا ساعت ۳» → تاریخ/ساعت |
| `local_doc_index` / `local_doc_search` / `codebase_search` | جست‌وجوی آفلاین داک و کد (+PDF) |
| `dev_error_explain` / `stacktrace_explain_fa` | توضیح خطا به فارسی |
| `moadian_validate` / `moadian_explain` / sample | مودیان آفلاین |
| `ipg_advise` / `ipg_simulate` / `bank_form_sync` | درگاه و فرم بانکی |
| `persian_form_schema` / `schema_labels_fa` / `iran_business_rules` | فرم و قوانین کسب‌وکار |
| `rtl_lint_snippet` / `rtl_fix_snippet` | لینت و فیکس RTL |
| `iran_national_id_place` | محل صدور از کدملی |
| `iran_gps` | مختصات → استان |
| `iran_banks` / `iran_geo_meta` | بانک‌ها و آمار geo |

### سایر

| ابزار | کار |
|--------|-----|
| `moadian_invoice` | شکل فاکتور مودیان (بدون API زنده) |
| `ipg_mock` | قرارداد درگاه پرداخت + mock |
| `mahsaagent_about` | نسخه و خلاصه قابلیت‌ها |

---

## استفاده به‌عنوان کتابخانه

```ts
import { nationalIdSchema, shebaSchema } from "mahsaagent/zod";
import { useJalali, useBankDetect } from "mahsaagent/react";
import { useBankSync } from "mahsaagent/react/forms";
import { useJalali as useJalaliVue } from "mahsaagent/vue";
import { createIpgRegistry } from "mahsaagent/ipg";
import { officialAddressCascade } from "mahsaagent/address";
import { buildMoadianInvoice } from "mahsaagent/moadian";
```

| مسیر export | محتوا |
|-------------|--------|
| `mahsaagent/zod` | اسکیما با پیام خطای فارسی |
| `mahsaagent/react` | هوک‌های جلالی، بانک، پول، polish |
| `mahsaagent/react/forms` | `useBankSync` و پل شبا↔حساب |
| `mahsaagent/vue` | composableهای Vue 3 |
| `mahsaagent/forms` | presets فرم + Zod runnable |
| `mahsaagent/ipg` · `mahsaagent/moadian` | پرداخت / مودیان (آفلاین) |
| `mahsaagent/address` | آبشار آدرس (legacy + رسمی) |
| `mahsaagent/jalali` · `mahsaagent/text` | هستهٔ تاریخ و متن |

---

## مهارت‌ها و قالب‌ها

### Skills (برای Cursor)

```bash
node dist/index.js install-skills
```

| skill | موضوع |
|-------|--------|
| `persian-ui` / `rtl-layout` / `persian-copy` | UI و RTL و متن |
| `jalali-dates` / `jalali-datepicker` | تاریخ و datepicker استاندارد بازار |
| `persian-forms` / `iran-forms-kit` | فرم ایرانی + RHF/Zod |
| `shadcn-persian` | الگوی shadcn فارسی |
| `iran-ipg` | اتصال درگاه بدون SDK موازی |
| `laravel-persian-validation` | نقشه به پکیج‌های Laravel |

### قالب Next.js

[`templates/next-rtl-iran`](templates/next-rtl-iran) — RTL + Zod فارسی + `react-multi-date-picker` + `useBankSync` + آدرس رسمی.

```bash
cd templates/next-rtl-iran
npm install
npm run dev
```

### افزونه VS Code / Cursor

پوشهٔ [`extension`](extension) — پنل RTL، درج امروز شمسی، polish و validate روی متن انتخاب‌شده.

### RTL در پنل چت

[`rtl/inject.js`](rtl/inject.js) و [`rtl/remove.js`](rtl/remove.js) — یا از دستورات افزونه کپی کنید.

---

## دادهٔ جغرافیایی

تقسیمات کشوری از مجموعهٔ [ahmadazizi/iran-cities](https://github.com/ahmadazizi/iran-cities) نسخهٔ **v3.0** تبدیل شده‌اند (MIT — [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)).

پیش‌فرض جستجوی شهر: **official**. جزئیات: [`docs/GEO-SOURCE.md`](docs/GEO-SOURCE.md)

بازسازی از CSV:

```bash
# فایل‌های CSV در tmp-iran-cities/
npm run import:geo
npm run build
```

---

## توسعه

```bash
npm run build      # tsc + کپی JSON به dist/data
npm test
npm run demo
npm run typecheck
npm run pack:check
```

راهنما: [`CONTRIBUTING.md`](CONTRIBUTING.md) · نمای محصول: [`docs/site/index.html`](docs/site/index.html)

---

## مجوز

[MIT](LICENSE) · اعلان‌های شخص ثالث: [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)

---

<p dir="ltr" align="left">
<strong>Mahsaagent</strong> — Persian developer toolkit for RTL, Jalali, Iranian validation, official geo, banks, and multi-client MCP tools.
<br />
Repo: <a href="https://github.com/mjpt1/mahsaagent">github.com/mjpt1/mahsaagent</a>
</p>
