---
name: persian-forms
description: >
  Iranian form fields, validation, and locale-aware inputs.
  Use when building signup, checkout, KYC, address, or billing forms
  for users in Iran (national ID, mobile, Sheba, postal code, plates).
---

# Persian Forms

## Field map

| Field | Rules | Mahsaagent tool |
|-------|--------|-----------------|
| کد ملی | 10 digits + checksum | `persian_validate` kind=`national_id` |
| شناسه ملی حقوقی | legal entity id | `persian_validate` kind=`legal_id` |
| موبایل | 09xxxxxxxxx | `persian_validate` kind=`mobile` |
| شبا | IR + 24 digits | `persian_validate` kind=`sheba` |
| کارت | 16 digits + bank detect | `persian_validate` kind=`card` |
| کد پستی | 10 digits, not starting with 0 | `persian_validate` kind=`postal_code` |
| پلاک | car/motorcycle formats | `persian_plate` |
| قبض | billId + paymentId | `persian_bill` |

## UX

- Accept Persian digits in inputs; normalize with `persian_digits` / `persian_normalize` before validate.
- Show bank name after valid card/Sheba when available.
- Errors in Persian, next to the field.
- LTR for Sheba, card, email, URL fields (`dir="ltr"`).

## Do not

- Roll your own national-id checksum.
- Store Sheba without `IR` prefix inconsistently — normalize once.
