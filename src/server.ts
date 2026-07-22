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
  landlineToPlace,
  nationalIdToPlace,
} from "./lib/extraValidate.js";
import { finglishToPersian, persianToFinglish } from "./lib/finglish.js";
import { createIpgRegistry } from "./ipg/index.js";
import { validateBankTerminalInput } from "./lib/shebaConvert.js";
import { indexLocalDocs, searchLocalDocs, listDocIndexes } from "./lib/docIndex.js";
import { searchCodebase } from "./lib/codeSearch.js";
import { explainErrorText, explainStackTrace } from "./lib/errorExplain.js";
import {
  listRegexPatterns,
  extractWithPattern,
  type RegexPackKey,
} from "./lib/regexPack.js";
import { normalizeDevFinglish, listDevTerms } from "./lib/finglishDev.js";
import { generateMockUserProfile, generateTestDataBatch } from "./lib/userProfile.js";
import { lintRtlSnippet } from "./lib/rtlLint.js";
import { labelsForSchema, labelForField, listKnownFieldLabels } from "./lib/schemaLabels.js";
import { completeAddressForm } from "./lib/addressForm.js";
import { parsePersianSchedulePhrase } from "./lib/schedulerNlp.js";
import {
  validateMoadianInvoiceDetailed,
  explainMoadianField,
  moadianFieldCatalog,
  summarizeMoadianInvoice,
} from "./lib/moadianPlus.js";
import { adviseIpgIntegration, simulateIpgFlow, listIpgGateways } from "./lib/ipgAdvisor.js";
import { syncBankFormFields } from "./lib/bankingSync.js";
import { buildPersianFormSchema, listFormPresets, validateFormValues, type FormPreset } from "./lib/formBuilder.js";
import {
  getBusinessRules,
  calcSampleOrder,
  listBusinessRulePacks,
  type BusinessRulePack,
} from "./lib/businessRules.js";
import { fixRtlSnippet } from "./lib/rtlFix.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const PKG = require("../package.json") as { version: string; name: string };

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
  "persian_bank_terminal",
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
  "iran_national_id_place",
  "iran_gps",
  "iran_banks",
  "iran_geo_meta",
  "moadian_invoice",
  "ipg_mock",
  "mahsaagent_about",
  "local_doc_index",
  "local_doc_search",
  "codebase_search",
  "persian_regex_pack",
  "dev_error_explain",
  "stacktrace_explain_fa",
  "finglish_dev_normalize",
  "mock_user_profile",
  "test_data_batch",
  "rtl_lint_snippet",
  "schema_labels_fa",
  "iran_address_complete",
  "jalali_schedule_parse",
  "moadian_validate",
  "moadian_explain",
  "ipg_advise",
  "ipg_simulate",
  "bank_form_sync",
  "persian_form_schema",
  "iran_business_rules",
  "rtl_fix_snippet",
] as const;

export function createServer() {
  const server = new McpServer({
    name: "mahsaagent",
    version: PKG.version,
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
    "Validate Iranian postal code and return approximate province/city hints from the prefix (not authoritative).",
    { code: z.string() },
    async ({ code }) => json(postalToPlace(code))
  );

  server.tool(
    "iran_cities",
    "Search Iranian cities. Default source is official iran-cities shahr; pass source=legacy|both for the older list.",
    {
      query: z.string().optional(),
      province: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
      source: z.enum(["legacy", "official", "both"]).optional(),
    },
    async ({ query, province, limit, source }) => {
      const src = source ?? "official";
      const lim = limit ?? 20;
      if (province && src !== "official") {
        const legacy = citiesByProvince(province, lim);
        if (src === "legacy") return json(legacy);
        return json({
          legacy,
          official: searchOfficialCities(province, lim),
        });
      }
      if (province && src === "official") {
        return json(searchOfficialCities(province, lim));
      }
      const q = query ?? "";
      if (src === "legacy") return json(searchCities(q, lim));
      if (src === "both") {
        return json({
          legacy: searchCities(q, lim),
          official: searchOfficialCities(q, lim),
        });
      }
      return json(searchOfficialCities(q, lim));
    }
  );

  server.tool(
    "iran_landline",
    "Lookup Iranian landline area code → approximate province/city hint (not authoritative).",
    {
      phone: z.string().optional(),
      listPrefixes: z.boolean().optional(),
    },
    async ({ phone, listPrefixes }) => {
      if (listPrefixes) return json({ prefixes: listProvinceTelPrefixes() });
      if (!phone) return json({ error: "Provide phone or listPrefixes:true" });
      return json(landlineToPlace(phone));
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
    "persian_bank_terminal",
    "Validate terminal-style bank input: sheba alone, or account+bankCode (builds sheba).",
    {
      sheba: z.string().optional(),
      account: z.string().optional(),
      bankCode: z.string().optional(),
    },
    async (args) => json(validateBankTerminalInput(args))
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
    "Structural check for Iranian passport numbers (letter + 8 digits). Does not verify issuance.",
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
    "iran_national_id_place",
    "Lookup issuing city/province from Iranian national ID prefix codes.",
    { nationalId: z.string() },
    async ({ nationalId }) => json(nationalIdToPlace(nationalId))
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
    "Build/validate Moadian tax invoice payload shape + sample + setup guide (no live tax API calls).",
    {
      action: z.enum(["guide", "build", "sample"]).optional(),
      invoice: z.record(z.unknown()).optional(),
      sellerTins: z.string().optional(),
      buyerTin: z.string().optional(),
    },
    async ({ action, invoice, sellerTins, buyerTin }) => {
      const act = action ?? "guide";
      if (act === "guide") return json({ guide: moadianSetupGuide() });
      if (act === "sample") {
        const { buildSampleMoadianInvoice } = await import("./lib/moadianPlus.js");
        return json(buildSampleMoadianInvoice({ sellerTins, buyerTin }));
      }
      if (!invoice) return json({ error: "invoice object required for build" });
      return json(buildMoadianInvoice(invoice as Parameters<typeof buildMoadianInvoice>[0]));
    }
  );

  server.tool(
    "local_doc_index",
    "Index local docs/code text (md/txt/ts/json) for offline MCP search — no internet required.",
    {
      root: z.string(),
      maxFiles: z.number().int().min(1).max(2000).optional(),
      extensions: z.array(z.string()).optional(),
    },
    async ({ root, maxFiles, extensions }) => {
      try {
        return json(indexLocalDocs(root, { maxFiles, extensions }));
      } catch (err) {
        return json({ error: err instanceof Error ? err.message : String(err) });
      }
    }
  );

  server.tool(
    "local_doc_search",
    "Search previously indexed local docs (call local_doc_index first).",
    {
      query: z.string(),
      root: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async ({ query, root, limit }) => json(searchLocalDocs(query, { root, limit }))
  );

  server.tool(
    "codebase_search",
    "Search a repo path with Persian/Finglish/English query variants (offline, best-effort).",
    {
      root: z.string(),
      query: z.string(),
      limit: z.number().int().min(1).max(100).optional(),
      maxFiles: z.number().int().min(1).max(3000).optional(),
    },
    async ({ root, query, limit, maxFiles }) => {
      try {
        return json(searchCodebase(root, query, { limit, maxFiles }));
      } catch (err) {
        return json({ error: err instanceof Error ? err.message : String(err) });
      }
    }
  );

  server.tool(
    "persian_regex_pack",
    "List or extract Iranian data patterns (national ID, mobile, Sheba, postal, …).",
    {
      action: z.enum(["list", "extract"]).optional(),
      pattern: z
        .enum([
          "national_id",
          "mobile",
          "sheba",
          "postal_code",
          "landline",
          "jalali_slash",
          "card_16",
          "plate_old",
        ])
        .optional(),
      text: z.string().optional(),
    },
    async ({ action, pattern, text }) => {
      if ((action ?? "list") === "list") return json({ patterns: listRegexPatterns() });
      if (!pattern || !text) return json({ error: "pattern and text required for extract" });
      return json(extractWithPattern(pattern as RegexPackKey, text));
    }
  );

  server.tool(
    "dev_error_explain",
    "Explain common dev/DevOps error messages in simple Persian (offline pattern KB).",
    { text: z.string() },
    async ({ text }) => json(explainErrorText(text))
  );

  server.tool(
    "stacktrace_explain_fa",
    "Parse a stack trace / error blob and return Persian hints + frame list.",
    { stack: z.string() },
    async ({ stack }) => json(explainStackTrace(stack))
  );

  server.tool(
    "finglish_dev_normalize",
    "Normalize dev Finglish/technical tokens to Persian or English for prompts/commits.",
    {
      text: z.string(),
      target: z.enum(["fa", "en", "both"]).optional(),
      listTerms: z.boolean().optional(),
    },
    async ({ text, target, listTerms }) => {
      if (listTerms) return json({ terms: listDevTerms() });
      return json(normalizeDevFinglish(text, target ?? "both"));
    }
  );

  server.tool(
    "mock_user_profile",
    "Generate a realistic mock Iranian user profile for forms/QA/demo.",
    { seed: z.number().int().optional() },
    async ({ seed }) => json(generateMockUserProfile(seed))
  );

  server.tool(
    "test_data_batch",
    "Batch-generate test users, mobiles, or national IDs for QA seeds.",
    {
      kind: z.enum(["users", "mobiles", "national_ids"]),
      count: z.number().int().min(1).max(50),
      seed: z.number().int().optional(),
    },
    async ({ kind, count, seed }) => json(generateTestDataBatch(kind, count, seed))
  );

  server.tool(
    "rtl_lint_snippet",
    "Lint HTML/CSS/TSX snippet for common RTL issues (logical properties, dir, Tailwind).",
    {
      code: z.string(),
      kind: z.enum(["html", "css", "tsx", "auto"]).optional(),
    },
    async ({ code, kind }) => json(lintRtlSnippet(code, kind ?? "auto"))
  );

  server.tool(
    "schema_labels_fa",
    "Persian labels/hints/errors for form field names (Zod/JSON Schema helpers).",
    {
      fields: z.array(z.string()).optional(),
      field: z.string().optional(),
      listAll: z.boolean().optional(),
    },
    async ({ fields, field, listAll }) => {
      if (listAll) return json({ fields: listKnownFieldLabels() });
      if (field) return json(labelForField(field));
      if (fields?.length) return json({ labels: labelsForSchema(fields) });
      return json({ error: "Provide field, fields[], or listAll:true" });
    }
  );

  server.tool(
    "iran_address_complete",
    "Smart-fill Iranian address form fields from postal/city/province hints + official geo cascade.",
    {
      postalCode: z.string().optional(),
      province: z.string().optional(),
      city: z.string().optional(),
      county: z.string().optional(),
      line: z.string().optional(),
    },
    async (input) => json(completeAddressForm(input))
  );

  server.tool(
    "jalali_schedule_parse",
    "Parse natural Persian schedule phrases with optional time (e.g. پس‌فردا ساعت ۳).",
    { text: z.string() },
    async ({ text }) => json(parsePersianSchedulePhrase(text))
  );

  server.tool(
    "moadian_validate",
    "Validate Moadian invoice payload shape + required fields (offline, no live API).",
    { invoice: z.record(z.unknown()) },
    async ({ invoice }) =>
      json(validateMoadianInvoiceDetailed(invoice as Parameters<typeof validateMoadianInvoiceDetailed>[0]))
  );

  server.tool(
    "moadian_explain",
    "Explain Moadian invoice fields or summarize an invoice.",
    {
      path: z.string().optional(),
      invoice: z.record(z.unknown()).optional(),
      catalog: z.boolean().optional(),
    },
    async ({ path, invoice, catalog }) => {
      if (catalog) return json(moadianFieldCatalog());
      if (path) return json(explainMoadianField(path));
      if (invoice) return json(summarizeMoadianInvoice(invoice as Parameters<typeof summarizeMoadianInvoice>[0]));
      return json({ error: "Provide path, invoice, or catalog:true" });
    }
  );

  server.tool(
    "ipg_advise",
    "Iranian payment gateway integration guide + npm hints (ZarinPal/IdPay/Zibal/mock).",
    {
      gateway: z.string().optional(),
      amount: z.number().optional(),
      callbackUrl: z.string().optional(),
      currency: z.enum(["IRR", "IRT"]).optional(),
      listGateways: z.boolean().optional(),
    },
    async ({ gateway, amount, callbackUrl, currency, listGateways }) => {
      if (listGateways) return json({ gateways: listIpgGateways() });
      return json(adviseIpgIntegration({ gateway, amount, callbackUrl, currency }));
    }
  );

  server.tool(
    "ipg_simulate",
    "Run mock IPG pay+verify flow for local testing.",
    {
      amount: z.number(),
      callbackUrl: z.string(),
      currency: z.enum(["IRR", "IRT"]).optional(),
    },
    async (input) => json(await simulateIpgFlow(input))
  );

  server.tool(
    "bank_form_sync",
    "Detect and fix mismatches between card, Sheba, bank code, and account in forms.",
    {
      card: z.string().optional(),
      sheba: z.string().optional(),
      account: z.string().optional(),
      bankCode: z.string().optional(),
      bankName: z.string().optional(),
    },
    async (input) => json(syncBankFormFields(input))
  );

  server.tool(
    "persian_form_schema",
    "Build Iranian form field presets with Persian labels, runnable Zod schema factory, and optional value validation.",
    {
      preset: z
        .enum(["signup", "checkout", "kyc", "address", "bank", "invoice", "support"])
        .optional(),
      listPresets: z.boolean().optional(),
      values: z.record(z.unknown()).optional(),
    },
    async ({ preset, listPresets, values }) => {
      if (listPresets) return json({ presets: listFormPresets() });
      if (!preset) return json({ error: "Provide preset or listPresets:true" });
      if (values) return json(validateFormValues(preset as FormPreset, values));
      return json(buildPersianFormSchema(preset as FormPreset));
    }
  );

  server.tool(
    "rtl_fix_snippet",
    "Rewrite HTML/CSS/TSX snippet toward RTL-safe logical properties (ml→ms, margin-left→inline-start, …).",
    { code: z.string() },
    async ({ code }) => json(fixRtlSnippet(code))
  );

  server.tool(
    "iran_business_rules",
    "Offline Iranian shop/invoice/shipping/payment/tax business rules reference.",
    {
      pack: z.enum(["shop", "invoice", "shipping", "payment", "tax"]).optional(),
      listPacks: z.boolean().optional(),
      calcOrder: z
        .object({
          subtotalToman: z.number(),
          discountPercent: z.number().optional(),
          vatRate: z.number().optional(),
          shippingZone: z.enum(["tehran", "major", "remote"]).optional(),
        })
        .optional(),
    },
    async ({ pack, listPacks, calcOrder }) => {
      if (listPacks) return json({ packs: listBusinessRulePacks() });
      if (calcOrder) return json(calcSampleOrder(calcOrder));
      return json(getBusinessRules((pack ?? "shop") as BusinessRulePack));
    }
  );

  server.tool(
    "mahsaagent_about",
    "Mahsaagent version, tool list, and quick capability summary.",
    {},
    async () =>
      json({
        name: "mahsaagent",
        version: PKG.version,
        description:
          "Persian developer toolkit: RTL, Jalali, locale validation, geo, banks, offline doc/code search, UI skills",
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
          "iran-ipg",
          "laravel-persian-validation",
        ],
        resources: [
          "mahsaagent://holidays/solar",
          "mahsaagent://iran/provinces",
          "mahsaagent://jalali/months",
          "mahsaagent://iran/banks",
        ],
        exports: [
          "mahsaagent/zod",
          "mahsaagent/jalali",
          "mahsaagent/text",
          "mahsaagent/react",
          "mahsaagent/react/forms",
          "mahsaagent/vue",
          "mahsaagent/moadian",
          "mahsaagent/ipg",
          "mahsaagent/address",
          "mahsaagent/forms",
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
