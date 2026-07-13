# Jalali Calendar snippet for shadcn/ui

1. Enable RTL: `npx shadcn@latest init --rtl` (or migrate).
2. Install: `npm i react-day-picker date-fns`
3. In `components/ui/calendar.tsx` import DayPicker from `react-day-picker/persian`.
4. Load Vazirmatn for Persian glyphs.

Minimal usage:

```tsx
"use client";
import * as React from "react";
import { DayPicker } from "react-day-picker/persian";
import "react-day-picker/style.css";

export function JalaliCalendarDemo() {
  const [selected, setSelected] = React.useState<Date | undefined>();
  return (
    <div dir="rtl" lang="fa" className="font-[Vazirmatn,Tahoma,sans-serif]">
      <DayPicker mode="single" selected={selected} onSelect={setSelected} />
    </div>
  );
}
```

Validate form dates with Mahsaagent:

```ts
import { jalaliDateSchema, nationalIdSchema } from "mahsaagent/zod";
```
