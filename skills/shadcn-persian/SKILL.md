---
name: shadcn-persian
description: >
  Guides Jalali calendar and RTL setup for shadcn/ui and Tailwind Persian apps.
  Use when adding Persian date pickers, Vazirmatn fonts, or enabling RTL in shadcn.
---

# shadcn + Persian

## RTL

- Prefer `npx shadcn@latest init --rtl` or `migrate rtl` for logical CSS classes.
- Set `dir="rtl"` / `lang="fa"` on the document root.

## Font

```tsx
import { Vazirmatn } from "next/font/google";
const vazir = Vazirmatn({ subsets: ["arabic"], weight: ["400", "700"] });
```

## Jalali calendar

In `components/ui/calendar.tsx`:

```diff
- import { DayPicker } from "react-day-picker"
+ import { DayPicker } from "react-day-picker/persian"
```

See also Mahsaagent `templates/shadcn-persian/`.

## Forms

Validate Iranian fields with `mahsaagent/zod`:

```ts
import { nationalIdSchema, mobileSchema, jalaliDateSchema } from "mahsaagent/zod";
```

## Checklist

- [ ] Logical CSS (`ms-` / `me-` / `start` / `end`)
- [ ] Vazirmatn (or equivalent) loaded
- [ ] Dates shown in Jalali to users
- [ ] Code / LTR tokens stay LTR
