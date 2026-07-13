import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  todayJalali,
  gregorianToJalali,
  jalaliToGregorian,
  formatJalali,
  formatJalaliLong,
  isValidJalali,
  isLeapJalaliYear,
  jalaliMonthLength,
  holidaysForJalaliDate,
  holidaysForJalaliMonth,
  allSolarHolidays,
  addJalaliDays,
  diffJalaliDays,
  parseJalaliString,
} from "./lib/jalali.js";
import { jalaliMonthCalendar, summarizeMonth } from "./lib/calendar.js";
import {
  normalizePersian,
  convertDigits,
  analyzePersianText,
  slugifyPersian,
  validateNationalId,
  validateLegalId,
  validateSheba,
  validateCard,
  validateMobile,
  validatePostalCode,
  parsePlate,
  parseBill,
  extractCardsFromText,
  amountToPersianWords,
  formatAmountFa,
  wordsToAmount,
  batchValidate,
  safeTimeAgo,
  safeRemainingTime,
  listOrFindProvinces,
} from "./lib/text.js";
import { JALALI_MONTHS_FA } from "./data/months.js";
import { SOLAR_HOLIDAYS } from "./data/holidays.js";
import { PROVINCES } from "./data/provinces.js";
import {
  searchCities,
  citiesByProvince,
  lookupPostalCode,
  lookupLandline,
  listProvinceTelPrefixes,
} from "./lib/geo.js";
import {
  isBusinessDay,
  nextBusinessDay,
  businessDaysBetween,
  todayBusinessInfo,
} from "./lib/businessDays.js";
import { eventsForDate, eventsForYear } from "./data/events.js";
import { detectFinancial, listBanks, shebaToAccount, accountToSheba } from "./lib/financial.js";
import { addressCascade } from "./lib/address.js";
import { polishPersian } from "./lib/polish.js";
import { convertMoney, formatMoneyFa, bankRound } from "./lib/currency.js";
import {
  generateTestNationalId,
  generateTestSheba,
  validateLegalIdDetailed,
} from "./lib/generators.js";
import { MockSmsProvider, buildOtpMessage, generateOtp } from "./lib/sms.js";
import { buildMoadianInvoice, moadianSetupGuide } from "./moadian/index.js";
import { parsePersianDatePhrase } from "./lib/dateNlp.js";
import { holidaysForYear, isHolidayDate } from "./data/holidayPacks.js";
import {
  officialAddressCascade,
  searchOfficialVillages,
  searchOfficialCities,
  listShahrestan,
  listBakhsh,
  listDehestan,
  officialMeta,
  listOfficialOstans,
} from "./lib/officialGeo.js";
import {
  validatePassport,
  validateCryptoAddress,
  provinceFromGps,
  postalToPlace,
} from "./lib/extraValidate.js";
import { finglishToPersian, persianToFinglish } from "./lib/finglish.js";
import { createIpgRegistry } from "./ipg/index.js";

export const TOOL_NAMES = [
  "jalali_today",
  "jalali_convert",
  "jalali_shift",
  "jalali_holidays",
  "jalali_month",
  "jalali_business_day",
  "jalali_events",
  "jalali_parse_phrase",
  "persian_normalize",
  "persian_digits",
  "persian_slugify",
  "persian_polish",
  "persian_finglish",
  "persian_validate",
  "persian_batch_validate",
  "persian_plate",
  "persian_bill",
  "persian_extract_cards",
  "persian_amount",
  "persian_words_to_number",
  "persian_money",
  "persian_time_ago",
  "persian_remaining",
  "persian_financial",
  "persian_sheba_convert",
  "persian_generate_test",
  "persian_sms_mock",
  "persian_passport",
  "persian_crypto",
  "iran_provinces",
  "iran_cities",
  "iran_address",
  "iran_villages",
  "iran_postal",
  "iran_landline",
  "iran_gps",
  "iran_banks",
  "iran_geo_meta",
  "moadian_invoice",
  "ipg_mock",
  "mahsaagent_about",
] as const;

export function createServer() {
  const server = new McpServer({
    name: "mahsaagent",
    version: "0.6.0",
  });

  function json(data: unknown) {
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    };
  }

  server.tool(
    "jalali_today",
    "Return today's Jalali (Shamsi) date with long Persian form and solar holidays.",
    { digits: z.enum(["fa", "en"]).optional() },
    async ({ digits }) => {
      const parts = todayJalali();
      const d = digits ?? "fa";
      return json({
        ...parts,
        monthName: JALALI_MONTHS_FA[parts.month - 1],
        formatted: formatJalali(parts, { digits: d }),
        formattedLong: formatJalaliLong(parts, { digits: d }),
        leapYear: isLeapJalaliYear(parts.year),
        monthLength: jalaliMonthLength(parts.year, parts.month),
        holidays: holidaysForJalaliDate(parts.year, parts.month, parts.day),
      });
    }
  );

  server.tool(
    "jalali_convert",
    "Convert between Gregorian and Jalali, or parse a Jalali string like 1405/04/21.",
    {
      direction: z.enum(["to_jalali", "to_gregorian", "parse"]).optional(),
      year: z.number().int().optional(),
      month: z.number().int().min(1).max(12).optional(),
      day: z.number().int().min(1).max(31).optional(),
      date: z.string().optional().describe("Jalali string for parse, e.g. 1405/04/21"),
      digits: z.enum(["fa", "en"]).optional(),
    },
    async (args) => {
      const digits = args.digits ?? "fa";
      if (args.direction === "parse" || (args.date && !args.year)) {
        const parts = parseJalaliString(args.date ?? "");
        if (!parts) return json({ error: "Could not parse Jalali date", input: args.date });
        const g = jalaliToGregorian(parts.year, parts.month, parts.day);
        return json({
          jalali: parts,
          gregorian: g,
          formatted: formatJalali(parts, { digits }),
          formattedLong: formatJalaliLong(parts, { digits }),
          holidays: holidaysForJalaliDate(parts.year, parts.month, parts.day),
        });
      }
      const year = args.year!;
      const month = args.month!;
      const day = args.day!;
      const direction = args.direction ?? "to_jalali";
      if (direction === "to_jalali") {
        const parts = gregorianToJalali(year, month, day);
        return json({
          jalali: parts,
          formatted: formatJalali(parts, { digits }),
          formattedLong: formatJalaliLong(parts, { digits }),
          holidays: holidaysForJalaliDate(parts.year, parts.month, parts.day),
        });
      }
      if (!isValidJalali(year, month, day)) {
        return json({ error: "Invalid Jalali date", year, month, day });
      }
      const g = jalaliToGregorian(year, month, day);
      return json({
        gregorian: g,
        formatted: `${g.year}-${String(g.month).padStart(2, "0")}-${String(g.day).padStart(2, "0")}`,
        holidays: holidaysForJalaliDate(year, month, day),
      });
    }
  );

  server.tool(
    "jalali_shift",
    "Add/subtract days from a Jalali date, or diff two Jalali dates in days.",
    {
      mode: z.enum(["add_days", "diff_days"]),
      year: z.number().int(),
      month: z.number().int().min(1).max(12),
      day: z.number().int().min(1).max(31),
      days: z.number().int().optional().describe("For add_days"),
      otherYear: z.number().int().optional(),
      otherMonth: z.number().int().optional(),
      otherDay: z.number().int().optional(),
      digits: z.enum(["fa", "en"]).optional(),
    },
    async (args) => {
      const a = { year: args.year, month: args.month, day: args.day };
      if (!isValidJalali(a.year, a.month, a.day)) return json({ error: "Invalid date", ...a });
      if (args.mode === "add_days") {
        const result = addJalaliDays(a, args.days ?? 0);
        return json({
          from: a,
          days: args.days ?? 0,
          result,
          formatted: formatJalali(result, { digits: args.digits ?? "fa" }),
          formattedLong: formatJalaliLong(result, { digits: args.digits ?? "fa" }),
        });
      }
      const b = {
        year: args.otherYear!,
        month: args.otherMonth!,
        day: args.otherDay!,
      };
      return json({ a, b, days: diffJalaliDays(a, b) });
    }
  );

  server.tool(
    "jalali_holidays",
    "List fixed solar official holidays (month 1–12, or all). Lunar/religious dates shift yearly and are omitted.",
    { month: z.number().int().min(1).max(12).optional() },
    async ({ month }) =>
      json({
        month: month ?? null,
        holidays: month ? holidaysForJalaliMonth(month) : allSolarHolidays(),
        note: "Only fixed solar holidays. Religious/lunar dates are not included.",
      })
  );

  server.tool(
    "jalali_month",
    "Jalali month overview: length, holiday days, optional full day grid with weekdays.",
    {
      year: z.number().int(),
      month: z.number().int().min(1).max(12),
      full: z.boolean().optional().describe("If true, include every day of the month"),
      digits: z.enum(["fa", "en"]).optional(),
    },
    async ({ year, month, full, digits }) => {
      const d = digits ?? "fa";
      if (full) return json(jalaliMonthCalendar(year, month, d));
      return json(summarizeMonth(year, month, d));
    }
  );

  server.tool(
    "persian_normalize",
    "Normalize Persian text: Arabic ی/ک → Persian, half-space, optional digit conversion.",
    {
      text: z.string(),
      digits: z.enum(["fa", "en", "keep"]).optional(),
      halfSpace: z.boolean().optional(),
    },
    async ({ text, digits, halfSpace }) =>
      json({
        input: text,
        output: normalizePersian(text, {
          digits: digits ?? "keep",
          halfSpace: halfSpace ?? true,
        }),
        analysis: analyzePersianText(text),
      })
  );

  server.tool(
    "persian_digits",
    "Convert digits between English, Persian, and Arabic-Indic.",
    {
      text: z.string(),
      direction: z.enum(["en_to_fa", "fa_to_en", "ar_to_fa"]),
    },
    async ({ text, direction }) =>
      json({ input: text, direction, output: convertDigits(text, direction) })
  );

  server.tool(
    "persian_slugify",
    "Build a URL-safe slug from Persian (or mixed) text.",
    {
      text: z.string(),
      separator: z.string().optional(),
    },
    async ({ text, separator }) =>
      json({ input: text, slug: slugifyPersian(text, separator ?? "-") })
  );

  server.tool(
    "persian_validate",
    "Validate Iranian national ID, legal ID, Sheba, bank card, mobile, or postal code.",
    {
      kind: z.enum(["national_id", "legal_id", "sheba", "card", "mobile", "postal_code"]),
      value: z.string(),
    },
    async ({ kind, value }) => {
      switch (kind) {
        case "national_id":
          return json({ kind, ...validateNationalId(value) });
        case "legal_id":
          return json({ kind, ...validateLegalId(value) });
        case "sheba":
          return json({ kind, ...validateSheba(value) });
        case "card":
          return json({ kind, ...validateCard(value) });
        case "mobile":
          return json({ kind, ...validateMobile(value) });
        case "postal_code":
          return json({ kind, ...validatePostalCode(value) });
      }
    }
  );

  server.tool(
    "persian_batch_validate",
    "Validate several Iranian identity/payment fields in one call.",
    {
      fields: z
        .array(
          z.object({
            kind: z.enum(["national_id", "legal_id", "sheba", "card", "mobile", "postal_code"]),
            value: z.string(),
          })
        )
        .min(1)
        .max(40),
    },
    async ({ fields }) => json({ results: batchValidate(fields) })
  );

  server.tool(
    "persian_plate",
    "Parse an Iranian vehicle plate number (car or motorcycle formats).",
    { plate: z.string() },
    async ({ plate }) => json(parsePlate(plate))
  );

  server.tool(
    "persian_bill",
    "Parse Iranian utility bill id / payment id / barcode (آب، برق، گاز، …).",
    {
      billId: z.string().optional(),
      paymentId: z.string().optional(),
      barcode: z.string().optional(),
      currency: z.enum(["toman", "rial"]).optional(),
    },
    async (params) => json(parseBill(params))
  );

  server.tool(
    "persian_extract_cards",
    "Extract and validate Iranian bank card numbers from free text.",
    { text: z.string() },
    async ({ text }) => json({ cards: extractCardsFromText(text) })
  );

  server.tool(
    "persian_amount",
    "Format amount with Persian digits/commas and convert to Persian words.",
    { amount: z.union([z.number(), z.string()]) },
    async ({ amount }) =>
      json({
        amount,
        formattedFa: formatAmountFa(amount),
        words: amountToPersianWords(amount),
      })
  );

  server.tool(
    "persian_words_to_number",
    "Convert Persian amount words to a number (e.g. یک میلیون و دویست).",
    { text: z.string() },
    async ({ text }) => json(wordsToAmount(text))
  );

  server.tool(
    "persian_time_ago",
    "Human-readable Persian time-ago for a date string (Jalali or Gregorian depending on library support).",
    { date: z.string() },
    async ({ date }) => json(safeTimeAgo(date))
  );

  server.tool(
    "persian_remaining",
    "Human-readable remaining time until a future date.",
    { date: z.string() },
    async ({ date }) => json(safeRemainingTime(date))
  );

  server.tool(
    "iran_provinces",
    "List or search Iran provinces and capitals (Persian + English).",
    { query: z.string().optional() },
    async ({ query }) => json(listOrFindProvinces(query))
  );

  server.tool(
    "jalali_business_day",
    "Check business day (not Friday / not official solar holiday), next business day, or count between two Jalali dates.",
    {
      mode: z.enum(["check", "next", "between", "today"]).optional(),
      year: z.number().int().optional(),
      month: z.number().int().min(1).max(12).optional(),
      day: z.number().int().min(1).max(31).optional(),
      otherYear: z.number().int().optional(),
      otherMonth: z.number().int().optional(),
      otherDay: z.number().int().optional(),
    },
    async (args) => {
      const mode = args.mode ?? "today";
      if (mode === "today") return json(todayBusinessInfo());
      const a = { year: args.year!, month: args.month!, day: args.day! };
      if (mode === "check") {
        return json({
          date: a,
          isBusinessDay: isBusinessDay(a),
          nextBusinessDay: nextBusinessDay(a),
        });
      }
      if (mode === "next") return json({ from: a, next: nextBusinessDay(a) });
      const b = { year: args.otherYear!, month: args.otherMonth!, day: args.otherDay! };
      return json({ from: a, to: b, businessDays: businessDaysBetween(a, b) });
    }
  );

  server.tool(
    "jalali_events",
    "Cultural solar + approximate religious events for a Jalali year or a specific day.",
    {
      year: z.number().int(),
      month: z.number().int().min(1).max(12).optional(),
      day: z.number().int().min(1).max(31).optional(),
    },
    async ({ year, month, day }) => {
      if (month && day) {
        return json({
          year,
          month,
          day,
          events: eventsForDate(year, month, day),
          holidayPack: isHolidayDate(year, month, day),
          officialSolar: holidaysForJalaliDate(year, month, day),
        });
      }
      return json({
        year,
        events: eventsForYear(year),
        holidayPack: holidaysForYear(year),
        note: "Religious entries are approximate (±1 day possible).",
      });
    }
  );

  server.tool(
    "jalali_parse_phrase",
    "Parse Persian/Finglish date phrases (امروز، فردا، ۲۱ خرداد، جمعه) into Jalali parts.",
    { text: z.string() },
    async ({ text }) => json(parsePersianDatePhrase(text))
  );

  server.tool(
    "iran_postal",
    "Validate Iranian postal code and infer province from prefix.",
    { code: z.string() },
    async ({ code }) => json(postalToPlace(code))
  );

  server.tool(
    "iran_cities",
    "Search Iranian cities (legacy list + official iran-cities shahr).",
    {
      query: z.string().optional(),
      province: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
      source: z.enum(["legacy", "official", "both"]).optional(),
    },
    async ({ query, province, limit, source }) => {
      const src = source ?? "both";
      const lim = limit ?? 20;
      if (province && src !== "official") {
        const legacy = citiesByProvince(province, lim);
        if (src === "legacy") return json(legacy);
        return json({
          legacy,
          official: searchOfficialCities(province, lim),
        });
      }
      const q = query ?? "";
      if (src === "legacy") return json(searchCities(q, lim));
      if (src === "official") return json(searchOfficialCities(q, lim));
      return json({
        legacy: searchCities(q, lim),
        official: searchOfficialCities(q, lim),
      });
    }
  );

  server.tool(
    "iran_landline",
    "Lookup Iranian landline area code → province (and list known prefixes).",
    {
      phone: z.string().optional(),
      listPrefixes: z.boolean().optional(),
    },
    async ({ phone, listPrefixes }) => {
      if (listPrefixes) return json({ prefixes: listProvinceTelPrefixes() });
      if (!phone) return json({ error: "Provide phone or listPrefixes:true" });
      return json(lookupLandline(phone));
    }
  );

  server.tool(
    "persian_financial",
    "Detect and validate Iranian bank card or Sheba; attach bank registry info + logo URL.",
    { value: z.string() },
    async ({ value }) => json(detectFinancial(value))
  );

  server.tool(
    "persian_sheba_convert",
    "Convert Sheba ↔ account number (best-effort account extract / build IBAN with MOD-97).",
    {
      mode: z.enum(["sheba_to_account", "account_to_sheba"]),
      sheba: z.string().optional(),
      bankCode: z.string().optional(),
      account: z.string().optional(),
    },
    async ({ mode, sheba, bankCode, account }) => {
      if (mode === "sheba_to_account") {
        if (!sheba) return json({ error: "sheba required" });
        return json(shebaToAccount(sheba));
      }
      if (!bankCode || !account) return json({ error: "bankCode and account required" });
      return json(accountToSheba(bankCode, account));
    }
  );

  server.tool(
    "persian_polish",
    "Polish Persian text (punctuation, ZWNJ, quotes, hamzeh) — virastar-inspired.",
    {
      text: z.string(),
      digits: z.enum(["fa", "en", "keep"]).optional(),
      zwnj: z.boolean().optional(),
    },
    async ({ text, digits, zwnj }) =>
      json({ polished: polishPersian(text, { digits: digits ?? "keep", zwnj }) })
  );

  server.tool(
    "persian_finglish",
    "Convert Finglish ↔ Persian (best-effort) for search and UX.",
    {
      text: z.string(),
      direction: z.enum(["to_persian", "to_finglish"]).optional(),
    },
    async ({ text, direction }) => {
      const dir = direction ?? "to_persian";
      return json({
        direction: dir,
        result: dir === "to_persian" ? finglishToPersian(text) : persianToFinglish(text),
      });
    }
  );

  server.tool(
    "persian_money",
    "Rial ↔ Toman with bank-style rounding and Persian formatted output.",
    {
      amount: z.union([z.number(), z.string()]),
      from: z.enum(["rial", "toman"]).optional(),
      to: z.enum(["rial", "toman"]).optional(),
    },
    async ({ amount, from, to }) => {
      const f = from ?? "toman";
      const t = to ?? "toman";
      const converted = convertMoney(amount, f, t);
      return json({
        ...converted,
        labeled: formatMoneyFa(converted.value, t),
        bankRoundExample: bankRound(Number(amount)),
      });
    }
  );

  server.tool(
    "persian_generate_test",
    "Generate valid-looking national ID / Sheba for tests (not real people/accounts). Legal ID detail check.",
    {
      kind: z.enum(["national_id", "sheba", "legal_id_check"]),
      bankCode: z.string().optional(),
      seed: z.number().optional(),
      value: z.string().optional(),
    },
    async ({ kind, bankCode, seed, value }) => {
      if (kind === "national_id") return json({ nationalId: generateTestNationalId(seed) });
      if (kind === "sheba") return json({ sheba: generateTestSheba(bankCode ?? "054", seed) });
      if (!value) return json({ error: "value required for legal_id_check" });
      return json(validateLegalIdDetailed(value));
    }
  );

  server.tool(
    "persian_sms_mock",
    "SMS/OTP contract helpers + in-memory mock send (no real gateway).",
    {
      action: z.enum(["otp", "send_mock"]),
      mobile: z.string().optional(),
      code: z.string().optional(),
      appName: z.string().optional(),
      length: z.number().int().min(4).max(8).optional(),
    },
    async ({ action, mobile, code, appName, length }) => {
      if (action === "otp") {
        const otp = code ?? generateOtp(length ?? 6);
        const msg = buildOtpMessage(otp, appName ?? "App");
        return json({ otp, message: msg });
      }
      const provider = new MockSmsProvider();
      const otp = code ?? generateOtp(length ?? 6);
      const msg = { ...buildOtpMessage(otp, appName ?? "App"), to: mobile ?? "09121234567" };
      const result = await provider.send(msg);
      return json({ result, sent: provider.sent });
    }
  );

  server.tool(
    "iran_banks",
    "List Iranian banks in the local registry (name, sheba code, card prefixes, logo CDN).",
    {},
    async () => json({ banks: listBanks() })
  );

  server.tool(
    "persian_passport",
    "Validate Iranian passport number format.",
    { value: z.string() },
    async ({ value }) => json(validatePassport(value))
  );

  server.tool(
    "persian_crypto",
    "Validate crypto wallet address (TRC20 / ERC20 / BTC) format.",
    { address: z.string() },
    async ({ address }) => json(validateCryptoAddress(address))
  );

  server.tool(
    "iran_gps",
    "Map GPS coordinates → Iranian province (local polygon lookup).",
    { latitude: z.number(), longitude: z.number() },
    async ({ latitude, longitude }) => json(provinceFromGps(latitude, longitude))
  );

  server.tool(
    "iran_geo_meta",
    "Official iran-cities dataset counts (ostan/shahrestan/bakhsh/dehestan/shahr/abadi).",
    {},
    async () => json(officialMeta())
  );

  server.tool(
    "iran_address",
    "Cascading address from official iran-cities: ostan → shahrestan → bakhsh/dehestan → shahr.",
    {
      province: z.string().optional(),
      county: z.string().optional(),
      cityQuery: z.string().optional(),
      list: z.enum(["counties", "districts", "rural", "ostans"]).optional(),
      limit: z.number().int().min(1).max(200).optional(),
    },
    async ({ province, county, cityQuery, list, limit }) => {
      if (list === "ostans") return json(listOfficialOstans());
      if (list === "counties") return json(listShahrestan(province, limit ?? 80));
      if (list === "districts")
        return json(listBakhsh({ ostan: province, shahrestan: county, limit: limit ?? 80 }));
      if (list === "rural")
        return json(listDehestan({ ostan: province, shahrestan: county, limit: limit ?? 80 }));
      // Prefer official cascade; keep legacy helper as fallback key
      return json({
        official: officialAddressCascade({
          ostan: province,
          shahrestan: county,
          cityQuery,
        }),
        legacy: addressCascade({ province, county, cityQuery }),
      });
    }
  );

  server.tool(
    "iran_villages",
    "Search official villages/abadi (~98k) from iran-cities v3 (province/county filters).",
    {
      query: z.string().optional(),
      province: z.string().optional(),
      county: z.string().optional(),
      district: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async (args) =>
      json(
        searchOfficialVillages(args.query ?? "", {
          ostan: args.province,
          shahrestan: args.county,
          dehestan: args.district,
          limit: args.limit,
        })
      )
  );

  server.tool(
    "ipg_mock",
    "Iranian IPG contract + mock pay/verify (no live gateways). Use official SDKs behind IpgDriver.",
    {
      action: z.enum(["guide", "pay", "verify", "drivers"]).optional(),
      amount: z.number().optional(),
      callbackUrl: z.string().optional(),
      authority: z.string().optional(),
    },
    async ({ action, amount, callbackUrl, authority }) => {
      const reg = createIpgRegistry();
      const act = action ?? "guide";
      if (act === "guide") return json({ guide: reg.guide() });
      if (act === "drivers") return json({ drivers: reg.list() });
      if (act === "pay") {
        return json(
          await reg.pay("mock", {
            amount: amount ?? 10000,
            callbackUrl: callbackUrl ?? "https://example.com/callback",
          })
        );
      }
      return json(
        await reg.verify("mock", { authority: authority ?? "MOCK-1", amount: amount ?? 10000 })
      );
    }
  );

  server.tool(
    "moadian_invoice",
    "Build/validate Moadian tax invoice payload shape + setup guide (no live tax API calls).",
    {
      action: z.enum(["guide", "build"]).optional(),
      invoice: z.record(z.unknown()).optional(),
    },
    async ({ action, invoice }) => {
      if ((action ?? "guide") === "guide") return json({ guide: moadianSetupGuide() });
      if (!invoice) return json({ error: "invoice object required for build" });
      return json(buildMoadianInvoice(invoice as Parameters<typeof buildMoadianInvoice>[0]));
    }
  );

  server.tool(
    "mahsaagent_about",
    "Mahsaagent version, tool list, and quick capability summary.",
    {},
    async () =>
      json({
        name: "mahsaagent",
        version: "0.6.0",
        description: "Persian developer toolkit: RTL, Jalali, locale validation, geo, banks, UI skills",
        tools: TOOL_NAMES,
        toolCount: TOOL_NAMES.length,
        skills: [
          "persian-ui",
          "rtl-layout",
          "jalali-dates",
          "persian-forms",
          "persian-copy",
          "shadcn-persian",
          "jalali-datepicker",
          "iran-forms-kit",
        ],
        resources: [
          "mahsaagent://holidays/solar",
          "mahsaagent://iran/provinces",
          "mahsaagent://jalali/months",
          "mahsaagent://iran/banks",
        ],
        exports: [
          "mahsaagent/zod",
          "mahsaagent/react",
          "mahsaagent/react/forms",
          "mahsaagent/vue",
          "mahsaagent/moadian",
          "mahsaagent/ipg",
          "mahsaagent/address",
        ],
        transports: ["stdio", "streamable-http"],
        geo: officialMeta(),
        clientsDoc: "docs/clients.md",
      })
  );

  server.resource(
    "solar-holidays",
    "mahsaagent://holidays/solar",
    { mimeType: "application/json", description: "Fixed solar Jalali holidays (Iran)" },
    async () => ({
      contents: [
        {
          uri: "mahsaagent://holidays/solar",
          mimeType: "application/json",
          text: JSON.stringify(SOLAR_HOLIDAYS, null, 2),
        },
      ],
    })
  );

  server.resource(
    "iran-provinces",
    "mahsaagent://iran/provinces",
    { mimeType: "application/json", description: "Iran provinces and capitals" },
    async () => ({
      contents: [
        {
          uri: "mahsaagent://iran/provinces",
          mimeType: "application/json",
          text: JSON.stringify(PROVINCES, null, 2),
        },
      ],
    })
  );

  server.resource(
    "jalali-months",
    "mahsaagent://jalali/months",
    { mimeType: "application/json", description: "Jalali month names (Persian)" },
    async () => ({
      contents: [
        {
          uri: "mahsaagent://jalali/months",
          mimeType: "application/json",
          text: JSON.stringify(
            JALALI_MONTHS_FA.map((name, i) => ({ month: i + 1, name })),
            null,
            2
          ),
        },
      ],
    })
  );

  server.resource(
    "iran-banks",
    "mahsaagent://iran/banks",
    { mimeType: "application/json", description: "Iranian bank registry (local)" },
    async () => ({
      contents: [
        {
          uri: "mahsaagent://iran/banks",
          mimeType: "application/json",
          text: JSON.stringify(listBanks(), null, 2),
        },
      ],
    })
  );

  return server;
}

export async function startMcpServer() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
