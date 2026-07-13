---
name: jalali-dates
description: >
  Jalali (Shamsi / Solar Hijri) date handling for Persian products.
  Use when displaying dates to Iranian users, converting calendars,
  formatting long Persian dates, or working with official solar holidays.
---

# Jalali Dates

## Rules

- User-facing dates in Persian products: **Jalali** unless the domain requires Gregorian (aviation, international APIs).
- Prefer Mahsaagent tools: `jalali_today`, `jalali_convert`, `jalali_shift`, `jalali_holidays`.
- Storage in DB: prefer Gregorian/`Date`/`timestamptz`; convert at the edges for display.
- Never invent conversion math; use `jalaali-js` or Mahsaagent.

## Formats

| Use | Example |
|-----|---------|
| Compact | `1405/04/21` or `۱۴۰۵/۰۴/۲۱` |
| Long | `شنبه ۲۱ تیر ۱۴۰۵` |
| Month names | فروردین … اسفند |

## Holidays

- Mahsaagent lists **fixed solar** holidays only (Nowruz, 22 Bahman, …).
- Religious/lunar holidays move each year — do not hardcode them as fixed Jalali days.

## Code checklist

- [ ] Display layer uses Jalali
- [ ] Digits match product locale (fa vs en)
- [ ] Week starts Saturday in Persian calendars/UI when relevant
- [ ] Leap years via `isLeapJalaaliYear` / month length helpers
