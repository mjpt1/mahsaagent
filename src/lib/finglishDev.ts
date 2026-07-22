import { finglishToPersian } from "./finglish.js";
import { normalizePersian } from "./text.js";

/** Common dev/tech Finglish → standard Persian or English term. */
const DEV_TERMS: Record<string, { fa: string; en: string }> = {
  commit: { fa: "کامیت", en: "commit" },
  push: { fa: "پوش", en: "push" },
  merge: { fa: "مرج", en: "merge" },
  branch: { fa: "برنچ", en: "branch" },
  repo: { fa: "مخزن", en: "repository" },
  api: { fa: "رابط برنامه‌نویسی", en: "API" },
  endpoint: { fa: "نقطهٔ پایانی", en: "endpoint" },
  deploy: { fa: "استقرار", en: "deploy" },
  build: { fa: "بیلد", en: "build" },
  test: { fa: "تست", en: "test" },
  lint: { fa: "لینت", en: "lint" },
  debug: { fa: "دیباگ", en: "debug" },
  stack: { fa: "پشته", en: "stack trace" },
  token: { fa: "توکن", en: "token" },
  auth: { fa: "احراز هویت", en: "authentication" },
  schema: { fa: "اسکیما", en: "schema" },
  migrate: { fa: "مهاجرت", en: "migration" },
  seed: { fa: "دادهٔ اولیه", en: "seed data" },
  mock: { fa: "موک", en: "mock" },
  sheba: { fa: "شبا", en: "Sheba IBAN" },
  moadian: { fa: "مودیان", en: "Moadian tax" },
  ipg: { fa: "درگاه پرداخت", en: "payment gateway" },
  jalali: { fa: "جلالی", en: "Jalali calendar" },
  rtl: { fa: "راست‌چین", en: "RTL" },
  npm: { fa: "npm", en: "npm" },
  docker: { fa: "داکر", en: "Docker" },
  ci: { fa: "یکپارچه‌سازی مداوم", en: "CI" },
  pr: { fa: "درخواست ادغام", en: "pull request" },
  issue: { fa: "ایشو", en: "issue" },
  changelog: { fa: "تاریخچهٔ تغییرات", en: "changelog" },
};

export function normalizeDevFinglish(input: string, target: "fa" | "en" | "both" = "both") {
  const tokens = input.trim().split(/\s+/);
  const mapped = tokens.map((raw) => {
    const key = raw.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const hit = DEV_TERMS[key];
    if (hit) {
      return target === "fa" ? hit.fa : target === "en" ? hit.en : { raw, ...hit };
    }
    const faGuess = finglishToPersian(raw);
    if (target === "fa") return faGuess;
    if (target === "en") return raw;
    return { raw, fa: faGuess, en: raw };
  });
  const persian = normalizePersian(
    mapped
      .map((m) => (typeof m === "string" ? m : "fa" in m ? m.fa : String(m)))
      .join(" ")
  );
  return {
    input,
    target,
    tokens: mapped,
    normalizedFa: persian,
    normalizedEn: tokens
      .map((t) => {
        const key = t.toLowerCase().replace(/[^a-z0-9_-]/g, "");
        return DEV_TERMS[key]?.en ?? t;
      })
      .join(" "),
  };
}

export function listDevTerms() {
  return Object.entries(DEV_TERMS).map(([key, v]) => ({ key, ...v }));
}
