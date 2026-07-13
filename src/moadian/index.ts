/**
 * Moadian (Iranian tax invoice system) — client stub.
 * Builds invoice payloads and documents required auth; does not call live tax APIs.
 */

export type MoadianInvoiceHeader = {
  taxid?: string;
  indatim: string; // ISO or jalali datetime string
  inty: number; // invoice type
  inp: number; // pattern
  inso: number; // subject
  tins: string; // seller economic code
  tinb?: string; // buyer
  tob?: number;
  setm?: number;
};

export type MoadianInvoiceBodyItem = {
  sstid: string; // stuff id
  sstt: string; // title
  am: number; // amount
  fee: number; // unit price
  prdis: number;
  dis: number;
  adis: number;
  vra: number; // VAT rate
  vam: number; // VAT amount
  tsstam: number; // total
};

export type MoadianInvoice = {
  header: MoadianInvoiceHeader;
  body: MoadianInvoiceBodyItem[];
  payments?: Array<{ iinn?: string; acn?: string; trmn?: string; pmt?: number; pdt?: number }>;
};

export type MoadianConfig = {
  /** Memory ID from tax portal */
  memoryId: string;
  /** Private key PEM for JWS (not stored by Mahsaagent) */
  privateKeyPem?: string;
  /** Certificate for signing */
  certificatePem?: string;
  baseUrl?: string;
};

export function buildMoadianInvoice(input: MoadianInvoice): {
  payload: MoadianInvoice;
  warnings: string[];
} {
  const warnings: string[] = [];
  if (!input.header.tins) warnings.push("seller economic code (tins) is required");
  if (!input.body?.length) warnings.push("body items required");
  for (const [i, row] of (input.body ?? []).entries()) {
    if (!row.sstid) warnings.push(`body[${i}].sstid missing`);
  }
  return { payload: input, warnings };
}

export function moadianSetupGuide(): string {
  return [
    "Moadian integration checklist:",
    "1. Obtain fiscal memory id + signing certificate from tax.gov.ir / intamedia.",
    "2. Keep private key outside the repo (env/secret store).",
    "3. Use buildMoadianInvoice() to validate local payload shape.",
    "4. Sign with JWS/JWE per current Moadian API v2 docs, then POST to the official endpoint.",
    "5. Mahsaagent does not ship live credentials or network calls to the tax authority.",
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
    guide: moadianSetupGuide,
    async submit(_invoice: MoadianInvoice) {
      return {
        ok: false as const,
        error: "live_submit_disabled",
        message:
          "Live Moadian submit is disabled in Mahsaagent. Sign and POST with your own secure backend.",
      };
    },
  };
}
