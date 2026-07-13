import {
  todayJalali,
  gregorianToJalali,
  jalaliToGregorian,
  formatJalali,
  formatJalaliLong,
  holidaysForJalaliDate,
  holidaysForJalaliMonth,
  addJalaliDays,
  parseJalaliString,
} from "./lib/jalali.js";
import { summarizeMonth } from "./lib/calendar.js";
import {
  normalizePersian,
  convertDigits,
  slugifyPersian,
  validateNationalId,
  validateSheba,
  validateCard,
  validateMobile,
  validatePostalCode,
  validateLegalId,
  amountToPersianWords,
  formatAmountFa,
  analyzePersianText,
  wordsToAmount,
  batchValidate,
  listOrFindProvinces,
} from "./lib/text.js";
import { searchCities, lookupPostalCode, lookupLandline } from "./lib/geo.js";
import { detectFinancial } from "./lib/financial.js";
import { todayBusinessInfo } from "./lib/businessDays.js";

function section(title: string) {
  console.log("\n" + "═".repeat(50));
  console.log("  " + title);
  console.log("═".repeat(50));
}

export async function runDemo() {
  section("۱) امروز شمسی — jalali_today");
  const today = todayJalali();
  console.log("کوتاه:", formatJalali(today, { digits: "fa" }));
  console.log("بلند: ", formatJalaliLong(today, { digits: "fa" }));
  console.log("تعطیلات امروز:", holidaysForJalaliDate(today.year, today.month, today.day));
  console.log("+۷ روز:", formatJalaliLong(addJalaliDays(today, 7), { digits: "fa" }));

  section("۲) تبدیل و parse — jalali_convert");
  const nowruz = gregorianToJalali(2024, 3, 20);
  console.log("2024-03-20 →", formatJalali(nowruz, { digits: "fa" }));
  const g = jalaliToGregorian(1405, 1, 1);
  console.log(
    "1405/01/01 →",
    `${g.year}-${String(g.month).padStart(2, "0")}-${String(g.day).padStart(2, "0")}`
  );
  console.log("parse ۱۴۰۵/۰۴/۲۱ →", parseJalaliString("۱۴۰۵/۰۴/۲۱"));

  section("۳) ماه و تعطیلات — jalali_month / holidays");
  console.log(summarizeMonth(today.year, 1, "fa"));
  for (const h of holidaysForJalaliMonth(1)) {
    console.log(`  ${h.month}/${h.day}  ${h.title}`);
  }

  section("۴) متن — normalize / digits / slug");
  const dirty = "علي مي رود به كتاب ها ۱۲۳";
  console.log("قبل:", dirty);
  console.log("بعد:", normalizePersian(dirty, { digits: "fa", halfSpace: true }));
  console.log("digits:", convertDigits("123۴۵٦", "en_to_fa"));
  console.log("slug:  ", slugifyPersian("چگونه برنامه‌نویسی یاد بگیریم؟"));
  console.log("analyze:", analyzePersianText("سلام دنیا"));

  section("۵) اعتبارسنجی — validate / batch");
  console.log("کدملی →", validateNationalId("0499370899"));
  console.log("شناسه حقوقی نمونه نامعتبر →", validateLegalId("123"));
  console.log("شبا →", {
    valid: validateSheba("IR820540102680020817909002").valid,
    bank: validateSheba("IR820540102680020817909002").info?.persianName,
  });
  console.log("کارت →", validateCard("6219861034529007"));
  console.log("موبایل →", {
    valid: validateMobile("۰۹۱۲۳۴۵۶۷۸۹").valid,
    operator: validateMobile("۰۹۱۲۳۴۵۶۷۸۹").detail?.operator,
  });
  console.log("کدپستی →", validatePostalCode("1234567890"));
  console.log(
    "batch →",
    batchValidate([
      { kind: "national_id", value: "0499370899" },
      { kind: "mobile", value: "09123456789" },
    ]).map((r) => ({ kind: r.kind, valid: r.valid }))
  );

  section("۶) مبلغ و حروف — amount / words");
  console.log("۱۲۳۴۵۶۷ →", formatAmountFa(1234567), "/", amountToPersianWords(1234567));
  console.log("words →", wordsToAmount("یک میلیون و دویست و سی و چهار هزار"));

  section("۷) استان‌ها — iran_provinces");
  console.log(
    "جستجوی فارس →",
    listOrFindProvinces("فارس").provinces.map((p) => `${p.name} (${p.capital})`)
  );

  section("۸) شهر / کدپستی / تلفن ثابت — geo");
  console.log(
    "cities شیراز →",
    searchCities("شیراز").cities.slice(0, 3).map((c) => `${c.name} (${c.province})`)
  );
  console.log("postal 7134567890 →", lookupPostalCode("7134567890"));
  console.log("landline 07131234567 →", lookupLandline("07131234567"));

  section("۹) مالی و روز کاری — financial / business");
  const fin = detectFinancial("IR820540102680020817909002");
  console.log("financial Sheba →", {
    kind: fin.kind,
    valid: fin.valid,
    bank: fin.kind === "unknown" ? null : fin.bank,
  });
  const biz = todayBusinessInfo();
  console.log("business today →", {
    date: formatJalali(biz.date, { digits: "fa" }),
    isBusinessDay: biz.isBusinessDay,
    next: formatJalali(biz.nextBusinessDay, { digits: "fa" }),
  });

  section("۱۰) v0.5 — polish / money / address / moadian");
  const { polishPersian } = await import("./lib/polish.js");
  const { convertMoney } = await import("./lib/currency.js");
  const { addressCascade } = await import("./lib/address.js");
  const { generateTestNationalId } = await import("./lib/generators.js");
  const { moadianSetupGuide } = await import("./moadian/index.js");
  console.log("polish →", polishPersian("سلام ,دنیا?"));
  console.log("money 10k toman → rial", convertMoney(10000, "toman", "rial"));
  console.log("gen national_id →", generateTestNationalId(7));
  console.log("address تهران counties →", addressCascade({ province: "تهران" }).counties.length);
  console.log(moadianSetupGuide().split("\n")[0]);

  console.log("\n✓ Mahsaagent demo تمام شد.\n");
}
