# دادهٔ تقسیمات کشوری (iran-cities)

فایل‌های `src/data/official/*.json` از مجموعهٔ [ahmadazizi/iran-cities](https://github.com/ahmadazizi/iran-cities) **برچسب v3.0** تبدیل شده‌اند.

| فیلد | مقدار |
|------|--------|
| منبع | `ahmadazizi/iran-cities` |
| برچسب | `v3.0` |
| تاریخ import در Mahsaagent | `2026-07-13` |
| مجوز بالادستی | MIT (جزئیات در `THIRD_PARTY_NOTICES.md`) |

## بازتولید

```bash
# ۱) CSVهای release v3.0 را در tmp-iran-cities بگذارید
# ۲) تبدیل:
npm run import:geo
```

اسکریپت `scripts/import-iran-cities.mjs` شمارش‌ها را با meta مقایسه می‌کند و در صورت خالی بودن جداول خطا می‌دهد.

## دوگانگی legacy در برابر official

| مسیر | منبع |
|------|------|
| پیش‌فرض `iran_cities` / `iran_address` / villages | **official** (iran-cities v3) |
| `source: "legacy"` | لیست قدیمی‌تر `cities.json` / counties |

برای پاسخ یکدست، مگر نیاز صریح به لیست قدیمی، از official استفاده کنید.
