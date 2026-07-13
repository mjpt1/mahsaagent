# Mahsaagent

جعبه ابزار فارسی برای محیط توسعه — RTL، جلالی، اعتبارسنجی ایرانی، geo رسمی، بانک، MCP چندکلاینته.

## v0.6.1 — بستن شکاف‌های بازار

| مورد | وضعیت |
|------|--------|
| Geo رسمی iran-cities (~۹۸k آبادی) | ✓ |
| کدپستی/تلفن ثابت → شهر | ✓ |
| کدملی → محل صدور | ✓ |
| پلاک با شهر/استان | ✓ |
| NLP تاریخ + فینگلیش/غلط‌کیبورد | ✓ |
| کیت فرم Next (RHF + datepicker + bank sync) | ✓ |
| IPG contract + skill | ✓ |
| Vue composables + Laravel skill | ✓ |
| polish غنی‌تر | ✓ |
| **۴۳ ابزار** / تست‌ها سبز | ✓ |

```bash
npm install && npm run build
npx mahsaagent tools
npx mahsaagent serve-http --port 3847
```

کلاینت‌ها: [`docs/clients.md`](docs/clients.md) · داک: [`docs/site`](docs/site/index.html)

انتشار npm: `npm login && npm publish`

MIT
