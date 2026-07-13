#!/usr/bin/env node
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { startMcpServer, TOOL_NAMES } from "./server.js";
import { startHttpMcpServer } from "./httpServer.js";
import { runDemo } from "./demo.js";
import {
  todayJalali,
  formatJalali,
  formatJalaliLong,
  parseJalaliString,
  gregorianToJalali,
  jalaliToGregorian,
} from "./lib/jalali.js";
import {
  normalizePersian,
  validateNationalId,
  validateSheba,
  validateCard,
  validateMobile,
  validatePostalCode,
  validateLegalId,
  amountToPersianWords,
  formatAmountFa,
  wordsToAmount,
  listOrFindProvinces,
  convertDigits,
  slugifyPersian,
} from "./lib/text.js";
import {
  searchCities,
  citiesByProvince,
  listProvinceTelPrefixes,
} from "./lib/geo.js";
import {
  detectFinancial,
  listBanks,
  shebaToAccount,
  accountToSheba,
} from "./lib/financial.js";
import {
  isBusinessDay,
  nextBusinessDay,
  todayBusinessInfo,
} from "./lib/businessDays.js";
import { eventsForDate, eventsForYear } from "./data/events.js";
import { addressCascade, listCounties, listDistricts } from "./lib/address.js";
import { searchVillages } from "./lib/villages.js";
import { polishPersian } from "./lib/polish.js";
import { convertMoney, formatMoneyFa } from "./lib/currency.js";
import { generateTestNationalId, generateTestSheba } from "./lib/generators.js";
import { moadianSetupGuide } from "./moadian/index.js";
import { searchOfficialCities, officialMeta } from "./lib/officialGeo.js";
import { postalToPlace, landlineToPlace } from "./lib/extraValidate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string; name: string };

function printHelp() {
  console.log(
    `
Mahsaagent v${pkg.version} — Persian developer toolkit

Usage:
  mahsaagent                         Start tools server (stdio)
  mahsaagent serve                   Same as above (stdio) — Cursor / Claude Desktop / Codex
  mahsaagent serve-http [--port N]   Streamable HTTP at /mcp — ChatGPT connector / tunnels
  mahsaagent demo                    Live demo
  mahsaagent doctor                  Check install + official geo integrity
  mahsaagent init-mcp [path]         Write MCP config (default: .cursor/mcp.json)
  mahsaagent install-skills [dir]    Copy skills into .cursor/skills
  mahsaagent tools                   List tool names
  mahsaagent today [--en]            Today's Jalali date
  mahsaagent convert <date>          Auto-detect & convert (1405/1/1 or 2026-03-21)
  mahsaagent normalize <text>        Normalize Persian text
  mahsaagent polish <text>           Polish Persian text (virastar-like)
  mahsaagent digits <text> <dir>     en_to_fa | fa_to_en | ar_to_fa
  mahsaagent slug <text>             Persian slug
  mahsaagent validate <kind> <value> national_id|sheba|card|mobile|postal_code|legal_id
  mahsaagent amount <number>         Format + words
  mahsaagent money <n> [from] [to]   Rial/Toman convert (default toman→toman)
  mahsaagent words <text>            Persian words → number
  mahsaagent provinces [query]       List/search provinces
  mahsaagent cities [query]          Search official cities (or --legacy / --province)
  mahsaagent address [--province x]  Cascading address / counties / districts
  mahsaagent villages [query]        Rural settlements by district
  mahsaagent postal <code>           Postal code → province/city hint (approx)
  mahsaagent landline [phone]        Area code → province hint (--list for prefixes)
  mahsaagent financial <value>       Detect card/Sheba + bank
  mahsaagent sheba <mode> ...        sheba_to_account <sheba> | account_to_sheba <code> <acc>
  mahsaagent gen <national_id|sheba> Generate test IDs
  mahsaagent banks                   List bank registry
  mahsaagent business [date]         Business-day check (default: today)
  mahsaagent events [year|date]      Cultural/religious events
  mahsaagent moadian                 Moadian setup guide
  mahsaagent version | help
`.trim()
  );
}

function doctor() {
  const checks = [
    { name: "package.json", path: path.join(root, "package.json") },
    { name: "dist/server.js", path: path.join(root, "dist", "server.js") },
    { name: "dist/data/cities.json", path: path.join(root, "dist", "data", "cities.json") },
    { name: "dist/data/counties.json", path: path.join(root, "dist", "data", "counties.json") },
    { name: "dist/data/official/abadi.json", path: path.join(root, "dist", "data", "official", "abadi.json") },
    { name: "dist/data/official/meta.json", path: path.join(root, "dist", "data", "official", "meta.json") },
    { name: "docs/site", path: path.join(root, "docs", "site", "index.html") },
    { name: "skills/jalali-datepicker", path: path.join(root, "skills", "jalali-datepicker", "SKILL.md") },
    { name: "skills/iran-forms-kit", path: path.join(root, "skills", "iran-forms-kit", "SKILL.md") },
    { name: "skills/iran-ipg", path: path.join(root, "skills", "iran-ipg", "SKILL.md") },
    { name: "extension", path: path.join(root, "extension", "extension.js") },
    { name: "THIRD_PARTY_NOTICES.md", path: path.join(root, "THIRD_PARTY_NOTICES.md") },
  ];
  console.log(`Mahsaagent doctor (v${pkg.version})\nRoot: ${root}\nNode: ${process.version}\n`);
  let ok = true;
  for (const c of checks) {
    const exists = fs.existsSync(c.path);
    console.log(`${exists ? "✓" : "✗"} ${c.name}`);
    if (!exists) ok = false;
  }

  try {
    const meta = officialMeta() as {
      counts?: { abadi?: number; shahr?: number; ostan?: number };
      sourceTag?: string;
      license?: string;
    };
    const abadi = meta.counts?.abadi ?? 0;
    const shahr = meta.counts?.shahr ?? 0;
    const ostan = meta.counts?.ostan ?? 0;
    const geoOk = abadi > 50000 && shahr > 1000 && ostan === 31;
    console.log(
      `${geoOk ? "✓" : "✗"} official geo counts (ostan=${ostan}, shahr=${shahr}, abadi=${abadi}, tag=${meta.sourceTag ?? "?"})`
    );
    if (!geoOk) ok = false;
    if (meta.license && meta.license !== "MIT") {
      console.log(`! geo license field: ${meta.license}`);
    }
  } catch (err) {
    console.log(`✗ official geo meta (${err instanceof Error ? err.message : String(err)})`);
    ok = false;
  }

  const nid = validateNationalId("0499370899");
  console.log(`${nid.valid ? "✓" : "✗"} sample national_id checksum`);
  if (!nid.valid) ok = false;

  const toolsOk = TOOL_NAMES.length >= 40;
  console.log(`${toolsOk ? "✓" : "✗"} tool registry (${TOOL_NAMES.length})`);
  if (!toolsOk) ok = false;

  console.log("\nInstall note: prefer git clone + build until the package is published on npm.");
  console.log("HTTP tip: set MAHSAAGENT_TOKEN before tunneling serve-http.");

  if (!ok) {
    console.log("\nRun: npm install && npm run build");
    process.exitCode = 1;
  } else {
    console.log("\nAll good.");
  }
}

function initMcp(targetArg?: string) {
  const target = path.resolve(targetArg ?? path.join(process.cwd(), ".cursor", "mcp.json"));
  const entry = path.join(root, "dist", "index.js");
  if (!fs.existsSync(entry)) {
    console.error("dist/index.js missing — run npm run build first");
    process.exit(1);
  }
  const cfg = {
    mcpServers: {
      mahsaagent: {
        command: "node",
        args: [entry],
      },
    },
  };
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (fs.existsSync(target)) {
    console.error(`Refusing to overwrite existing ${target}`);
    console.error("Pass a new path, or delete/rename the file first.");
    process.exit(1);
  }
  fs.writeFileSync(target, `${JSON.stringify(cfg, null, 2)}\n`, "utf8");
  console.log(`Wrote ${target}`);
  console.log("Restart the MCP client to load Mahsaagent tools.");
}

function listTools() {
  console.log("Mahsaagent tool names:\n");
  for (const t of TOOL_NAMES) console.log(`  • ${t}`);
  console.log(`\nTotal: ${TOOL_NAMES.length}`);
}

function installSkills(targetArg?: string) {
  const target = path.resolve(targetArg ?? path.join(process.cwd(), ".cursor", "skills"));
  const src = path.join(root, "skills");
  if (!fs.existsSync(src)) {
    console.error("skills/ not found");
    process.exit(1);
  }
  fs.mkdirSync(target, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const from = path.join(src, name);
    const to = path.join(target, name);
    if (!fs.statSync(from).isDirectory()) continue;
    fs.cpSync(from, to, { recursive: true });
    console.log(`✓ ${name} → ${to}`);
  }
  console.log(`\nSkills installed into ${target}`);
}

function cmdToday(args: string[]) {
  const en = args.includes("--en");
  const t = todayJalali();
  const digits = en ? "en" : "fa";
  console.log(formatJalali(t, { digits }));
  console.log(formatJalaliLong(t, { digits }));
}

function cmdConvert(raw?: string) {
  if (!raw) {
    console.error("Usage: mahsaagent convert <1405/04/21|2026-03-21>");
    process.exit(1);
  }
  const en = raw.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
  const m = en.match(/^(\d{3,4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (!m) {
    console.error("Unrecognized date");
    process.exit(1);
  }
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const preferGregorian = year >= 1700;
  if (preferGregorian) {
    const j = gregorianToJalali(year, month, day);
    console.log("Gregorian → Jalali:", formatJalali(j, { digits: "fa" }), "/", formatJalaliLong(j));
    return;
  }
  const jalali = parseJalaliString(raw);
  if (jalali) {
    const g = jalaliToGregorian(jalali.year, jalali.month, jalali.day);
    console.log(
      "Jalali → Gregorian:",
      `${g.year}-${String(g.month).padStart(2, "0")}-${String(g.day).padStart(2, "0")}`
    );
    return;
  }
  console.error("Unrecognized or invalid date");
  process.exit(1);
}

function cmdValidate(kind?: string, value?: string) {
  if (!kind || !value) {
    console.error("Usage: mahsaagent validate <kind> <value>");
    process.exit(1);
  }
  const map: Record<string, (v: string) => unknown> = {
    national_id: validateNationalId,
    legal_id: validateLegalId,
    sheba: validateSheba,
    card: validateCard,
    mobile: validateMobile,
    postal_code: validatePostalCode,
  };
  const fn = map[kind];
  if (!fn) {
    console.error("kind: national_id|legal_id|sheba|card|mobile|postal_code");
    process.exit(1);
  }
  console.log(JSON.stringify(fn(value), null, 2));
}

function cmdCities(args: string[]) {
  const legacy = args.includes("--legacy");
  const filtered = args.filter((a) => a !== "--legacy");
  const provIdx = filtered.indexOf("--province");
  if (provIdx >= 0) {
    const province = filtered[provIdx + 1];
    if (!province) {
      console.error("Usage: mahsaagent cities --province <name> [--legacy]");
      process.exit(1);
    }
    if (legacy) {
      console.log(JSON.stringify(citiesByProvince(province), null, 2));
    } else {
      console.log(JSON.stringify(searchOfficialCities(province), null, 2));
    }
    return;
  }
  const query = filtered.join(" ").trim();
  if (legacy) {
    console.log(JSON.stringify(searchCities(query), null, 2));
  } else {
    console.log(JSON.stringify(searchOfficialCities(query), null, 2));
  }
}

function cmdAddress(args: string[]) {
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };
  if (args.includes("--counties")) {
    console.log(JSON.stringify(listCounties(get("--province"), 80), null, 2));
    return;
  }
  if (args.includes("--districts")) {
    console.log(
      JSON.stringify(listDistricts({ province: get("--province"), county: get("--county"), limit: 80 }), null, 2)
    );
    return;
  }
  console.log(
    JSON.stringify(
      addressCascade({
        province: get("--province"),
        county: get("--county"),
        cityQuery: get("--city"),
      }),
      null,
      2
    )
  );
}

function cmdBusiness(raw?: string) {
  if (!raw) {
    console.log(JSON.stringify(todayBusinessInfo(), null, 2));
    return;
  }
  const parts = parseJalaliString(raw);
  if (!parts) {
    console.error("Usage: mahsaagent business [1405/01/05]");
    process.exit(1);
  }
  console.log(
    JSON.stringify(
      {
        date: parts,
        isBusinessDay: isBusinessDay(parts),
        nextBusinessDay: nextBusinessDay(parts),
      },
      null,
      2
    )
  );
}

function cmdEvents(raw?: string) {
  if (!raw) {
    const t = todayJalali();
    console.log(
      JSON.stringify(
        {
          year: t.year,
          month: t.month,
          day: t.day,
          events: eventsForDate(t.year, t.month, t.day),
        },
        null,
        2
      )
    );
    return;
  }
  const asDate = parseJalaliString(raw);
  if (asDate) {
    console.log(
      JSON.stringify(
        {
          year: asDate.year,
          month: asDate.month,
          day: asDate.day,
          events: eventsForDate(asDate.year, asDate.month, asDate.day),
        },
        null,
        2
      )
    );
    return;
  }
  const year = Number(raw);
  if (!Number.isFinite(year)) {
    console.error("Usage: mahsaagent events [1405|1405/01/01]");
    process.exit(1);
  }
  console.log(JSON.stringify({ year, events: eventsForYear(year) }, null, 2));
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);

  if (!cmd || cmd === "serve") {
    await startMcpServer();
    return;
  }

  if (cmd === "serve-http" || cmd === "http") {
    const portIdx = rest.indexOf("--port");
    const hostIdx = rest.indexOf("--host");
    const port = portIdx >= 0 ? Number(rest[portIdx + 1]) : undefined;
    const host = hostIdx >= 0 ? rest[hostIdx + 1] : undefined;
    await startHttpMcpServer({ host, port });
    return;
  }

  switch (cmd) {
    case "demo":
      await runDemo();
      break;
    case "doctor":
      doctor();
      break;
    case "init-mcp":
      initMcp(rest[0]);
      break;
    case "install-skills":
      installSkills(rest[0]);
      break;
    case "tools":
      listTools();
      break;
    case "today":
      cmdToday(rest);
      break;
    case "convert":
      cmdConvert(rest[0]);
      break;
    case "normalize":
      console.log(normalizePersian(rest.join(" ") || "", { halfSpace: true, digits: "keep" }));
      break;
    case "polish":
      console.log(polishPersian(rest.join(" ") || "", { digits: "fa", zwnj: true }));
      break;
    case "digits": {
      const dir = rest[1] as "en_to_fa" | "fa_to_en" | "ar_to_fa";
      if (!rest[0] || !dir) {
        console.error("Usage: mahsaagent digits <text> <en_to_fa|fa_to_en|ar_to_fa>");
        process.exit(1);
      }
      console.log(convertDigits(rest[0], dir));
      break;
    }
    case "slug":
      console.log(slugifyPersian(rest.join(" ")));
      break;
    case "validate":
      cmdValidate(rest[0], rest[1]);
      break;
    case "amount":
      console.log(formatAmountFa(rest[0] ?? ""), "/", amountToPersianWords(rest[0] ?? ""));
      break;
    case "money": {
      const amount = rest[0];
      const from = (rest[1] as "rial" | "toman") || "toman";
      const to = (rest[2] as "rial" | "toman") || from;
      if (!amount) {
        console.error("Usage: mahsaagent money <amount> [rial|toman] [rial|toman]");
        process.exit(1);
      }
      const r = convertMoney(amount, from, to);
      console.log(JSON.stringify({ ...r, labeled: formatMoneyFa(r.value, to) }, null, 2));
      break;
    }
    case "words":
      console.log(JSON.stringify(wordsToAmount(rest.join(" ")), null, 2));
      break;
    case "provinces":
      console.log(JSON.stringify(listOrFindProvinces(rest.join(" ") || undefined), null, 2));
      break;
    case "cities":
      cmdCities(rest);
      break;
    case "address":
      cmdAddress(rest);
      break;
    case "villages":
      console.log(
        JSON.stringify(
          searchVillages(rest.filter((a) => !a.startsWith("--")).join(" "), {
            province: rest.includes("--province") ? rest[rest.indexOf("--province") + 1] : undefined,
            county: rest.includes("--county") ? rest[rest.indexOf("--county") + 1] : undefined,
          }),
          null,
          2
        )
      );
      break;
    case "postal":
      if (!rest[0]) {
        console.error("Usage: mahsaagent postal <code>");
        process.exit(1);
      }
      console.log(JSON.stringify(postalToPlace(rest[0]), null, 2));
      break;
    case "landline":
      if (rest.includes("--list")) {
        console.log(JSON.stringify(listProvinceTelPrefixes(), null, 2));
      } else if (!rest[0]) {
        console.error("Usage: mahsaagent landline <phone> | --list");
        process.exit(1);
      } else {
        console.log(JSON.stringify(landlineToPlace(rest[0]), null, 2));
      }
      break;
    case "financial":
      if (!rest[0]) {
        console.error("Usage: mahsaagent financial <card|sheba>");
        process.exit(1);
      }
      console.log(JSON.stringify(detectFinancial(rest.join("")), null, 2));
      break;
    case "sheba": {
      const mode = rest[0];
      if (mode === "sheba_to_account" && rest[1]) {
        console.log(JSON.stringify(shebaToAccount(rest[1]), null, 2));
      } else if (mode === "account_to_sheba" && rest[1] && rest[2]) {
        console.log(JSON.stringify(accountToSheba(rest[1], rest[2]), null, 2));
      } else {
        console.error("Usage: mahsaagent sheba sheba_to_account <IR...> | account_to_sheba <code> <account>");
        process.exit(1);
      }
      break;
    }
    case "gen":
      if (rest[0] === "national_id") console.log(generateTestNationalId(Number(rest[1]) || undefined));
      else if (rest[0] === "sheba") console.log(generateTestSheba(rest[1] ?? "054", Number(rest[2]) || undefined));
      else {
        console.error("Usage: mahsaagent gen national_id [seed] | sheba [bankCode] [seed]");
        process.exit(1);
      }
      break;
    case "banks":
      console.log(JSON.stringify({ banks: listBanks() }, null, 2));
      break;
    case "business":
      cmdBusiness(rest[0]);
      break;
    case "events":
      cmdEvents(rest[0]);
      break;
    case "moadian":
      console.log(moadianSetupGuide());
      break;
    case "version":
    case "-V":
    case "--version":
      console.log(pkg.version);
      break;
    case "help":
    case "-h":
    case "--help":
      printHelp();
      break;
    default:
      console.error(`Unknown command: ${cmd}\n`);
      printHelp();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
