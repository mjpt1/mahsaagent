export type RtlIssue = {
  rule: string;
  severity: "error" | "warn" | "info";
  messageFa: string;
  snippet?: string;
};

const RULES: Array<{
  id: string;
  severity: RtlIssue["severity"];
  messageFa: string;
  test: (code: string) => boolean;
}> = [
  {
    id: "margin-left-physical",
    severity: "warn",
    messageFa: "از margin-left/right فیزیکی استفاده شده — در RTL از margin-inline-start/end یا logical properties استفاده کنید.",
    test: (c) => /\bmargin-left\s*:/.test(c) || /\bmargin-right\s*:/.test(c),
  },
  {
    id: "padding-left-physical",
    severity: "warn",
    messageFa: "padding-left/right فیزیکی — ترجیحاً padding-inline.",
    test: (c) => /\bpadding-left\s*:/.test(c) || /\bpadding-right\s*:/.test(c),
  },
  {
    id: "text-align-left",
    severity: "info",
    messageFa: "text-align: left در UI فارسی ممکن است نادرست باشد — text-align: start یا dir=rtl را بررسی کنید.",
    test: (c) => /text-align\s*:\s*left/i.test(c),
  },
  {
    id: "float-left",
    severity: "warn",
    messageFa: "float: left/right — در RTL از flex/grid و logical properties استفاده کنید.",
    test: (c) => /float\s*:\s*(left|right)/i.test(c),
  },
  {
    id: "missing-dir-rtl",
    severity: "info",
    messageFa: "در HTML ریشه یا container، dir=\"rtl\" یا lang=\"fa\" دیده نشد.",
    test: (c) => /<html|<body|<main|<div/i.test(c) && !/dir\s*=\s*["']rtl["']/i.test(c),
  },
  {
    id: "icon-chevron-ltr",
    severity: "info",
    messageFa: "آیکون جهت‌دار (chevron-left/right) — در RTL معمولاً باید mirror شود.",
    test: (c) => /chevron-(left|right)|arrow-(left|right)|ml-\d|mr-\d|pl-\d|pr-\d/i.test(c),
  },
  {
    id: "tailwind-ml-mr",
    severity: "warn",
    messageFa: "کلاس‌های Tailwind ml-/mr-/pl-/pr- — در RTL از ms-/me-/ps-/pe- استفاده کنید.",
    test: (c) => /\b(m[lr]|p[lr])-\d/.test(c),
  },
];

export function lintRtlSnippet(code: string, kind: "html" | "css" | "tsx" | "auto" = "auto") {
  const detected =
    kind === "auto"
      ? /<[a-z][\s\S]*>/i.test(code)
        ? "html"
        : /\{[\s\S]*\}/.test(code)
          ? "tsx"
          : "css"
      : kind;
  const issues: RtlIssue[] = [];
  for (const r of RULES) {
    if (r.test(code)) {
      issues.push({ rule: r.id, severity: r.severity, messageFa: r.messageFa });
    }
  }
  return {
    kind: detected,
    issueCount: issues.length,
    issues,
    passed: issues.filter((i) => i.severity === "error").length === 0,
    tipFa: "این لینتر الگومحور است — برای UI واقعی dir=rtl و logical properties را ترکیب کنید.",
  };
}
