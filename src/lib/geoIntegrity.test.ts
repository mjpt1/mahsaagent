import test from "node:test";
import assert from "node:assert/strict";
import ostan from "../data/official/ostan.json" with { type: "json" };
import shahrestan from "../data/official/shahrestan.json" with { type: "json" };
import bakhsh from "../data/official/bakhsh.json" with { type: "json" };
import dehestan from "../data/official/dehestan.json" with { type: "json" };
import shahr from "../data/official/shahr.json" with { type: "json" };
import abadi from "../data/official/abadi.json" with { type: "json" };
import meta from "../data/official/meta.json" with { type: "json" };

type Row = { id: number; ostanId?: number; shahrestanId?: number; bakhshId?: number };
type Abadi = [number, string, number, number, number, number, number];

test("official meta provenance fields", () => {
  assert.equal(meta.sourceTag, "v3.0");
  assert.ok(meta.sourceUrl?.includes("iran-cities"));
  assert.equal(meta.license, "MIT");
  assert.ok(meta.importedAt);
});

test("official counts match arrays", () => {
  assert.equal(ostan.length, meta.counts.ostan);
  assert.equal(shahrestan.length, meta.counts.shahrestan);
  assert.equal(bakhsh.length, meta.counts.bakhsh);
  assert.equal(dehestan.length, meta.counts.dehestan);
  assert.equal(shahr.length, meta.counts.shahr);
  assert.equal(abadi.length, meta.counts.abadi);
});

test("official FK integrity sample", () => {
  const ostanIds = new Set((ostan as Row[]).map((o) => o.id));
  const shahrestanIds = new Set((shahrestan as Row[]).map((s) => s.id));
  const bakhshIds = new Set((bakhsh as Row[]).map((b) => b.id));

  for (const s of shahrestan as Row[]) {
    assert.ok(ostanIds.has(s.ostanId!), `shahrestan ${s.id} bad ostanId`);
  }

  for (const b of bakhsh as Row[]) {
    assert.ok(ostanIds.has(b.ostanId!), `bakhsh ${b.id} bad ostanId`);
    assert.ok(shahrestanIds.has(b.shahrestanId!), `bakhsh ${b.id} bad shahrestanId`);
  }

  for (const d of dehestan as Row[]) {
    assert.ok(ostanIds.has(d.ostanId!), `dehestan ${d.id} bad ostanId`);
    assert.ok(shahrestanIds.has(d.shahrestanId!), `dehestan ${d.id} bad shahrestanId`);
    assert.ok(bakhshIds.has(d.bakhshId!), `dehestan ${d.id} bad bakhshId`);
  }

  for (const c of shahr as Row[]) {
    assert.ok(ostanIds.has(c.ostanId!), `shahr ${c.id} bad ostanId`);
    assert.ok(shahrestanIds.has(c.shahrestanId!), `shahr ${c.id} bad shahrestanId`);
  }

  // Spot-check abadi FKs (full scan is fine; 98k is fast enough)
  for (const row of abadi as Abadi[]) {
    const [, , ostanId, shahrestanId, bakhshId] = row;
    assert.ok(ostanIds.has(ostanId), `abadi bad ostanId ${ostanId}`);
    assert.ok(shahrestanIds.has(shahrestanId), `abadi bad shahrestanId ${shahrestanId}`);
    assert.ok(bakhshIds.has(bakhshId), `abadi bad bakhshId ${bakhshId}`);
  }
});
