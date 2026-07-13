"use client";

import { useMemo, useState } from "react";
import { iranFormSchema } from "../lib/schemas";
import { addressCascade } from "mahsaagent/address";
import { getJalaliNow } from "mahsaagent/react";

export default function Page() {
  const today = useMemo(() => getJalaliNow("fa"), []);
  const [province, setProvince] = useState("");
  const [county, setCounty] = useState("");
  const cascade = useMemo(
    () => addressCascade({ province: province || undefined, county: county || undefined }),
    [province, county]
  );

  const [form, setForm] = useState({
    nationalId: "",
    mobile: "",
    sheba: "",
    jalaliDate: today.formatted.replace(/\//g, "/"),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ok, setOk] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOk(false);
    const parsed = iranFormSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setOk(true);
  }

  return (
    <main>
      <h1>Mahsaagent</h1>
      <p className="lead">فرم نمونهٔ فارسی — امروز: {today.formattedLong}</p>

      <form onSubmit={onSubmit}>
        <label>
          کد ملی
          <input
            value={form.nationalId}
            onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
            inputMode="numeric"
          />
          {errors.nationalId && <span className="error">{errors.nationalId}</span>}
        </label>

        <label>
          موبایل
          <input
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            inputMode="tel"
            placeholder="0912…"
          />
          {errors.mobile && <span className="error">{errors.mobile}</span>}
        </label>

        <label>
          شبا
          <input
            value={form.sheba}
            onChange={(e) => setForm({ ...form, sheba: e.target.value })}
            placeholder="IR…"
          />
          {errors.sheba && <span className="error">{errors.sheba}</span>}
        </label>

        <label>
          تاریخ شمسی
          <input
            value={form.jalaliDate}
            onChange={(e) => setForm({ ...form, jalaliDate: e.target.value })}
            placeholder="۱۴۰۵/۰۱/۰۱"
          />
          {errors.jalaliDate && <span className="error">{errors.jalaliDate}</span>}
        </label>

        <label>
          استان
          <select
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              setCounty("");
            }}
          >
            <option value="">انتخاب استان</option>
            {cascade.provinces.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          شهرستان
          <select value={county} onChange={(e) => setCounty(e.target.value)} disabled={!province}>
            <option value="">انتخاب شهرستان</option>
            {cascade.counties.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <button type="submit">اعتبارسنجی</button>
      </form>

      {ok && <div className="ok">فرم معتبر است.</div>}

      <p className="meta">
        بخش‌ها و اعتبارسنجی از جعبه ابزار Mahsaagent — بدون وابستگی به سرویس خارجی مدل.
      </p>
    </main>
  );
}
