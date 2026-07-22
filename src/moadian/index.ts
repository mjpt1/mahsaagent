/**
 * Moadian invoice helpers — full local validation + math check.
 * No live tax API / signing (keep secrets in your backend).
 */

export type MoadianInvoiceHeader = {
  taxid?: string;
  indatim: string;
  inty: number;
  inp: number;
  inso: number;
  tins: string;
  tinb?: string;
  tob?: number;
  setm?: number;
};

export type MoadianInvoiceBodyItem = {
  sstid: string;
  sstt: string;
  am: number;
  fee: number;
  prdis: number;
  dis: number;
  adis: number;
  vra: number;
  vam: number;
  tsstam: number;
};

export type MoadianInvoice = {
  header: MoadianInvoiceHeader;
  body: MoadianInvoiceBodyItem[];
  payments?: Array<{ iinn?: string; acn?: string; trmn?: string; pmt?: number; pdt?: number }>;
};

export type MoadianConfig = {
  memoryId: string;
  privateKeyPem?: string;
  certificatePem?: string;
  baseUrl?: string;
};

function near(a: number, b: number, eps = 1) {
  return Math.abs(a - b) <= eps;
}

/** Recompute line amounts from qty × unit price, discount, VAT. */
export function computeMoadianLine(input: {
  sstid: string;
  sstt: string;
  am: number;
  fee: number;
  dis?: number;
  vra?: number;
}): MoadianInvoiceBodyItem {
  const am = Number(input.am) || 0;
  const fee = Number(input.fee) || 0;
  const dis = Number(input.dis) || 0;
  const vra = input.vra ?? 10;
  const prdis = Math.round(am * fee);
  const adis = Math.max(0, prdis - dis);
  const vam = Math.round(adis * (vra / 100));
  const tsstam = adis + vam;
  return {
    sstid: input.sstid,
    sstt: input.sstt,
    am,
    fee,
    prdis,
    dis,
    adis,
    vra,
    vam,
    tsstam,
  };
}

export function buildSampleMoadianInvoice(opts?: {
  sellerTins?: string;
  buyerTin?: string;
  lines?: Array<{ sstid: string; sstt: string; am: number; fee: number; dis?: number; vra?: number }>;
}) {
  const body = (opts?.lines ?? [
    { sstid: "2710000123456", sstt: "کالای نمونه", am: 2, fee: 100000, dis: 0, vra: 10 },
  ]).map(computeMoadianLine);
  const invoice: MoadianInvoice = {
    header: {
      indatim: new Date().toISOString(),
      inty: 1,
      inp: 1,
      inso: 1,
      tins: opts?.sellerTins ?? "10100314565",
      tinb: opts?.buyerTin,
      tob: opts?.buyerTin ? 1 : undefined,
      setm: 1,
    },
    body,
  };
  return buildMoadianInvoice(invoice);
}

export function buildMoadianInvoice(input: MoadianInvoice): {
  payload: MoadianInvoice;
  warnings: string[];
  mathErrors: string[];
  totals: { lines: number; taxable: number; vat: number; grand: number };
} {
  const warnings: string[] = [];
  const mathErrors: string[] = [];
  if (!input.header?.tins) warnings.push("seller economic code (tins) is required");
  if (!input.header?.indatim) warnings.push("indatim (issue datetime) is required");
  if (!input.body?.length) warnings.push("body items required");

  for (const [i, row] of (input.body ?? []).entries()) {
    if (!row.sstid) warnings.push(`body[${i}].sstid missing`);
    if (!row.sstt) warnings.push(`body[${i}].sstt missing`);
    const expectedPrdis = Math.round(Number(row.am) * Number(row.fee));
    const expectedAdis = Math.max(0, expectedPrdis - Number(row.dis || 0));
    const expectedVam = Math.round(expectedAdis * (Number(row.vra || 0) / 100));
    const expectedTotal = expectedAdis + expectedVam;
    if (!near(Number(row.prdis), expectedPrdis)) {
      mathErrors.push(`body[${i}].prdis expected ~${expectedPrdis}, got ${row.prdis}`);
    }
    if (!near(Number(row.adis), expectedAdis)) {
      mathErrors.push(`body[${i}].adis expected ~${expectedAdis}, got ${row.adis}`);
    }
    if (!near(Number(row.vam), expectedVam)) {
      mathErrors.push(`body[${i}].vam expected ~${expectedVam}, got ${row.vam}`);
    }
    if (!near(Number(row.tsstam), expectedTotal)) {
      mathErrors.push(`body[${i}].tsstam expected ~${expectedTotal}, got ${row.tsstam}`);
    }
  }

  const taxable = (input.body ?? []).reduce((s, r) => s + (Number(r.adis) || 0), 0);
  const vat = (input.body ?? []).reduce((s, r) => s + (Number(r.vam) || 0), 0);
  return {
    payload: input,
    warnings,
    mathErrors,
    totals: {
      lines: input.body?.length ?? 0,
      taxable,
      vat,
      grand: taxable + vat,
    },
  };
}

export function moadianSetupGuide(): string {
  return [
    "Moadian integration checklist:",
    "1. Obtain fiscal memory id + signing certificate from tax.gov.ir / intamedia.",
    "2. Keep private key outside the repo (env/secret store).",
    "3. Use buildMoadianInvoice() / moadian_validate to check local payload + line math.",
    "4. Sign with JWS/JWE per current Moadian API v2 docs, then POST from your secure backend.",
    "5. Mahsaagent does not ship live credentials or network calls to the tax authority.",
    "6. buildSampleMoadianInvoice() generates a valid local demo payload.",
  ].join("\n");
}

export function createMoadianClient(config: MoadianConfig) {
  return {
    config: {
      memoryId: config.memoryId,
      baseUrl: config.baseUrl ?? "https://tp.tax.gov.ir",
      hasKey: Boolean(config.privateKeyPem),
      hasCert: Boolean(config.certificatePem),
    },
    build: buildMoadianInvoice,
    sample: buildSampleMoadianInvoice,
    computeLine: computeMoadianLine,
    guide: moadianSetupGuide,
    async submit(_invoice: MoadianInvoice) {
      return {
        ok: false as const,
        error: "live_submit_disabled" as const,
        message:
          "Live Moadian submit is disabled in Mahsaagent. Sign and POST with your own secure backend.",
        nextStepsFa: [
          "payload را با moadian_validate چک کنید",
          "با گواهی ثبت‌شده امضا (JWS/JWE) کنید",
          "از backend امن به endpoint رسمی POST کنید",
        ],
      };
    },
  };
}
