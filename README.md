# Mahsaagent

جعبه ابزار فارسی برای محیط توسعه — راست‌چین (RTL)، تاریخ شمسی، اعتبارسنجی داده‌های ایرانی، شهر/شهرستان/روستا، بانک/شبا، مودیان (stub)، و مهارت‌های رابط/متن فارسی.

**Mahsaagent** — Persian developer toolkit: RTL panels, Jalali helpers, Iranian validation, geo & banks, and reusable skills.

---

## v0.5 در یک نگاه

| بخش | جزئیات |
|-----|--------|
| **۳۴ ابزار** | جلالی، متن/پرداخت، اعتبارسنجی، شبا↔حساب، پول ریال/تومان، SMS mock، آدرس آبشاری، روستا، مودیان stub |
| **Zod فارسی** | `import { nationalIdSchema } from "mahsaagent/zod"` — پیام خطا به فارسی |
| **React** | `mahsaagent/react` — `useJalali`، `useBankDetect`، … |
| **Geo** | شهر (~۱۱۹۵) + شهرستان + بخش + روستاهای وابسته به بخش |
| **بانک** | لوگو CDN + تبدیل شبا↔شماره حساب + تولید دادهٔ تست |
| **قالب Next** | `templates/next-rtl-iran` — RTL + فرم ایرانی |
| **افزونه** | پنل، درج امروز شمسی، پرداخت متن، اعتبارسنجی انتخاب |
| **مودیان** | `mahsaagent/moadian` — ساخت payload بدون فراخوانی زنده |

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
npx mahsaagent polish "سلام ,دنیا?"
npx mahsaagent money 10000 toman rial
npx mahsaagent sheba sheba_to_account IR820540102680020817909002
npx mahsaagent gen national_id 42
npx mahsaagent address --province تهران
npx mahsaagent villages --province تهران
npx mahsaagent moadian
npx mahsaagent tools
npx mahsaagent doctor
```

### اتصال به کلاینت‌ها (Cursor / Claude / ChatGPT)

راهنمای کامل: [`docs/clients.md`](docs/clients.md)

**stdio** (محلی — Cursor، Claude Desktop، ChatGPT Desktop / Codex):

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

**HTTP** (برای connector وب ChatGPT یا تونل HTTPS):

```bash
npx mahsaagent serve-http --port 3847
# endpoint: http://127.0.0.1:3847/mcp
```

نمونه‌ها: [`config/mcp.local.example.json`](config/mcp.local.example.json) · [`config/claude_desktop.example.json`](config/claude_desktop.example.json) · [`config/codex.config.example.toml`](config/codex.config.example.toml)

---

## فهرست ابزارها (جدید در ۰٫۵)

| ابزار | کار |
|--------|-----|
| `persian_polish` | پرداخت متن فارسی |
| `persian_money` | ریال ↔ تومان + گرد کردن بانکی |
| `persian_sheba_convert` | شبا ↔ شماره حساب |
| `persian_generate_test` | تولید کدملی/شبا تست |
| `persian_sms_mock` | قرارداد OTP + mock |
| `iran_address` | استان → شهرستان → بخش/شهر |
| `iran_villages` | جستجوی روستا (وابسته به بخش) |
| `moadian_invoice` | ساخت/راهنمای فاکتور مودیان |

ابزارهای قبلی v0.4 (جلالی، اعتبارسنجی، شهر، بانک، …) همچنان فعال‌اند — با `mahsaagent tools` ببینید.

Exports: `mahsaagent` · `jalali` · `text` · `zod` · `react` · `moadian` · `address`

---

## RTL و افزونه

1. Command Palette → **Mahsaagent: Open panel**
2. یا کپی اسکریپت RTL → Developer Tools → Console  
3. درج امروز شمسی / پرداخت متن انتخاب‌شده / اعتبارسنجی انتخاب

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
