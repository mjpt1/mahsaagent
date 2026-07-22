export type ErrorHint = {
  id: string;
  match: RegExp;
  titleFa: string;
  summaryFa: string;
  causesFa: string[];
  fixesFa: string[];
  docs?: string;
};

const HINTS: ErrorHint[] = [
  {
    id: "econnrefused",
    match: /ECONNREFUSED|connect ECONNREFUSED/i,
    titleFa: "اتصال رد شد (ECONNREFUSED)",
    summaryFa: "برنامه نتوانست به سرور/پورت مقصد وصل شود.",
    causesFa: ["سرویس روشن نیست", "پورت اشتباه است", "فایروال یا VPN مسیر را بسته"],
    fixesFa: ["سرویس را استارت کنید", "host/port را در env چک کنید", "با curl یا telnet پورت را تست کنید"],
  },
  {
    id: "enotfound",
    match: /ENOTFOUND|getaddrinfo ENOTFOUND/i,
    titleFa: "نام دامنه پیدا نشد (ENOTFOUND)",
    summaryFa: "DNS نتوانست hostname را resolve کند.",
    causesFa: ["آدرس اشتباه", "مشکل DNS/اینترنت", "دامنهٔ داخلی بدون hosts"],
    fixesFa: ["URL را اصلاح کنید", "DNS یا hosts را بررسی کنید", "برای تست local از 127.0.0.1 استفاده کنید"],
  },
  {
    id: "module_not_found",
    match: /Cannot find module|MODULE_NOT_FOUND|ERR_MODULE_NOT_FOUND/i,
    titleFa: "ماژول پیدا نشد",
    summaryFa: "Node نتوانست فایل یا پکیج import‌شده را پیدا کند.",
    causesFa: ["npm install نشده", "مسیر import اشتباه", "پسوند .js در ESM فراموش شده"],
    fixesFa: ["npm ci یا npm install", "مسیر relative را چک کنید", "در type:module از .js در import استفاده کنید"],
  },
  {
    id: "permission_denied",
    match: /EACCES|EPERM|permission denied/i,
    titleFa: "مجوز دسترسی کافی نیست",
    summaryFa: "فایل/پوشه یا پورت نیاز به دسترسی بالاتر دارد.",
    causesFa: ["نوشتن در مسیر سیستمی", "پورت زیر ۱۰۲۴ بدون admin", "فایل قفل است"],
    fixesFa: ["مسیر کاربر را عوض کنید", "پورت بالاتر انتخاب کنید", "مالکیت فایل را بررسی کنید"],
  },
  {
    id: "cors",
    match: /CORS|Access-Control-Allow-Origin/i,
    titleFa: "خطای CORS در مرورگر",
    summaryFa: "مرورگر اجازهٔ درخواست cross-origin را نداد.",
    causesFa: ["سرور هدر CORS نمی‌فرستد", "origin مجاز نیست", "preflight OPTIONS شکست خورده"],
    fixesFa: ["هدر Access-Control-Allow-Origin را روی API بگذارید", "در dev از proxy استفاده کنید", "credentials و origin را هماهنگ کنید"],
  },
  {
    id: "401",
    match: /\b401\b|Unauthorized|unauthorized/i,
    titleFa: "احراز هویت ناموفق (۴۰۱)",
    summaryFa: "توکن/سشن معتبر نیست یا ارسال نشده.",
    causesFa: ["Bearer token اشتباه", "سشن منقضی", "هدر Authorization نیست"],
    fixesFa: ["توکن را تازه کنید", "هدر Authorization: Bearer را بفرستید", "ساعت سیستم را چک کنید"],
  },
  {
    id: "typescript_type",
    match: /TS\d{4}:|Type '.*' is not assignable/i,
    titleFa: "خطای TypeScript",
    summaryFa: "نوع داده با تعریف تایپ سازگار نیست.",
    causesFa: ["prop اشتباه", "null/undefined بدون guard", "نسخهٔ @types قدیمی"],
    fixesFa: ["پیام TSxxxx را در مستندات TS بخوانید", "نوع خروجی تابع را صریح کنید", "strictNullChecks را در نظر بگیرید"],
  },
  {
    id: "python_indent",
    match: /IndentationError|TabError/i,
    titleFa: "خطای تورفتگی Python",
    summaryFa: "فاصله‌گذاری یا tab/space مخلوط شده.",
    causesFa: ["tab و space مخلوط", "بلوک ناقص"],
    fixesFa: ["یکنواخت space=4", "ادیتور را روی spaces تنظیم کنید"],
  },
  {
    id: "npm_eneedauth",
    match: /ENEEDAUTH|need auth/i,
    titleFa: "نیاز به ورود npm",
    summaryFa: "برای publish یا برخی دستورات npm باید لاگین کنید.",
    causesFa: ["npm login نشده", "توکن منقضی"],
    fixesFa: ["npm login", "NPM_TOKEN در CI تنظیم کنید"],
  },
  {
    id: "mahsaagent_http_auth",
    match: /Refusing to start HTTP MCP without MAHSAAGENT_TOKEN/i,
    titleFa: "سرور HTTP Mahsaagent بدون توکن",
    summaryFa: "روی هاست غیرمحلی بدون توکن امنیتی استارت نمی‌شود.",
    causesFa: ["MAHSAAGENT_TOKEN تنظیم نشده", "bind به 0.0.0.0"],
    fixesFa: ["MAHSAAGENT_TOKEN=secret تنظیم کنید", "یا 127.0.0.1 bind کنید"],
    docs: "SECURITY.md",
  },
];

export function explainErrorText(text: string) {
  const hits = HINTS.filter((h) => h.match.test(text)).map((h) => ({
    id: h.id,
    titleFa: h.titleFa,
    summaryFa: h.summaryFa,
    causesFa: h.causesFa,
    fixesFa: h.fixesFa,
    docs: h.docs,
  }));
  return {
    input: text.slice(0, 4000),
    matches: hits,
    count: hits.length,
    note: hits.length ? undefined : "الگوی شناخته‌شده‌ای پیدا نشد — متن کامل را برای agent بفرستید.",
  };
}

export function explainStackTrace(stack: string) {
  const lines = stack.split(/\r?\n/).filter(Boolean);
  const headline = lines[0] ?? "";
  const frames = lines
    .slice(1)
    .filter((l) => /^\s*at\s/.test(l))
    .slice(0, 12)
    .map((l) => l.trim());
  const base = explainErrorText(stack);
  return {
    ...base,
    headline,
    frames,
    frameCount: frames.length,
    tipFa:
      frames.length > 0
        ? "اولین فریم مربوط به کد شما (نه node_modules) را پیدا کنید."
        : undefined,
  };
}
