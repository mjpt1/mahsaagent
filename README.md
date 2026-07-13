# Mahsaagent

جعبه ابزار فارسی برای محیط توسعه — راست‌چین (RTL)، تاریخ شمسی، اعتبارسنجی داده‌های ایرانی، شهر/کدپستی/بانک، و مهارت‌های رابط/متن فارسی.

**Mahsaagent** — Persian developer toolkit: RTL panels, Jalali helpers, Iranian validation, geo & banks, and reusable skills.

---

## v0.4 در یک نگاه

| بخش | جزئیات |
|-----|--------|
| **۲۶ ابزار** | جلالی + روز کاری + رویدادها، متن، اعتبارسنجی، مالی/بانک، شهرها، کدپستی، تلفن ثابت |
| **Zod** | `import { nationalIdSchema } from "mahsaagent/zod"` |
| **Geo** | جستجوی شهر (~۱۱۹۵)، پیشوند کدپستی → استان، پیش‌شماره تلفن ثابت |
| **CLI** | `cities` `postal` `landline` `financial` `banks` `business` `events` … |
| **۶ Skill** | پنج skill قبلی + `shadcn-persian` (+ قالب `templates/`) |
| **RTL** | inject / remove + نوار وضعیت افزونه |

---

## نصب

```bash
git clone https://github.com/mjpt1/mahsaagent.git
cd mahsaagent
npm install
npm run build
```

### CLI

```bash
npx mahsaagent demo
npx mahsaagent today
npx mahsaagent convert 2026-03-21
npx mahsaagent normalize "علي مي رود"
npx mahsaagent validate national_id 0499370899
npx mahsaagent amount 1234567
npx mahsaagent words "یک میلیون و دویست"
npx mahsaagent provinces فارس
npx mahsaagent cities شیراز
npx mahsaagent postal 7134567890
npx mahsaagent landline 07131234567
npx mahsaagent financial IR820540102680020817909002
npx mahsaagent banks
npx mahsaagent business
npx mahsaagent events 1405
npx mahsaagent tools
npx mahsaagent doctor
npx mahsaagent install-skills
```

### اتصال به Cursor

در تنظیمات ابزارهای Cursor:

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

`ABS_PATH` را با مسیر واقعی کلون عوض کن. نمونه: [`config/mcp.local.example.json`](config/mcp.local.example.json)

---

## فهرست ابزارها

| ابزار | کار |
|--------|-----|
| `jalali_today` | امروز شمسی + فرم بلند |
| `jalali_convert` | میلادی ↔ شمسی + parse |
| `jalali_shift` | ±روز / اختلاف |
| `jalali_holidays` | تعطیلات ثابت خورشیدی |
| `jalali_month` | خلاصه/جدول روزهای ماه |
| `jalali_business_day` | روز کاری / جمعه / تعطیل |
| `jalali_events` | رویدادهای فرهنگی و تقریبی مذهبی |
| `persian_normalize` | ی/ک، نیم‌فاصله، تحلیل |
| `persian_digits` | تبدیل ارقام |
| `persian_slugify` | اسلاگ فارسی |
| `persian_validate` | کدملی، حقوقی، شبا، کارت، موبایل، کدپستی |
| `persian_batch_validate` | چند فیلد یکجا |
| `persian_plate` | پلاک |
| `persian_bill` | قبض |
| `persian_extract_cards` | استخراج کارت از متن |
| `persian_amount` | مبلغ → ارقام/حروف |
| `persian_words_to_number` | حروف → عدد |
| `persian_time_ago` | زمان نسبی گذشته |
| `persian_remaining` | زمان باقی‌مانده |
| `persian_financial` | تشخیص کارت/شبا + بانک |
| `iran_provinces` | استان و مرکز |
| `iran_cities` | جستجوی شهر / شهرهای استان |
| `iran_postal` | کدپستی → استان (پیشوند) |
| `iran_landline` | پیش‌شماره تلفن ثابت → استان |
| `iran_banks` | فهرست بانک‌های محلی |
| `mahsaagent_about` | نسخه و فهرست قابلیت‌ها |

Resources: `mahsaagent://holidays/solar` · `mahsaagent://iran/provinces` · `mahsaagent://jalali/months`

Exports: `mahsaagent` · `mahsaagent/jalali` · `mahsaagent/text` · `mahsaagent/zod`

---

## RTL

1. **Mahsaagent: Copy RTL snippet** → Console → Paste  
2. برای حذف: **Copy RTL remove snippet**  
3. یا فایل‌های [`rtl/inject.js`](rtl/inject.js) و [`rtl/remove.js`](rtl/remove.js)

---

## توسعه

```bash
npm run build
npm test
npm run demo
```

`build` با `tsc` کامپایل می‌کند و سپس `scripts/copy-data.mjs` فایل‌های `src/data/*.json` را به `dist/data/` کپی می‌کند.

---

## مجوز

MIT — [`LICENSE`](LICENSE)
