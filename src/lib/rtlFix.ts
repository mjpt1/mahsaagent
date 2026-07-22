export type RtlFix = {
  rule: string;
  before: string;
  after: string;
  messageFa: string;
};

const REPLACEMENTS: Array<{
  id: string;
  pattern: RegExp;
  replace: string | ((m: string, ...args: string[]) => string);
  messageFa: string;
}> = [
  {
    id: "tailwind-ml-ms",
    pattern: /\bml-(\d+)\b/g,
    replace: "ms-$1",
    messageFa: "ml-* → ms-* (logical start)",
  },
  {
    id: "tailwind-mr-me",
    pattern: /\bmr-(\d+)\b/g,
    replace: "me-$1",
    messageFa: "mr-* → me-* (logical end)",
  },
  {
    id: "tailwind-pl-ps",
    pattern: /\bpl-(\d+)\b/g,
    replace: "ps-$1",
    messageFa: "pl-* → ps-*",
  },
  {
    id: "tailwind-pr-pe",
    pattern: /\bpr-(\d+)\b/g,
    replace: "pe-$1",
    messageFa: "pr-* → pe-*",
  },
  {
    id: "tailwind-left-start",
    pattern: /\bleft-(\d+)\b/g,
    replace: "start-$1",
    messageFa: "left-* → start-*",
  },
  {
    id: "tailwind-right-end",
    pattern: /\bright-(\d+)\b/g,
    replace: "end-$1",
    messageFa: "right-* → end-*",
  },
  {
    id: "css-margin-left",
    pattern: /margin-left\s*:/g,
    replace: "margin-inline-start:",
    messageFa: "margin-left → margin-inline-start",
  },
  {
    id: "css-margin-right",
    pattern: /margin-right\s*:/g,
    replace: "margin-inline-end:",
    messageFa: "margin-right → margin-inline-end",
  },
  {
    id: "css-padding-left",
    pattern: /padding-left\s*:/g,
    replace: "padding-inline-start:",
    messageFa: "padding-left → padding-inline-start",
  },
  {
    id: "css-padding-right",
    pattern: /padding-right\s*:/g,
    replace: "padding-inline-end:",
    messageFa: "padding-right → padding-inline-end",
  },
  {
    id: "text-align-left",
    pattern: /text-align\s*:\s*left/gi,
    replace: "text-align: start",
    messageFa: "text-align:left → start",
  },
  {
    id: "text-align-right",
    pattern: /text-align\s*:\s*right/gi,
    replace: "text-align: end",
    messageFa: "text-align:right → end",
  },
  {
    id: "float-left",
    pattern: /float\s*:\s*left/gi,
    replace: "float: inline-start",
    messageFa: "float:left → inline-start (یا flex)",
  },
  {
    id: "float-right",
    pattern: /float\s*:\s*right/gi,
    replace: "float: inline-end",
    messageFa: "float:right → inline-end",
  },
  {
    id: "chevron-left",
    pattern: /chevron-left/gi,
    replace: "chevron-right",
    messageFa: "آیکون جهت در RTL معمولاً mirror می‌شود",
  },
];

/** Rewrite CSS/HTML/TSX snippet toward RTL-safe logical properties. */
export function fixRtlSnippet(code: string) {
  let out = code;
  const applied: RtlFix[] = [];
  for (const r of REPLACEMENTS) {
    if (!r.pattern.test(out)) continue;
    r.pattern.lastIndex = 0;
    const before = out;
    out = out.replace(r.pattern, r.replace as string);
    if (out !== before) {
      applied.push({
        rule: r.id,
        before: before.slice(0, 120),
        after: out.slice(0, 120),
        messageFa: r.messageFa,
      });
    }
  }
  // Ensure dir=rtl on bare <html> opening tags
  if (/<html\b[^>]*>/i.test(out) && !/<html\b[^>]*\bdir\s*=/i.test(out)) {
    out = out.replace(/<html\b/i, '<html dir="rtl" lang="fa"');
    applied.push({
      rule: "html-dir-rtl",
      before: "<html",
      after: '<html dir="rtl" lang="fa"',
      messageFa: "dir=rtl و lang=fa به html اضافه شد",
    });
  }

  return {
    changed: applied.length > 0,
    fixCount: applied.length,
    applied,
    code: out,
    tipFa: "بازبینی بصری کنید — بعضی ml در LTR-only containers درست است.",
  };
}
