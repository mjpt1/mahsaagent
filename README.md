# Mahsaagent

جعبه ابزار فارسی برای محیط توسعه — راست‌چین (RTL)، تاریخ شمسی، اعتبارسنجی داده‌های ایرانی، استان‌ها، و مهارت‌های رابط/متن فارسی.

**Mahsaagent** — Persian developer toolkit: RTL panels, Jalali helpers, Iranian validation, provinces, and reusable skills.

---

## v0.3 در یک نگاه

| بخش | جزئیات |
|-----|--------|
| **۱۹ ابزار** | جلالی، ماه‌نما، متن، اعتبارسنجی دسته‌ای، پلاک، قبض، مبلغ↔حروف، زمان نسبی، استان‌ها |
| **۳ Resource** | تعطیلات خورشیدی · استان‌ها · نام ماه‌ها |
| **CLI کامل** | `today` `convert` `normalize` `validate` `amount` `words` `provinces` … |
| **۵ Skill** | `persian-ui` · `rtl-layout` · `jalali-dates` · `persian-forms` · `persian-copy` |
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
| `iran_provinces` | استان و مرکز |
| `mahsaagent_about` | نسخه و فهرست قابلیت‌ها |

Resources: `mahsaagent://holidays/solar` · `mahsaagent://iran/provinces` · `mahsaagent://jalali/months`

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

---

## مجوز

MIT — [`LICENSE`](LICENSE)
