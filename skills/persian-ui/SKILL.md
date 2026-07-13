---
name: persian-ui
description: >
  Guides Persian (Farsi) user-interface copy, typography, and locale details.
  Use when building Persian UI, writing Farsi labels, fixing half-spaces,
  choosing fonts, or handling Jalali dates in front-end code.
---

# Persian UI

## When to apply

- Any screen, component, or copy meant for Persian readers
- Forms, buttons, errors, empty states, dates, currency
- Mixed Persian + English product UI

## Typography

- Prefer **Vazirmatn** (or an explicit Persian webfont). Do not rely on Tahoma alone for product UI.
- Use CSS logical properties: `margin-inline`, `padding-inline`, `inset-inline-start`, `text-align: start`.
- Keep code, IDs, and technical tokens in Latin / LTR.

## Copy rules

- Use Persian ye (ی) and ke (ک), not Arabic ي / ك.
- Prefer half-space (`\u200c`) where natural: `می‌شود`, `کتاب‌ها`, `می‌روم`.
- Short labels; avoid literal English calques when a clear Persian phrase exists.
- Numbers shown to users: Persian digits when the product is Persian-first (`۱۲۳۴`), unless the field is technical (IBAN, card, code).

## Dates & money

- User-facing dates: **Jalali (شمسی)** unless the domain requires Gregorian.
- Format example: `1405/01/15` or `۱۵ فروردین ۱۴۰۵`.
- Money: Persian digits + thousands separators; state currency clearly (ریال / تومان).

## Forms

- Labels above or inline-start of fields.
- Errors in Persian, specific, next to the field.
- Validate national ID, mobile, Sheba with proper checksums — do not invent checksum logic; use Mahsaagent tools or `@persian-tools/persian-tools`.

## Checklist before finishing UI work

- [ ] No Arabic ye/ke leftovers in user-visible strings
- [ ] RTL layout via logical CSS (not only `float: right` hacks)
- [ ] Code blocks / monospace stay LTR
- [ ] Dates Jalali where appropriate
- [ ] Font stack includes a Persian face
