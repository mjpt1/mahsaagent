"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { getJalaliNow } from "mahsaagent/react";
import { useBankSync } from "mahsaagent/react/forms";
import { officialAddressCascade } from "mahsaagent/address";
import { iranFormKitSchema, type IranFormKitValues } from "../lib/schemas";

export default function Page() {
  const today = useMemo(() => getJalaliNow("fa"), []);
  const form = useForm<IranFormKitValues>({
    resolver: zodResolver(iranFormKitSchema),
    defaultValues: {
      nationalId: "",
      mobile: "",
      sheba: "",
      jalaliDate: today.formatted,
      province: "",
      county: "",
    },
  });

  const sheba = form.watch("sheba");
  const province = form.watch("province");
  const county = form.watch("county");
  const bank = useBankSync({ sheba });
  const cascade = useMemo(
    () =>
      officialAddressCascade({
        ostan: province || undefined,
        shahrestan: county || undefined,
      }),
    [province, county]
  );

  return (
    <main>
      <h1>Mahsaagent</h1>
      <p className="lead">
        کیت فرم ایرانی — RHF + Zod فارسی + datepicker جلالی + bank sync · امروز: {today.formattedLong}
      </p>

      <form
        onSubmit={form.handleSubmit(() => {
          /* demo */
        })}
      >
        <label>
          کد ملی
          <input {...form.register("nationalId")} inputMode="numeric" />
          {form.formState.errors.nationalId && (
            <span className="error">{form.formState.errors.nationalId.message}</span>
          )}
        </label>

        <label>
          موبایل
          <input {...form.register("mobile")} inputMode="tel" placeholder="0912…" />
          {form.formState.errors.mobile && (
            <span className="error">{form.formState.errors.mobile.message}</span>
          )}
        </label>

        <label>
          شبا
          <input {...form.register("sheba")} placeholder="IR…" dir="ltr" />
          {form.formState.errors.sheba && (
            <span className="error">{form.formState.errors.sheba.message}</span>
          )}
          {bank.bank && (
            <span className="ok" style={{ display: "block", marginTop: 8 }}>
              بانک: {(bank.bank as { name?: string }).name ?? "—"}
              {bank.account ? ` · حساب: ${bank.account}` : ""}
            </span>
          )}
        </label>

        <label>
          تاریخ شمسی
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            calendarPosition="bottom-right"
            value={form.watch("jalaliDate")}
            onChange={(d) =>
              form.setValue("jalaliDate", d?.format?.("YYYY/MM/DD") ?? "", { shouldValidate: true })
            }
            inputClass="w-full"
            containerStyle={{ width: "100%" }}
            style={{ width: "100%", padding: "0.65rem 0.75rem", font: "inherit" }}
          />
          {form.formState.errors.jalaliDate && (
            <span className="error">{form.formState.errors.jalaliDate.message}</span>
          )}
        </label>

        <label>
          استان
          <select {...form.register("province")} onChange={(e) => {
            form.setValue("province", e.target.value);
            form.setValue("county", "");
          }}>
            <option value="">انتخاب استان</option>
            {cascade.provinces.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          شهرستان
          <select {...form.register("county")} disabled={!province}>
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

      {form.formState.isSubmitSuccessful && <div className="ok">فرم معتبر است.</div>}

      <p className="meta">
        از react-multi-date-picker + mahsaagent/zod + useBankSync — بدون ساخت datepicker سفارشی.
      </p>
    </main>
  );
}
