# Mahsaagent

جعبه ابزار فارسی برای محیط توسعه — راست‌چین، تاریخ شمسی، اعتبارسنجی ایرانی، geo رسمی (iran-cities)، بانک، MCP چندکلاینته، و مهارت‌های UI.

---

## v0.6 در یک نگاه

| بخش | جزئیات |
|-----|--------|
| **۴۱+ ابزار** | جلالی+NLP تاریخ، geo رسمی (~۹۸k آبادی)، GPS، گذرنامه/crypto، IPG mock، فینگلیش |
| **Geo رسمی** | `ahmadazizi/iran-cities` v3 |
| **Zod** | پیام فارسی + passport/crypto |
| **React / Vue** | hooks + `useBankSync` / composables |
| **قالب و skill** | Next RTL، `jalali-datepicker`، `iran-forms-kit` |
| **داک** | [`docs/site`](docs/site/index.html) · [`docs/clients.md`](docs/clients.md) |

---

## نصب

```bash
git clone https://github.com/mjpt1/mahsaagent.git
cd mahsaagent
npm install
npm run build
```

انتشار npm (وقتی لاگین باشید):

```bash
npm publish
```

### CLI نمونه

```bash
npx mahsaagent today
npx mahsaagent serve-http --port 3847
npx mahsaagent tools
```

### کلاینت‌ها

Cursor / Claude Desktop / ChatGPT — راهنما: [`docs/clients.md`](docs/clients.md)

---

## مجوز

MIT
