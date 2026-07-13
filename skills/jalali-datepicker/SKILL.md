---
name: jalali-datepicker
description: >
  Wire Jalali date pickers in React/Next using react-multi-date-picker (do not invent a new picker).
  Use when the user needs شمسی datepicker, range picker, or calendar UI.
---

# Jalali datepicker (market standard)

Do **not** build a custom calendar widget. Use the dominant package:

```bash
npm i react-multi-date-picker
```

```tsx
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export function JalaliField({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return (
    <DatePicker
      calendar={persian}
      locale={persian_fa}
      calendarPosition="bottom-right"
      value={value}
      onChange={(d) => onChange(d?.format?.("YYYY/MM/DD") ?? "")}
      inputClass="w-full"
      containerClassName="w-full"
    />
  );
}
```

## With Mahsaagent

- Validate string with `jalaliDateSchema` from `mahsaagent/zod`.
- Parse phrases like «فردا» via tools server `jalali_parse_phrase` or `parsePersianDatePhrase`.
- Business days: `jalali_business_day`.

## Accessibility

- Keep `dir="rtl"` on the form; the input can stay LTR for digits if preferred.
- Label in Persian; announce selected Jalali date to screen readers.
