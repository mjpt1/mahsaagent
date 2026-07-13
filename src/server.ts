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

export const TOOL_NAMES = [
  "jalali_today",
  "jalali_convert",
  "jalali_shift",
  "jalali_holidays",
  "jalali_month",
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
  "iran_provinces",
  "mahsaagent_about",
] as const;

export function createServer() {
  const server = new McpServer({
    name: "mahsaagent",
    version: "0.3.0",
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
    "mahsaagent_about",
    "Mahsaagent version, tool list, and quick capability summary.",
    {},
    async () =>
      json({
        name: "mahsaagent",
        version: "0.3.0",
        description: "Persian developer toolkit: RTL, Jalali, locale validation, UI skills",
        tools: TOOL_NAMES,
        toolCount: TOOL_NAMES.length,
        skills: ["persian-ui", "rtl-layout", "jalali-dates", "persian-forms", "persian-copy"],
        resources: [
          "mahsaagent://holidays/solar",
          "mahsaagent://iran/provinces",
          "mahsaagent://jalali/months",
        ],
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

  return server;
}

export async function startMcpServer() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
