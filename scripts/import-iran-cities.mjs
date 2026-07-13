/**
 * Import ahmadazizi/iran-cities v3 CSV → compact JSON under src/data/official/
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "tmp-iran-cities");
const dest = path.join(root, "src", "data", "official");

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    // names can contain commas rarely — iran-cities fields are simple
    const cols = line.split(",");
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

function read(name) {
  return parseCsv(fs.readFileSync(path.join(src, name), "utf8"));
}

fs.mkdirSync(dest, { recursive: true });

const ostan = read("ostan.csv").map((r) => ({
  id: Number(r.id),
  name: r.name,
  amarCode: r.amar_code,
}));

const shahrestan = read("shahrestan.csv").map((r) => ({
  id: Number(r.id),
  name: r.name,
  ostanId: Number(r.ostan),
  amarCode: r.amar_code,
}));

const bakhsh = read("bakhsh.csv").map((r) => ({
  id: Number(r.id),
  name: r.name,
  ostanId: Number(r.ostan),
  shahrestanId: Number(r.shahrestan),
  amarCode: r.amar_code,
}));

const dehestan = read("dehestan.csv").map((r) => ({
  id: Number(r.id),
  name: r.name,
  ostanId: Number(r.ostan),
  shahrestanId: Number(r.shahrestan),
  bakhshId: Number(r.bakhsh),
  amarCode: r.amar_code,
}));

const shahr = read("shahr.csv").map((r) => ({
  id: Number(r.id),
  name: r.name,
  type: Number(r.shahr_type || 0),
  ostanId: Number(r.ostan),
  shahrestanId: Number(r.shahrestan),
  bakhshId: Number(r.bakhsh),
  amarCode: r.amar_code,
}));

// Compact villages: [id, name, ostanId, shahrestanId, bakhshId, dehestanId, type]
const abadiRaw = read("abadi.csv");
const abadi = abadiRaw.map((r) => [
  Number(r.id),
  r.name,
  Number(r.ostan),
  Number(r.shahrestan),
  Number(r.bakhsh),
  Number(r.dehestan),
  Number(r.abadi_type || 0),
]);

const ostanById = Object.fromEntries(ostan.map((o) => [o.id, o.name]));

function assertNonEmpty(name, arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error(`Import failed: ${name} is empty`);
  }
}

assertNonEmpty("ostan", ostan);
assertNonEmpty("shahrestan", shahrestan);
assertNonEmpty("bakhsh", bakhsh);
assertNonEmpty("dehestan", dehestan);
assertNonEmpty("shahr", shahr);
assertNonEmpty("abadi", abadi);

const ostanIds = new Set(ostan.map((o) => o.id));
const badCounty = shahrestan.find((s) => !ostanIds.has(s.ostanId));
if (badCounty) {
  throw new Error(`Import failed: shahrestan ${badCounty.id} has unknown ostanId ${badCounty.ostanId}`);
}

const importedAt = new Date().toISOString().slice(0, 10);

fs.writeFileSync(path.join(dest, "ostan.json"), JSON.stringify(ostan));
fs.writeFileSync(path.join(dest, "shahrestan.json"), JSON.stringify(shahrestan));
fs.writeFileSync(path.join(dest, "bakhsh.json"), JSON.stringify(bakhsh));
fs.writeFileSync(path.join(dest, "dehestan.json"), JSON.stringify(dehestan));
fs.writeFileSync(path.join(dest, "shahr.json"), JSON.stringify(shahr));
fs.writeFileSync(path.join(dest, "abadi.json"), JSON.stringify(abadi));
fs.writeFileSync(
  path.join(dest, "meta.json"),
  JSON.stringify(
    {
      source: "ahmadazizi/iran-cities",
      sourceUrl: "https://github.com/ahmadazizi/iran-cities",
      sourceTag: "v3.0",
      sourceReleaseUrl: "https://github.com/ahmadazizi/iran-cities/releases/tag/v3.0",
      importedAt,
      license: "MIT",
      licenseNote: "Upstream MIT; see THIRD_PARTY_NOTICES.md and docs/GEO-SOURCE.md",
      counts: {
        ostan: ostan.length,
        shahrestan: shahrestan.length,
        bakhsh: bakhsh.length,
        dehestan: dehestan.length,
        shahr: shahr.length,
        abadi: abadi.length,
      },
      sampleProvince: ostanById[1],
    },
    null,
    2
  )
);

console.log("Wrote official geo →", dest);
console.log(JSON.parse(fs.readFileSync(path.join(dest, "meta.json"), "utf8")).counts);
