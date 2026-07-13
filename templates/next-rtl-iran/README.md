# Next.js RTL + Iran forms (Mahsaagent template)

قالب مینیمال Next.js برای فرم‌های فارسی: `dir="rtl"`، تاریخ شمسی، اعتبارسنجی Zod فارسی، و آبشار آدرس.

## راه‌اندازی

```bash
# از ریشهٔ mahsaagent بعد از npm run build
cd templates/next-rtl-iran
npm install
npm run dev
```

در `package.json` این قالب به `mahsaagent` از مسیر نسبی لینک می‌شود؛ یا بعد از publish:

```bash
npm install mahsaagent
```

## چه چیزی داخل است

- `app/layout.tsx` — `lang="fa" dir="rtl"` + فونت Vazirmatn
- `app/page.tsx` — فرم تماس ایرانی (کدملی، موبایل، شبا، تاریخ شمسی)
- `lib/schemas.ts` — Zod با پیام خطای فارسی از `mahsaagent/zod`
- نمونهٔ آدرس آبشاری با `addressCascade`

بدون ذکر سرویس‌های مدل زبانی — فقط جعبه ابزار محلی.
