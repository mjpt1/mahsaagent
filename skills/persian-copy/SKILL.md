---
name: persian-copy
description: >
  Persian product copywriting and microcopy for interfaces and docs.
  Use when writing Farsi labels, errors, empty states, onboarding,
  or polishing Persian marketing/UI text.
---

# Persian Copy

## Tone

- Clear, respectful, short.
- Avoid bureaucratic fluff and literal English calques.
- Prefer verbs users understand: «ذخیره»، «ارسال»، «ادامه»، «بازگشت».

## Microcopy patterns

| Situation | Prefer |
|-----------|--------|
| Empty list | هنوز موردی ثبت نشده است. |
| Network error | اتصال برقرار نشد. دوباره تلاش کنید. |
| Success | با موفقیت ذخیره شد. |
| Required field | این فیلد الزامی است. |
| Invalid national ID | کد ملی معتبر نیست. |

## Orthography

- ی/ک فارسی (نه ي/ك عربی)
- نیم‌فاصله در می‌شود، کتاب‌ها، برنامه‌نویسی
- ارقام فارسی در متن کاربرمحور؛ لاتین در کد و شناسه‌های فنی

## Do not

- Mix registers randomly (خیلی خودمونی vs خیلی اداری) in one flow
- Paste unedited machine translation
- Use «لطفاً کلیک نمایید» when «کلیک کنید» is enough

## Checklist

- [ ] One idea per sentence
- [ ] Errors say what happened and what to do next
- [ ] Buttons are actions, not nouns when a verb is clearer
- [ ] Run Mahsaagent `persian_normalize` on final strings when unsure
