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
import { detectFinancial, listBanks } from "./lib/financial.js";

export const TOOL_NAMES = [
  "jalali_today",
  "jalali_convert",
  "jalali_shift",
  "jalali_holidays",
  "jalali_month",
  "jalali_business_day",
  "jalali_events",
  "persian_normalize",
  "persian_digits",
  "persian_slugify",
  "persian_validate",
  "persian_batch_validate",
  "persian_plate",
  "persian_bill",
  "persian_extract_cards",
  "persian_amount",
  "persian_words_to_number",
  "persian_time_ago",
  "persian_remaining",
  "persian_financial",
  "iran_provinces",
  "iran_cities",
  "iran_postal",
  "iran_landline",
  "iran_banks",
  "mahsaagent_about",
] as const;

export function createServer() {
  const server = new McpServer({
    name: "mahsaagent",
    version: "0.4.0",
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
          officialSolar: holidaysForJalaliDate(year, month, day),
        });
      }
      return json({
        year,
        events: eventsForYear(year),
        note: "Religious entries are approximate (±1 day possible).",
      });
    }
  );

  server.tool(
    "iran_cities",
    "Search Iranian cities (1195+) or list cities of a province.",
    {
      query: z.string().optional(),
      province: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async ({ query, province, limit }) => {
      if (province) return json(citiesByProvince(province, limit ?? 50));
      return json(searchCities(query ?? "", limit ?? 20));
    }
  );

  server.tool(
    "iran_postal",
    "Validate Iranian postal code and infer province from prefix.",
    { code: z.string() },
    async ({ code }) => json(lookupPostalCode(code))
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
    "Detect and validate Iranian bank card or Sheba; attach bank registry info.",
    { value: z.string() },
    async ({ value }) => json(detectFinancial(value))
  );

  server.tool(
    "iran_banks",
    "List Iranian banks in the local registry (name, sheba code, card prefixes).",
    {},
    async () => json({ banks: listBanks() })
  );

  server.tool(
    "mahsaagent_about",
    "Mahsaagent version, tool list, and quick capability summary.",
    {},
    async () =>
      json({
        name: "mahsaagent",
        version: "0.4.0",
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
        ],
        resources: [
          "mahsaagent://holidays/solar",
          "mahsaagent://iran/provinces",
          "mahsaagent://jalali/months",
          "mahsaagent://iran/banks",
        ],
        zod: "import from mahsaagent/zod",
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
