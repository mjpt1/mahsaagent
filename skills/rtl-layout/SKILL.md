---
name: rtl-layout
description: >
  Applies production Right-to-Left layout rules for Persian and Arabic interfaces.
  Use when implementing RTL pages, mirroring layouts, fixing bidirectional text,
  or converting LTR CSS/components to RTL-safe code.
---

# RTL Layout

## Core principles

1. Prefer **CSS logical properties** over physical `left` / `right`.
2. Set `dir="rtl"` on the document or locale root; do not flip the whole app with `transform: scaleX(-1)`.
3. Keep **code, numbers in tables when technical, icons that depict direction carefully**.

## CSS

```css
.page {
  direction: rtl;
  text-align: start;
}

.card {
  margin-inline: auto;
  padding-inline: 1rem;
  border-inline-start: 3px solid var(--accent);
}

.row {
  display: flex;
  flex-direction: row; /* with dir=rtl, main-start is right */
  gap: 0.75rem;
}
```

### Replace physical with logical

| Avoid | Prefer |
|-------|--------|
| `margin-left` | `margin-inline-start` |
| `padding-right` | `padding-inline-end` |
| `left` / `right` | `inset-inline-start` / `inset-inline-end` |
| `text-align: left` | `text-align: start` |
| `border-left` | `border-inline-start` |

## Bidirectional text

- Mixed Persian + English: wrap Latin product names in isolated spans if needed: `<span dir="ltr">GitHub</span>`.
- Input fields for URLs, emails, code: `dir="ltr"` on that control.
- Markdown / chat panels: body RTL, `pre` / `code` LTR (see Mahsaagent `rtl/mahsaagent-rtl.css`).

## Components

- Chevrons and “back” arrows: mirror in RTL.
- Progress steppers: flow inline-start → inline-end.
- Modals/drawers: preserve reading order; don’t break focus order.

## Framework notes

- **Tailwind**: use `ms-` / `me-` / `ps-` / `pe-` / `start` / `end` utilities; enable `rtl` variant when needed.
- **React**: set `dir` from locale; avoid hardcoded `left` in style objects.

## Do not

- Force entire IDE chrome RTL (window controls break).
- Flip canvases, charts, or code editors.
- Use `direction: rtl` on `pre` / Monaco / terminal.
