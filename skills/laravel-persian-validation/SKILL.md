---
name: laravel-persian-validation
description: >
  Point Laravel apps to existing Persian validation packages; map fields to Mahsaagent Zod/MCP equivalents.
---

# Laravel Persian validation

Do not reinvent validators in PHP inside this repo. Prefer:

```bash
composer require sadegh19b/laravel-persian-validation
```

Map concepts:

| Laravel / domain | Mahsaagent |
|------------------|------------|
| کد ملی | `nationalIdSchema` / `persian_validate` |
| شبا | `shebaSchema` / `persian_sheba_convert` |
| موبایل | `mobileSchema` |
| تاریخ شمسی | `jalaliDateSchema` / `jalali_parse_phrase` |

For Node backends sharing rules with a Laravel API, keep a single contract in OpenAPI and validate each side with its native package.
